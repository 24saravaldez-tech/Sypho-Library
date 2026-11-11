import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { createServer } from 'vite'

// Vite transforma TypeScript e import.meta.env igual que en la aplicación.
// fetch se simula: ninguna prueba escribe en PostgreSQL.
let vite
let store
let librosApi
let apiModule
const originalFetch = globalThis.fetch
const previousApiUrl = process.env.VITE_API_URL
const filtros = { titulo: '', pagina: 1, limite: 5, ordenarPor: 'titulo', orden: 'asc' }
const libro = {
  id: 7, titulo: 'Libro de prueba', descripcion: null, tipo_lectura_id: 1,
  estado: 'PENDIENTE', inicio_lectura: null, fin_lectura: null, calificacion: null,
  pagina_actual: null, segundo_actual: null, resena: null, portada_url: null,
  creado_en: '2026-11-10T00:00:00.000Z', autor_nombre: 'Autora',
  autor_detalles: null, categoria_nombre: 'Novela', tipo_lectura_nombre: 'Físico',
}
const guardado = { id: 7, titulo: libro.titulo, anio: 2020, descripcion: null, autor_id: 1, categoria_id: 1, tipo_lectura_id: 1 }
const json = (data, status = 200) => new Response(JSON.stringify({ success: status < 400, message: status < 400 ? 'OK' : 'No encontrado', data }), { status })
const esperar = async (condicion) => {
  for (let i = 0; i < 100; i++) {
    if (condicion()) return
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  assert.fail('No se actualizó la caché dentro del tiempo esperado')
}

before(async () => {
  process.env.VITE_API_URL = 'http://backend.test'
  vite = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false, ws: false } })
  apiModule = await vite.ssrLoadModule('/src/api/libros.ts')
  librosApi = apiModule.librosApi
  ;({ store } = await vite.ssrLoadModule('/src/app/store.ts'))
})
beforeEach(() => store.dispatch(librosApi.util.resetApiState()))
afterEach(() => {
  store.dispatch(librosApi.util.resetApiState())
  globalThis.fetch = originalFetch
})
after(async () => {
  await vite?.close()
  if (previousApiUrl === undefined) delete process.env.VITE_API_URL
  else process.env.VITE_API_URL = previousApiUrl
})

test('genera hooks, extrae el envoltorio y reutiliza la caché para los mismos filtros', async () => {
  assert.equal(typeof apiModule.useListarLibrosQuery, 'function')
  assert.equal(typeof apiModule.useCrearLibroMutation, 'function')
  let peticiones = 0
  globalThis.fetch = async (request) => {
    peticiones++
    const url = new URL(request.url)
    assert.equal(url.pathname, '/api/sypho-library/books/all')
    assert.equal(url.searchParams.get('limite'), '5')
    return json({ libros: [libro], total: 1, pagina: 1, limite: 5 })
  }
  const primera = store.dispatch(librosApi.endpoints.listarLibros.initiate(filtros))
  assert.deepEqual((await primera.unwrap()).libros, [libro])
  const segunda = store.dispatch(librosApi.endpoints.listarLibros.initiate({ ...filtros }))
  await segunda.unwrap()
  assert.equal(peticiones, 1)
  const otraPagina = store.dispatch(librosApi.endpoints.listarLibros.initiate({ ...filtros, pagina: 2 }))
  await otraPagina.unwrap()
  assert.equal(peticiones, 2)
  primera.unsubscribe()
  segunda.unsubscribe()
  otraPagina.unsubscribe()
})

