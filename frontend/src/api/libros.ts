import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  Cuerpo, FiltrosLibros, Libro, LibroGuardado, NuevoLibro, RespuestaLista, TipoLectura,
} from '../types/libros.ts'

// createApi define los endpoints y genera sus hooks. No escribe archivos en disco.
export const librosApi = createApi({
  reducerPath: 'librosApi',
  // fetchBaseQuery usa fetch: convierte JSON y trata los HTTP 4xx/5xx como errores.
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL ?? ''}/api/sypho-library/`,
  }),
  tagTypes: ['Libro'],
  endpoints: (builder) => ({
    // <Resultado, Argumento>: el hook recibe filtros y entrega RespuestaLista.
    listarLibros: builder.query<RespuestaLista, FiltrosLibros>({
      query: (filtros) => ({ url: 'books/all', params: filtros }),
      transformResponse: (respuesta: Cuerpo<RespuestaLista>) => {
        // Los genéricos no validan JSON durante la ejecución.
        const datos = respuesta?.data
        if (!datos || !Array.isArray(datos.libros)
          || !Number.isInteger(datos.total) || datos.total < 0
          || !Number.isInteger(datos.pagina) || datos.pagina < 1
          || !Number.isInteger(datos.limite) || datos.limite < 1) {
          throw new Error('La respuesta del servidor no contiene una lista de libros válida')
        }
        return datos
      },
      providesTags: ['Libro'],
    }),
    obtenerLibro: builder.query<Libro, number>({
      query: (id) => `books/${id}`,
      transformResponse: (respuesta: Cuerpo<Libro>) => respuesta.data,
      providesTags: ['Libro'],
    }),
    obtenerTiposLectura: builder.query<TipoLectura[], void>({
      query: () => 'reading-types',
      transformResponse: (respuesta: Cuerpo<TipoLectura[]>) => respuesta.data,
    }),
    crearLibro: builder.mutation<LibroGuardado, NuevoLibro>({
      query: (body) => ({ url: 'books/new', method: 'POST', body }),
      transformResponse: (respuesta: Cuerpo<LibroGuardado>) => respuesta.data,
      // Solo al tener éxito: las queries activas con esta etiqueta se consultan de nuevo.
      invalidatesTags: (_resultado, error) => error ? [] : ['Libro'],
    }),
    eliminarLibro: builder.mutation<LibroGuardado, number>({
      query: (id) => ({ url: `books/delete/${id}`, method: 'DELETE' }),
      transformResponse: (respuesta: Cuerpo<LibroGuardado>) => respuesta.data,
      invalidatesTags: (_resultado, error) => error ? [] : ['Libro'],
    }),
  }),
})

// Desestructuración: extraemos y exportamos los hooks que createApi ya generó.
export const {
  useListarLibrosQuery,
  useObtenerLibroQuery,
  useObtenerTiposLecturaQuery,
  useCrearLibroMutation,
  useEliminarLibroMutation,
} = librosApi
