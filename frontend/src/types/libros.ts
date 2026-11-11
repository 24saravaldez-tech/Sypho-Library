// Contratos HTTP: describen el JSON que entrega el backend, no los modelos de Prisma.
export type EstadoLectura = 'PENDIENTE' | 'EN_CURSO' | 'TERMINADO' | 'ABANDONADO'

// Listado y detalle pasan por librosDTO en el backend.
// Ese DTO entrega nombres de relaciones y no incluye anio ni autor_id/categoria_id.
export type Libro = {
  id: number
  titulo: string
  descripcion: string | null
  tipo_lectura_id: number
  estado: EstadoLectura
  inicio_lectura: string | null
  fin_lectura: string | null
  calificacion: number | null
  pagina_actual: number | null
  segundo_actual: number | null
  resena: string | null
  portada_url: string | null
  creado_en: string
  autor_nombre: string
  autor_detalles: string | null
  categoria_nombre: string
  tipo_lectura_nombre: string
}

export type FiltrosLibros = {
  titulo: string
  pagina: number
  limite: number
  ordenarPor: 'titulo' | 'anio' | 'categoria_id'
  orden: 'asc' | 'desc'
}

export type RespuestaLista = {
  libros: Libro[]
  total: number
  pagina: number
  limite: number
}

export type NuevoLibro = {
  titulo: string
  anio: number
  descripcion: string | null
  autor_id: number
  categoria_id: number
  tipo_lectura_id: number
}

// Crear y eliminar devuelven el registro de Prisma, sin pasar por librosDTO.
export type LibroGuardado = NuevoLibro & {
  id: number
  estado: EstadoLectura
  inicio_lectura: string | null
  fin_lectura: string | null
  calificacion: number | null
  pagina_actual: number | null
  segundo_actual: number | null
  resena: string | null
  portada_url: string | null
  creado_en: string
  actualizado_en: string
}

export type TipoLectura = { id: number; codigo: string; nombre: string }

// T representa el contenido variable dentro del envoltorio común de la API.
export type Cuerpo<T> = { success: boolean; message: string; data: T }