test('crear y eliminar envían el cuerpo correcto y actualizan una lista con suscripción activa', async () => {
  let libros = [libro]
  let consultas = 0
  globalThis.fetch = async (request) => {
    const path = new URL(request.url).pathname
    if (request.method === 'POST') {
      assert.equal(path, '/api/sypho-library/books/new')
      assert.deepEqual(await request.json(), guardadoSinId())
      libros = [libro, { ...libro, id: 8 }]
      return json({ ...guardado, id: 8 }, 201)
    }
    if (request.method === 'DELETE') {
      assert.equal(path, '/api/sypho-library/books/delete/7')
      libros = libros.filter((l) => l.id !== 7)
      return json(guardado)
    }
    consultas++
    return json({ libros, total: libros.length, pagina: 1, limite: 5 })
  }
  const lista = store.dispatch(librosApi.endpoints.listarLibros.initiate(filtros))
  await lista.unwrap()
  const creado = await store.dispatch(librosApi.endpoints.crearLibro.initiate(guardadoSinId())).unwrap()
  assert.equal(creado.id, 8)
  const datos = () => librosApi.endpoints.listarLibros.select(filtros)(store.getState()).data
  await esperar(() => datos()?.total === 2)
  await store.dispatch(librosApi.endpoints.eliminarLibro.initiate(7)).unwrap()
  await esperar(() => datos()?.total === 1 && datos()?.libros[0].id === 8)
  assert.equal(consultas, 3)
  lista.unsubscribe()
})

function guardadoSinId() {
  const { id: _id, ...nuevo } = guardado
  return nuevo
}

test('detalle y catálogo extraen data; los errores HTTP llegan a unwrap', async () => {
  globalThis.fetch = async (request) => {
    const path = new URL(request.url).pathname
    if (path.endsWith('/reading-types')) return json([{ id: 1, codigo: 'FISICO', nombre: 'Físico' }])
    if (path.endsWith('/books/7')) return json(libro)
    return json(null, 404)
  }
  assert.deepEqual(await store.dispatch(librosApi.endpoints.obtenerLibro.initiate(7)).unwrap(), libro)
  assert.equal((await store.dispatch(librosApi.endpoints.obtenerTiposLectura.initiate()).unwrap())[0].codigo, 'FISICO')
  await assert.rejects(store.dispatch(librosApi.endpoints.obtenerLibro.initiate(999)).unwrap(), (error) => error.status === 404)
})

test('una mutation fallida conserva la lista y no provoca otra consulta', async () => {
  let consultas = 0
  globalThis.fetch = async (request) => {
    if (request.method === 'DELETE') return json(null, 404)
    consultas++
    return json({ libros: [libro], total: 1, pagina: 1, limite: 5 })
  }
  const lista = store.dispatch(librosApi.endpoints.listarLibros.initiate(filtros))
  await lista.unwrap()
  await assert.rejects(store.dispatch(librosApi.endpoints.eliminarLibro.initiate(7)).unwrap())
  await new Promise((resolve) => setTimeout(resolve, 30))
  assert.equal(consultas, 1)
  assert.equal(librosApi.endpoints.listarLibros.select(filtros)(store.getState()).data.total, 1)
  lista.unsubscribe()
})


test('una lista vacía es válida y conserva los metadatos de paginación', async () => {
  globalThis.fetch = async () => json({ libros: [], total: 0, pagina: 1, limite: 5 })
  const resultado = await store.dispatch(librosApi.endpoints.listarLibros.initiate(filtros)).unwrap()
  assert.deepEqual(resultado.libros, [])
  assert.equal(resultado.total, 0)
})

test('un contrato de lista incorrecto se convierte en error antes de renderizar', async () => {
  globalThis.fetch = async () => json({ data: [libro], total: 1, pagina: 1, limite: 5 })
  // RTK Query registra las excepciones de transformResponse; esta es esperada.
  const originalError = console.error
  console.error = () => {}
  try {
    await assert.rejects(
      store.dispatch(librosApi.endpoints.listarLibros.initiate(filtros)).unwrap(),
      (error) => error.message.includes('lista de libros válida'),
    )
    assert.equal(librosApi.endpoints.listarLibros.select(filtros)(store.getState()).isError, true)
  } finally {
    console.error = originalError
  }
})
