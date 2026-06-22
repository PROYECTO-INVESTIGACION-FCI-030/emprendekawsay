import {
  BarChart3,
  BookOpenCheck,
  Brain,
  ClipboardList,
  FileCheck2,
  FileText,
  FolderKanban,
  GraduationCap,
  LineChart,
  Network,
  Settings2,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"

export const adminModules = {
  proyecto: {
    title: "Proyecto",
    description: "Datos generales, objetivos, fases, instituciones y documentos del proyecto",
    primaryAction: "Nuevo documento",
    metrics: [
      { label: "Instituciones", value: "3", detail: "UG, AITEC y CORPCITI vinculadas", icon: FolderKanban },
      { label: "Fases", value: "5", detail: "Diagnostico, formacion, validacion, sistematizacion y reportes", icon: Network },
      { label: "Beneficiarias", value: "267", detail: "Mujeres emprendedoras registradas", icon: Users },
      { label: "Documentos", value: "12", detail: "Soportes institucionales cargados", icon: FileText },
    ],
    sections: [
      {
        title: "Informacion institucional",
        items: [
          "Nombre, descripcion y alcance del proyecto",
          "Objetivo general y objetivos especificos",
          "Instituciones participantes y roles de colaboracion",
          "Poblacion beneficiaria y criterios de participacion",
        ],
      },
      {
        title: "Enfoque metodologico",
        items: [
          "Enfoque intercultural",
          "Investigacion Accion Participativa",
          "Impactos esperados sociales, economicos y academicos",
          "Cronograma general por fases",
        ],
      },
    ],
    workflow: [
      { label: "Registrar proyecto", description: "Consolidar datos generales, objetivos e instituciones." },
      { label: "Adjuntar evidencias", description: "Subir documentos institucionales y soportes metodologicos." },
      { label: "Actualizar fases", description: "Mantener cronograma e hitos alineados con el avance real." },
    ],
    tableTitle: "Documentos y fases del proyecto",
    tableRows: [
      { name: "Diagnostico inicial", owner: "Administradora", status: "Activo", progress: "70%" },
      { name: "Convenio institucional", owner: "Equipo UG", status: "Activo", progress: "100%" },
      { name: "Plan de vinculacion", owner: "Investigadora", status: "Revision", progress: "55%" },
    ],
  },
  diagnostico: {
    title: "Diagnostico / Encuesta",
    description: "Gestion completa de encuesta inicial, participantes, respuestas y filtros",
    primaryAction: "Crear encuesta",
    metrics: [
      { label: "Encuestas completadas", value: "180", detail: "De 267 participantes registradas", icon: ClipboardList },
      { label: "Pendientes", value: "87", detail: "Participantes sin envio final", icon: FileCheck2 },
      { label: "Bloques", value: "10", detail: "Secciones normalizadas por tabla", icon: Settings2 },
      { label: "Filtros activos", value: "5", detail: "Parroquia, sector, edad, cultura y emprendimiento", icon: BarChart3 },
    ],
    sections: [
      {
        title: "Gestion de encuesta",
        items: [
          "Crear, editar, activar o desactivar encuesta inicial",
          "Ver respuestas recibidas y encuestas pendientes",
          "Exportar respuestas en Excel o PDF",
          "Generar reporte diagnostico",
        ],
      },
      {
        title: "Bloques de preguntas",
        items: [
          "Consentimiento y datos sociodemograficos",
          "Informacion del emprendimiento y gestion empresarial",
          "Finanzas, marketing, tecnologia y redes de apoyo",
          "Aspectos familiares, barreras y oportunidades",
        ],
      },
    ],
    workflow: [
      { label: "Activar encuesta", description: "Publicar el cuestionario inicial para mujeres emprendedoras." },
      { label: "Capturar respuestas", description: "Guardar cada bloque en su tabla normalizada." },
      { label: "Validar datos", description: "Revisar inconsistencias antes de alimentar analitica y reportes." },
    ],
    tableTitle: "Seguimiento de encuesta inicial",
    tableRows: [
      { name: "Datos sociodemograficos", owner: "Administradora", status: "Activo", progress: "80%" },
      { name: "Tecnologia y digitalizacion", owner: "Investigadora", status: "Activo", progress: "68%" },
      { name: "Barreras y oportunidades", owner: "Administradora", status: "Revision", progress: "62%" },
    ],
  },
  analitica: {
    title: "Analitica de Necesidades",
    description: "Resultados visuales y estadisticos a partir de la encuesta inicial",
    primaryAction: "Nuevo analisis",
    metrics: [
      { label: "Necesidad principal", value: "82%", detail: "Educacion financiera", icon: LineChart },
      { label: "Brecha digital", value: "54%", detail: "Participantes con dificultades tecnologicas", icon: BarChart3 },
      { label: "Formalizacion", value: "68%", detail: "Requiere apoyo legal y administrativo", icon: ShieldCheck },
      { label: "Segmentos", value: "9", detail: "Comparaciones por parroquia, sector y cultura", icon: Users },
    ],
    sections: [
      {
        title: "Resultados disponibles",
        items: [
          "Resumen de necesidades detectadas",
          "Graficos por parroquia, edad y nivel educativo",
          "Brecha digital y acceso a financiamiento",
          "Principales barreras y oportunidades",
        ],
      },
      {
        title: "Analisis comparativo",
        items: [
          "Necesidades de capacitacion mas frecuentes",
          "Comparacion por grupos",
          "Nivel de formalizacion del negocio",
          "Exportacion de resultados",
        ],
      },
    ],
    workflow: [
      { label: "Consolidar respuestas", description: "Tomar los bloques validados del diagnostico." },
      { label: "Calcular indicadores", description: "Generar porcentajes, cruces y tendencias por grupo." },
      { label: "Publicar hallazgos", description: "Enviar datos a prediccion, reportes y malla formativa." },
    ],
    tableTitle: "Indicadores de necesidades",
    tableRows: [
      { name: "Acceso a financiamiento", owner: "Investigadora", status: "Activo", progress: "76%" },
      { name: "Uso de herramientas digitales", owner: "Administradora", status: "Activo", progress: "54%" },
      { name: "Capacitacion en marketing", owner: "Formadora", status: "Revision", progress: "71%" },
    ],
  },
  prediccion: {
    title: "Prediccion de Cursos",
    description: "Recomendaciones de cursos segun necesidades detectadas por participante y grupo",
    primaryAction: "Ajustar regla",
    metrics: [
      { label: "Recomendaciones", value: "412", detail: "Cursos sugeridos automaticamente", icon: Brain },
      { label: "Reglas activas", value: "18", detail: "Relacion respuesta-curso", icon: Settings2 },
      { label: "Alta urgencia", value: "63", detail: "Participantes priorizadas", icon: TrendingUp },
      { label: "Cursos base", value: "8", detail: "Modulos sugeridos por el documento", icon: BookOpenCheck },
    ],
    sections: [
      {
        title: "Motor de recomendacion",
        items: [
          "Perfil de necesidades por participante",
          "Cursos recomendados automaticamente",
          "Cursos recomendados por grupo",
          "Relacion entre respuesta y curso sugerido",
        ],
      },
      {
        title: "Control administrativo",
        items: [
          "Priorizacion de cursos",
          "Nivel de urgencia de capacitacion",
          "Historial de recomendaciones",
          "Ajuste manual de recomendaciones",
        ],
      },
    ],
    workflow: [
      { label: "Leer diagnostico", description: "Evaluar respuestas clave por bloque." },
      { label: "Asignar cursos", description: "Relacionar necesidad con modulo formativo." },
      { label: "Revisar excepciones", description: "Permitir ajuste manual por administradora." },
    ],
    tableTitle: "Reglas de recomendacion",
    tableRows: [
      { name: "Sin control de ingresos -> Gestion financiera", owner: "Administradora", status: "Activo", progress: "100%" },
      { name: "No usa redes -> Marketing digital", owner: "Formadora", status: "Activo", progress: "100%" },
      { name: "No formaliza -> Formalizacion del negocio", owner: "Investigadora", status: "Activo", progress: "100%" },
    ],
  },
  malla: {
    title: "Malla Formativa",
    description: "Creacion, asignacion y seguimiento de cursos, actividades y certificados",
    primaryAction: "Crear modulo",
    metrics: [
      { label: "Modulos activos", value: "5", detail: "De 8 modulos sugeridos", icon: GraduationCap },
      { label: "Formadoras", value: "6", detail: "Asignadas a cursos", icon: Users },
      { label: "Materiales", value: "34", detail: "Guias, videos y recursos", icon: FileText },
      { label: "Certificados", value: "42", detail: "Disponibles al finalizar", icon: FileCheck2 },
    ],
    sections: [
      {
        title: "Gestion academica",
        items: [
          "Crear y editar modulos formativos",
          "Asignar formadora y participantes",
          "Subir materiales, videos y guias descargables",
          "Crear actividades practicas y evaluaciones",
        ],
      },
      {
        title: "Seguimiento",
        items: [
          "Revisar avance de participantes",
          "Revisar calificaciones",
          "Generar certificados",
          "Cerrar modulo finalizado",
        ],
      },
    ],
    workflow: [
      { label: "Disenar modulo", description: "Definir contenidos, recursos y evaluaciones." },
      { label: "Asignar cohortes", description: "Vincular formadoras y participantes recomendadas." },
      { label: "Cerrar y certificar", description: "Validar avance y emitir certificados." },
    ],
    tableTitle: "Modulos formativos",
    tableRows: [
      { name: "Modelo de negocio intercultural", owner: "Formadora", status: "Activo", progress: "45%" },
      { name: "Gestion financiera basica", owner: "Formadora", status: "Activo", progress: "62%" },
      { name: "Marketing digital y redes sociales", owner: "Formadora", status: "Revision", progress: "20%" },
    ],
  },
  validacion: {
    title: "Validacion / Encuesta",
    description: "Encuesta final de satisfaccion, evaluacion por expertas y ajustes metodologicos",
    primaryAction: "Crear encuesta final",
    metrics: [
      { label: "Respuestas finales", value: "60", detail: "Encuestas de satisfaccion recibidas", icon: ClipboardList },
      { label: "Expertas", value: "8", detail: "Evaluaciones metodologicas", icon: ShieldCheck },
      { label: "Claridad", value: "91%", detail: "Valoracion positiva del programa", icon: FileCheck2 },
      { label: "Ajustes", value: "14", detail: "Mejoras metodologicas registradas", icon: Settings2 },
    ],
    sections: [
      {
        title: "Encuesta final",
        items: [
          "Crear encuesta final",
          "Editar preguntas de validacion",
          "Activar encuesta de satisfaccion",
          "Ver respuestas de participantes",
        ],
      },
      {
        title: "Matriz de validacion",
        items: [
          "Ver evaluacion por expertas",
          "Revisar claridad, utilidad y viabilidad",
          "Revisar comentarios cualitativos",
          "Generar documento de ajustes metodologicos",
        ],
      },
    ],
    workflow: [
      { label: "Activar validacion", description: "Publicar encuesta final despues de los cursos." },
      { label: "Consolidar evaluaciones", description: "Cruzar respuestas de participantes y expertas." },
      { label: "Ajustar programa", description: "Registrar mejoras metodologicas y evidencias." },
    ],
    tableTitle: "Instrumentos de validacion",
    tableRows: [
      { name: "Encuesta de satisfaccion", owner: "Administradora", status: "Activo", progress: "75%" },
      { name: "Matriz de expertas", owner: "Investigadora", status: "Revision", progress: "50%" },
      { name: "Documento de ajustes", owner: "Administradora", status: "Revision", progress: "35%" },
    ],
  },
  produccion: {
    title: "Produccion Cientifica",
    description: "Datos anonimizados, evidencia, productos academicos y repositorio cientifico",
    primaryAction: "Nuevo producto",
    metrics: [
      { label: "Productos", value: "3/10", detail: "Productos cientificos completados", icon: FileText },
      { label: "Dataset", value: "1", detail: "Base anonimizada disponible", icon: ShieldCheck },
      { label: "Ponencias", value: "2", detail: "Insumos en preparacion", icon: GraduationCap },
      { label: "Reportes", value: "5", detail: "Documentos academicos generados", icon: FileCheck2 },
    ],
    sections: [
      {
        title: "Insumos cientificos",
        items: [
          "Base de datos anonimizada",
          "Resultados procesados",
          "Evidencia para articulos cientificos",
          "Insumos para ponencias",
        ],
      },
      {
        title: "Repositorio",
        items: [
          "Reportes academicos",
          "Documentos de vinculacion",
          "Repositorio de archivos",
          "Registro de productos cientificos",
        ],
      },
    ],
    workflow: [
      { label: "Anonimizar datos", description: "Separar datos personales de resultados investigativos." },
      { label: "Procesar resultados", description: "Preparar tablas, graficos y evidencia cualitativa." },
      { label: "Registrar producto", description: "Controlar avance de articulos, ponencias y reportes." },
    ],
    tableTitle: "Productos cientificos",
    tableRows: [
      { name: "Articulo sobre necesidades formativas", owner: "Investigadora", status: "Activo", progress: "60%" },
      { name: "Ponencia de vinculacion", owner: "Equipo UG", status: "Revision", progress: "40%" },
      { name: "Dataset anonimizado", owner: "Administradora", status: "Activo", progress: "85%" },
    ],
  },
  avance: {
    title: "Avance del Proyecto",
    description: "Linea de tiempo, fases, metas, indicadores y alertas de cumplimiento",
    primaryAction: "Nuevo hito",
    metrics: [
      { label: "Avance general", value: "65%", detail: "Promedio de fases del proyecto", icon: TrendingUp },
      { label: "Actividades", value: "48", detail: "Completadas de 72 planificadas", icon: FileCheck2 },
      { label: "Alertas", value: "6", detail: "Retrasos o datos incompletos", icon: BarChart3 },
      { label: "Indicadores", value: "12", detail: "Sociales, economicos y cientificos", icon: LineChart },
    ],
    sections: [
      {
        title: "Seguimiento por fase",
        items: [
          "Linea de tiempo del proyecto",
          "Avance por fase",
          "Cumplimiento de metas",
          "Semaforo de cumplimiento",
        ],
      },
      {
        title: "Indicadores",
        items: [
          "Indicadores sociales",
          "Indicadores economicos",
          "Indicadores cientificos",
          "Indicadores de vinculacion",
        ],
      },
    ],
    workflow: [
      { label: "Actualizar hitos", description: "Registrar actividades completadas y pendientes." },
      { label: "Evaluar metas", description: "Comparar avance real contra indicadores planificados." },
      { label: "Emitir alertas", description: "Notificar retrasos o incumplimientos." },
    ],
    tableTitle: "Linea de tiempo y metas",
    tableRows: [
      { name: "Diagnostico", owner: "Administradora", status: "Activo", progress: "80%" },
      { name: "Formacion fase 1", owner: "Formadora", status: "Activo", progress: "55%" },
      { name: "Validacion intermedia", owner: "Investigadora", status: "Revision", progress: "30%" },
    ],
  },
  reportes: {
    title: "Reportes",
    description: "Reportes por fase, participante, indicador, diagnostico, necesidades e impacto",
    primaryAction: "Generar reporte",
    metrics: [
      { label: "Reportes listos", value: "9", detail: "PDF y Excel disponibles", icon: FileText },
      { label: "Diagnostico", value: "1", detail: "Reporte principal actualizado", icon: ClipboardList },
      { label: "Indicadores", value: "12", detail: "Metas con seguimiento", icon: BarChart3 },
      { label: "Impacto", value: "65%", detail: "Avance global reportable", icon: TrendingUp },
    ],
    sections: [
      {
        title: "Tipos de reporte",
        items: [
          "Reporte general del proyecto",
          "Reporte por participante",
          "Reporte por fase e indicador",
          "Reporte de diagnostico y necesidades",
        ],
      },
      {
        title: "Exportacion",
        items: [
          "Reporte de formacion",
          "Reporte de validacion",
          "Reporte de impacto",
          "Exportacion en PDF y Excel",
        ],
      },
    ],
    workflow: [
      { label: "Seleccionar fuente", description: "Elegir diagnostico, formacion, avance o validacion." },
      { label: "Aplicar filtros", description: "Filtrar por fecha, rol, parroquia, fase o indicador." },
      { label: "Exportar", description: "Generar archivo institucional en PDF o Excel." },
    ],
    tableTitle: "Reportes institucionales",
    tableRows: [
      { name: "Reporte general del proyecto", owner: "Administradora", status: "Activo", progress: "65%" },
      { name: "Reporte de necesidades", owner: "Investigadora", status: "Activo", progress: "80%" },
      { name: "Reporte de impacto", owner: "Administradora", status: "Revision", progress: "35%" },
    ],
  },
}
