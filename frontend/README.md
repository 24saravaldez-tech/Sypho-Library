# Sypho-Library: React + TypeScript + RTK Query

El frontend usa Redux Toolkit y React Redux. RTK Query administra las consultas,
las mutaciones y su caché. La implementación anterior de TanStack React Query
fue reemplazada; los hooks de la API ahora se generan con `createApi`.

## Ejecutar

Necesitas Node.js 24.x. Prepara el backend y PostgreSQL siguiendo el README de la raíz.
En una terminal, desde `backend`, ejecuta `npm run dev` (puerto 5010).
En otra terminal:

```bash
cd frontend
npm ci
npm run dev
```

Abre la URL que imprime Vite (normalmente http://localhost:5173).
`vite.config.ts` reenvía `/api` al backend. Si necesitas otro servidor puedes definir
`VITE_API_URL` en un `.env.local`; al usar otro origen, el backend debe permitirlo mediante CORS.

Si modificas dependencias u `overrides` en `package.json`, ejecuta `npm install`
para actualizar también `package-lock.json`. Conserva los dos archivos.
Rolldown se fija en 1.3.1 porque 1.2.18 causa `Illegal instruction` (132) en el equipo de desarrollo.

## Recorrido para estudiar en una hora

| Minutos | Archivo | Qué observar |
| --- | --- | --- |
| 0–10 | `src/types/libros.ts` | Argumentos, respuestas y envoltorio `Cuerpo<T>` |
| 10–25 | `src/api/libros.ts` | `createApi`, queries, mutations y hooks generados |
| 25–35 | `src/app/store.ts` y `src/main.tsx` | Reducer, middleware y Provider |
| 35–50 | `src/App.tsx` | Consumir hooks, mostrar estados y disparar mutations |
| 50–60 | Network del navegador y pruebas | Observar peticiones y comprobar la caché |

## 1. Los tipos describen el contrato HTTP

`Cuerpo<T>` describe `{ success, message, data: T }`. En el listado, `T` es
`RespuestaLista`: `{ libros, total, pagina, limite }`. En el detalle, `T` es `Libro`.
`transformResponse` extrae `respuesta.data` para que los componentes reciban el contenido.
Los genéricos no comprueban JSON en ejecución: el listado además valida el arreglo y su paginación.
No se implementa aquí validación exhaustiva de cada campo de todos los endpoints.

El backend tiene dos formas de libro:

- `Libro`: el DTO de listado/detalle, con nombres de autor, categoría y tipo de lectura.
- `LibroGuardado`: el registro devuelto al crear/eliminar, con año e IDs de relaciones.

El DTO actual no entrega `anio`; por eso el listado muestra el autor. No se debe declarar
un campo en TypeScript y asumir que por eso el servidor lo enviará.
`NuevoLibro` incluye `tipo_lectura_id`, obligatorio en el backend.

## 2. La API define operaciones y genera hooks

En `src/api/libros.ts`:

```ts
listarLibros: builder.query<RespuestaLista, FiltrosLibros>({
  query: (filtros) => ({ url: 'books/all', params: filtros }),
  // ... transformación y etiquetas
})
```

`<RespuestaLista, FiltrosLibros>` significa **resultado, argumento**.
`query` construye la petición. `fetchBaseQuery` utiliza fetch, convierte el JSON y
trata respuestas HTTP 4xx/5xx como errores. `transformResponse` prepara el resultado que se guarda.

`createApi` importado desde `@reduxjs/toolkit/query/react` genera los hooks en memoria.
El `export const { useListarLibrosQuery } = librosApi` solamente extrae y exporta ese hook.
No hay un archivo generado que debas buscar ni escribir un hook manual `useLibros`.

| Endpoint | Hook generado | Operación |
| --- | --- | --- |
| `listarLibros` | `useListarLibrosQuery` | GET `/books/all` con filtros |
| `obtenerLibro` | `useObtenerLibroQuery` | GET `/books/:id` |
| `obtenerTiposLectura` | `useObtenerTiposLecturaQuery` | GET `/reading-types` |
| `crearLibro` | `useCrearLibroMutation` | POST `/books/new` |
| `eliminarLibro` | `useEliminarLibroMutation` | DELETE `/books/delete/:id` |

Las rutas son relativas a `/api/sypho-library/`.

## 3. El store conecta RTK Query con Redux

`configureStore` en `src/app/store.ts` registra dos piezas:

- `librosApi.reducer`: guarda la caché y los estados de las peticiones.
- `librosApi.middleware`: coordina peticiones, suscripciones e invalidación.

`Provider` en `src/main.tsx` permite que los componentes accedan al store.
No necesitas crear otro `createSlice` para copiar los libros: RTK Query ya guarda esos datos.
Los inputs y la selección permanecen en `useState` porque son estado local de la pantalla.
`RootState = ReturnType<typeof store.getState>` obtiene el tipo del estado desde la función real.
`AppDispatch = typeof store.dispatch` obtiene el tipo de dispatch; no hay que escribirlos a mano.

## 4. Usar una query y una mutation

```ts
const lista = useListarLibrosQuery(filtros)
const [crear, creacion] = useCrearLibroMutation()
```

La query se consulta al suscribirse, o utiliza la caché si ya dispone del resultado.
Endpoint + argumentos identifican la entrada de caché: cambiar de página cambia sus argumentos.
No hace falta llamar al hook desde un `useEffect` ni pasar una `queryKey`.

- `isLoading`: primera carga sin datos disponibles.
- `isFetching`: petición en curso, incluso si ya existen datos.
- `isError` y `error`: estado y detalles del fallo; `mensajeError` adapta errores HTTP y de JavaScript.
- `data`: último resultado disponible del hook, que puede corresponder a argumentos anteriores.
- `currentData`: resultado correspondiente a los argumentos actuales; la pantalla usa este.
- `skipToken`: evita consultar el detalle si todavía no elegiste un libro.

Una mutation devuelve una tupla: la función que debes ejecutar y el estado de la operación.
`await crear(datos).unwrap()` entrega el resultado o lanza el error, permitiendo `try/catch`.
Los formularios muestran ese error utilizando el estado de la mutation.

## 5. Mantener sincronizada la lista

Las queries declaran `providesTags: ['Libro']`. Las mutations exitosas declaran
`invalidatesTags: ['Libro']`. Al crear o eliminar, RTK Query invalida esas entradas:
las consultas con suscriptores activos se vuelven a pedir; las que no los tienen se eliminan de caché.
La etiqueta no es una tabla de PostgreSQL: es una relación que nosotros declaramos entre operaciones.

Se usa una etiqueta general para mantener sencillo el ejemplo. También actualiza otros
listados filtrados y detalles activos. Una implementación más grande puede usar etiquetas por ID.
Antes de eliminar el libro seleccionado dejamos de consultar su detalle.
Al borrar el último libro de una página, la interfaz vuelve a la página anterior.

## Práctica guiada

1. Abre Network, busca una palabra y observa los parámetros de `/books/all`.
2. Cambia de página y vuelve: compara el uso de caché con una consulta nueva.
3. Elige un libro: se activa `/books/:id`; antes de seleccionarlo no se pide detalle.
4. Crea un libro usando IDs de autor/categoría existentes y un tipo del selector.
5. Observa el POST seguido de la consulta automática del listado.
6. Elimina ese libro de práctica y observa el DELETE y la actualización de la lista.
7. Detén el backend y pulsa Reintentar para ver el estado de error.

Con la extensión Redux DevTools puedes inspeccionar `librosApi.queries` y las acciones
pending/fulfilled/rejected. El store habilita DevTools solo durante desarrollo.

## Verificar

```bash
npm test
npm run build
npm run lint
```

Las pruebas usan el store y los endpoints reales con fetch simulado. Cubren reutilización de
caché, argumentos distintos, invalidación tras crear/eliminar, detalle, catálogo, errores HTTP,
lista vacía y respuesta de lista incorrecta. No modifican la base de datos.

## Alcance

La integración de RTK Query está completa para las operaciones actuales de esta pantalla:
listar, buscar, paginar, ver detalle, crear y eliminar. El backend también dispone de edición,
pero todavía no hay formulario ni endpoint de edición en esta interfaz.
El formulario conserva la entrada manual de IDs de autor/categoría. Autenticación, permisos,
despliegue y validación exhaustiva de contratos son requisitos independientes si el producto los necesita.
Un proyecto formal no exige más carpetas ni Redux adicional: exige que los contratos,
comportamientos y verificaciones respondan a sus requisitos.

Referencias: [inicio rápido oficial](https://redux.js.org/toolkit/tutorials/rtk-query),
[TypeScript](https://redux.js.org/toolkit/rtk-query/usage-with-typescript),
[invalidación de caché](https://redux.js.org/toolkit/rtk-query/usage/automated-refetching).
