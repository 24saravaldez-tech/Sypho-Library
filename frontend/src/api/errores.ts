import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

// Un error HTTP y un error de JavaScript no tienen necesariamente la misma forma.
export function mensajeError(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return 'Ocurrió un error inesperado'
  if ('status' in error) {
    const datos = error.data
    if (typeof datos === 'object' && datos !== null && 'message' in datos
      && typeof datos.message === 'string') return datos.message
    if ('error' in error) return error.error
    return `Error HTTP ${error.status}`
  }
  return error.message ?? 'Ocurrió un error inesperado'
}
