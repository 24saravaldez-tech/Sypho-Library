import { useState, type FormEvent } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import type { FiltrosLibros } from './types/libros.ts'
import {
  useCrearLibroMutation, useEliminarLibroMutation, useListarLibrosQuery,
  useObtenerLibroQuery, useObtenerTiposLecturaQuery,
} from './api/libros.ts'
import { mensajeError } from './api/errores.ts'

const filtrosIniciales: FiltrosLibros = {
  titulo: '',
  pagina: 1,
  limite: 5,
  ordenarPor: 'titulo',
  orden: 'asc',
}

export default function App() {
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState<FiltrosLibros>(filtrosIniciales)
  const [seleccionado, setSeleccionado] = useState<number | null>(null)

  // Estado del formulario de crear libro
  const [titulo, setTitulo] = useState('')
  const [anio, setAnio] = useState(2020)
  const [autorId, setAutorId] = useState(1)
  const [categoriaId, setCategoriaId] = useState(1)

  const [tipoLecturaId, setTipoLecturaId] = useState<number | null>(null)

  // Queries: los hooks generados consultan al montar y al cambiar sus argumentos.
  const lista = useListarLibrosQuery(filtros, { refetchOnReconnect: true })
  // currentData corresponde a los filtros actuales; evita mostrar otra página al cambiar filtros.
  const datos = lista.currentData
  // skipToken evita consultar un detalle hasta que seleccionemos un ID.
  const detalle = useObtenerLibroQuery(seleccionado ?? skipToken)
  const tipos = useObtenerTiposLecturaQuery()

  // Mutations: [función que dispara la petición, estado de esa petición].
  const [crear, creacion] = useCrearLibroMutation()
  const [eliminar, eliminacion] = useEliminarLibroMutation()

  const buscar = (evento: FormEvent) => {
    evento.preventDefault()
    // RTK Query identifica la caché por endpoint + argumentos (incluidos estos filtros).
    setFiltros({ ...filtros, titulo: busqueda.trim(), pagina: 1 })
  }

  const crearLibro = async (evento: FormEvent) => {
    evento.preventDefault()
    if (tipoLecturaId === null) return
    try {
      // unwrap() entrega el resultado o lanza el error para poder usar try/catch.
      await crear({
        titulo, anio, descripcion: null, autor_id: autorId,
        categoria_id: categoriaId, tipo_lectura_id: tipoLecturaId,
      }).unwrap()
      setTitulo('')
      // invalidatesTags, definido en la API, provoca la actualización de la lista.
    } catch {
      // El estado creacion.error se muestra junto al formulario.
    }
  }

  const eliminarLibro = async (id: number) => {
    // Dejamos de consultar el detalle antes de que la invalidación vuelva a pedirlo.
    const estabaSeleccionado = seleccionado === id
    if (estabaSeleccionado) setSeleccionado(null)
    try {
      await eliminar(id).unwrap()
      // Si eliminamos el último registro de una página, regresamos a la anterior.
      if (datos?.libros.length === 1 && filtros.pagina > 1) {
        setFiltros((actuales) => ({ ...actuales, pagina: actuales.pagina - 1 }))
      }
    } catch {
      if (estabaSeleccionado) setSeleccionado(id)
      // El estado eliminacion.error se muestra junto a la lista.
    }
  }

  const totalPaginas = datos ? Math.max(1, Math.ceil(datos.total / datos.limite)) : 1

  return (
    <>
      <h1>Sypho-Library</h1>

      <section>
        <h2>Buscar libros</h2>
        <form onSubmit={buscar}>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Título (o parte del título)"
          />{' '}
          <button type="submit">Buscar</button>{' '}
          <select
            value={filtros.orden}
            onChange={(e) =>
              setFiltros({ ...filtros, orden: e.target.value === 'desc' ? 'desc' : 'asc', pagina: 1 })
            }
          >
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>
        </form>
      </section>

      <section>
        <h2>Libros {lista.isFetching && <small>(actualizando…)</small>}</h2>

        {/* Los 3 estados clásicos de una consulta: cargando, error y éxito */}
        {lista.isLoading && <p>Cargando libros…</p>}

        {lista.isError && (
          <p className="error">
            Error: {mensajeError(lista.error)}{' '}
            <button onClick={() => lista.refetch()}>Reintentar</button>
          </p>
        )}

        {datos && (
          <>
            <p>
              {datos.total} libro(s) en total. Página {datos.pagina} de {totalPaginas}.
            </p>
            <ul>
              {datos.libros.map((libro) => (
                <li key={libro.id}>
                  <strong>{libro.titulo}</strong> — {libro.autor_nombre} — {libro.estado}{' '}
                  <button onClick={() => setSeleccionado(libro.id)}>Ver detalle</button>{' '}
                  <button
                    onClick={() => eliminarLibro(libro.id)}
                    disabled={eliminacion.isLoading}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setFiltros({ ...filtros, pagina: filtros.pagina - 1 })}
              disabled={filtros.pagina <= 1 || lista.isFetching}
            >
              ← Anterior
            </button>{' '}
            <button
              onClick={() => setFiltros({ ...filtros, pagina: filtros.pagina + 1 })}
              disabled={filtros.pagina >= totalPaginas || lista.isFetching}
            >
              Siguiente →
            </button>
          </>
        )}

        {!lista.isError && !datos && lista.isFetching && !lista.isLoading && <p>Cargando página…</p>}
        {datos?.libros.length === 0 && <p>No hay libros con estos filtros.</p>}
        {eliminacion.isError && <p className="error">No se pudo eliminar: {mensajeError(eliminacion.error)}</p>}
      </section>

      <section>
        <h2>Detalle</h2>
        {seleccionado === null && <p>Elige un libro con «Ver detalle».</p>}
        {detalle.isFetching && seleccionado !== null && <p>Cargando detalle…</p>}
        {detalle.isError && <p className="error">Error: {mensajeError(detalle.error)}</p>}
        {detalle.currentData && <pre>{JSON.stringify(detalle.currentData, null, 2)}</pre>}
      </section>

      <section>
        <h2>Crear libro</h2>
        <form onSubmit={crearLibro}>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" required />{' '}
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            style={{ width: '5rem' }}
          />{' '}
          autor_id:{' '}
          <input
            type="number"
            value={autorId}
            onChange={(e) => setAutorId(Number(e.target.value))}
            style={{ width: '3.5rem' }}
          />{' '}
          categoria_id:{' '}
          <input
            type="number"
            value={categoriaId}
            onChange={(e) => setCategoriaId(Number(e.target.value))}
            style={{ width: '3.5rem' }}
          />{' '}
          <label>
            Tipo de lectura:{' '}
            <select
              value={tipoLecturaId ?? ''}
              onChange={(e) => setTipoLecturaId(e.target.value ? Number(e.target.value) : null)}
              disabled={tipos.isFetching || tipos.isError}
              required
            >
              <option value="">Selecciona un tipo</option>
              {tipos.data?.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
            </select>
          </label>{' '}
          <button type="submit" disabled={creacion.isLoading || tipoLecturaId === null}>
            {creacion.isLoading ? 'Creando…' : 'Crear'}
          </button>
        </form>
        {tipos.isError && <p className="error">No se pudieron cargar los tipos: {mensajeError(tipos.error)} <button onClick={() => tipos.refetch()}>Reintentar</button></p>}
        {creacion.isError && <p className="error">No se pudo crear: {mensajeError(creacion.error)}</p>}
        {creacion.isSuccess && <p>Libro creado: «{creacion.data.titulo}»</p>}
      </section>
    </>
  )
}
