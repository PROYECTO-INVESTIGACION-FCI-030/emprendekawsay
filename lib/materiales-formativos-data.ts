export const TIPOS_MATERIALES = [
  "Silabo",
  "Malla curricular",
  "Guia docente",
  "Guia de estudio o cuadernillo de trabajo",
  "Banco de reactivos o propuesta de evaluacion",
  "Rubrica de evaluacion",
  "Informe de justificacion tecnica",
  "Ficha tecnica del curso",
] as const

export type TipoMaterialFormativo = (typeof TIPOS_MATERIALES)[number]

export type MaterialFormativo = {
  id: string
  id_curso: string
  tipo: TipoMaterialFormativo
  titulo: string
  descripcion: string | null
  enlace: string | null
  visible: boolean
  orden: number
  fecha_creacion: string
  fecha_actualizacion: string
  curso?: {
    id: string
    titulo: string
    visible: boolean
  } | null
}

export type MaterialFormativoCurso = {
  id: string
  titulo: string
  descripcion: string
  visible: boolean
}
