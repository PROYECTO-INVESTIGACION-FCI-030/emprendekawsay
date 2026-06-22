export type ProjectDashboardData = {
  periodo: string
  proyecto: {
    avance: number
    inicio: string
    fin: string
    tiempoTranscurrido: number
  }
  cursos: {
    disenados: number
    enValidacion: number
    total: number
    estados: { estado: string; valor: number; porcentaje: number; fill: string }[]
  }
  produccion: {
    completados: number
    meta: number
    cumplimiento: number
  }
  validacion: {
    encuestadas: number
    meta: number
    porcentaje: number
  }
  tiempo: { fecha: string; planificado: number; ejecutado: number }[]
  produccionPorInvestigador: { investigador: string; planificado: number; ejecutado: number }[]
  necesidades: { necesidad: string; valor: number }[]
  competencias: { competencia: string; valor: number }[]
  diagnostico: {
    respuestas: number
    formalizacion: number
    interesParticipacion: number
    usoDigital: number
    parroquias: { nombre: string; valor: number }[]
    sectores: { nombre: string; valor: number }[]
    etnias: { nombre: string; valor: number }[]
    modalidades: { nombre: string; valor: number }[]
  }
  actividades: { titulo: string; fecha: string; estado: string; color: string }[]
}

export const fallbackProjectDashboardData: ProjectDashboardData = {
  periodo: "01/06/2026 - 30/06/2026",
  proyecto: {
    avance: 45,
    inicio: "01/06/2026",
    fin: "30/08/2028",
    tiempoTranscurrido: 50,
  },
  cursos: {
    disenados: 5,
    enValidacion: 2,
    total: 8,
    estados: [
      { estado: "Completados", valor: 2, porcentaje: 40, fill: "#22C55E" },
      { estado: "En diseno", valor: 2, porcentaje: 40, fill: "#2563EB" },
      { estado: "En validacion", valor: 1, porcentaje: 20, fill: "#F59E0B" },
      { estado: "Pendientes", valor: 0, porcentaje: 0, fill: "#8B5CF6" },
    ],
  },
  produccion: {
    completados: 3,
    meta: 10,
    cumplimiento: 30,
  },
  validacion: {
    encuestadas: 973,
    meta: 973,
    porcentaje: 100,
  },
  tiempo: [
    { fecha: "Jun 2026", planificado: 0, ejecutado: 0 },
    { fecha: "Nov 2026", planificado: 10, ejecutado: 5 },
    { fecha: "Dic 2026", planificado: 20, ejecutado: 12 },
    { fecha: "Mar 2027", planificado: 25, ejecutado: 17 },
    { fecha: "Jun 2027", planificado: 40, ejecutado: 28 },
    { fecha: "Sep 2027", planificado: 52, ejecutado: 34 },
    { fecha: "Oct 2027", planificado: 66, ejecutado: 45 },
    { fecha: "Mar 2028", planificado: 82, ejecutado: 58 },
    { fecha: "Jun 2028", planificado: 95, ejecutado: 66 },
  ],
  produccionPorInvestigador: [
    { investigador: "Raquel Vera", planificado: 5, ejecutado: 3 },
    { investigador: "Mixi Segura", planificado: 4, ejecutado: 4 },
    { investigador: "Nallan Navas", planificado: 3, ejecutado: 3 },
  ],
  necesidades: [
    { necesidad: "Marketing digital", valor: 100 },
    { necesidad: "Uso de tecnologia", valor: 62 },
    { necesidad: "Educacion financiera", valor: 47 },
    { necesidad: "Formalizacion", valor: 24 },
    { necesidad: "Gestion de costos", valor: 17 },
  ],
  competencias: [
    { competencia: "Digital", valor: 9 },
    { competencia: "Comercial", valor: 15 },
    { competencia: "Gestion", valor: 54 },
    { competencia: "Innovacion", valor: 6 },
    { competencia: "Financiera", valor: 29 },
  ],
  diagnostico: {
    respuestas: 973,
    formalizacion: 76,
    interesParticipacion: 33,
    usoDigital: 62,
    parroquias: [
      { nombre: "Tarqui", valor: 366 },
      { nombre: "Pascuales", valor: 140 },
      { nombre: "Ximena", valor: 120 },
      { nombre: "Febres Cordero", valor: 88 },
      { nombre: "Letamendi", valor: 37 },
    ],
    sectores: [
      { nombre: "Comercio", valor: 502 },
      { nombre: "Alimentacion", valor: 296 },
      { nombre: "Artesanias", valor: 54 },
      { nombre: "Textiles", valor: 49 },
      { nombre: "Servicios", valor: 35 },
    ],
    etnias: [
      { nombre: "Indigena", valor: 715 },
      { nombre: "Mestiza", valor: 209 },
      { nombre: "Montubia", valor: 26 },
      { nombre: "Blanca", valor: 12 },
      { nombre: "Afroecuatoriana", valor: 9 },
    ],
    modalidades: [
      { nombre: "Virtual", valor: 164 },
      { nombre: "Presencial", valor: 36 },
      { nombre: "Hibrida", valor: 19 },
    ],
  },
  actividades: [
    { titulo: "Validacion de insumos de encuesta", fecha: "15/06/2027", estado: "En proceso", color: "bg-emerald-500" },
    { titulo: "Aplicacion de encuesta de validacion", fecha: "30/06/2027", estado: "Programado", color: "bg-blue-500" },
    { titulo: "Analisis de resultados de validacion", fecha: "15/06/2027", estado: "Programado", color: "bg-violet-500" },
    { titulo: "Ajustes finales del programa", fecha: "01/06/2027", estado: "Programado", color: "bg-orange-500" },
    { titulo: "Redaccion de articulo cientifico", fecha: "07/06/2027", estado: "Programado", color: "bg-yellow-500" },
  ],
}
