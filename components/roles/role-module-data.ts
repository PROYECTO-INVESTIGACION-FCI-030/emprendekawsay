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
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"

export const roleModules = {
  investigadora: {
    proyecto: {
      title: "Proyecto",
      description: "Consulta metodologica del proyecto, objetivos, fases, indicadores y documentos de soporte",
      primaryAction: "Revisar soporte",
      metrics: [
        { label: "Fases metodologicas", value: "5", detail: "Diagnostico, formacion, validacion, sistematizacion y reportes", icon: Network },
        { label: "Indicadores", value: "12", detail: "Variables para seguimiento academico", icon: LineChart },
        { label: "Documentos", value: "8", detail: "Soportes disponibles para revision", icon: FileText },
        { label: "Resultados esperados", value: "6", detail: "Impactos sociales, economicos y cientificos", icon: FolderKanban },
      ],
      sections: [
        { title: "Consulta del proyecto", items: ["Informacion general", "Objetivo general y objetivos especificos", "Fases metodologicas", "Enfoque de Investigacion Accion Participativa"] },
        { title: "Soporte academico", items: ["Enfoque intercultural", "Resultados esperados", "Indicadores del proyecto", "Documentos de soporte"] },
      ],
      workflow: [
        { label: "Revisar enfoque", description: "Validar coherencia metodologica e intercultural." },
        { label: "Cruzar indicadores", description: "Relacionar objetivos con datos de diagnostico y avance." },
        { label: "Documentar evidencia", description: "Preparar insumos para reportes y produccion cientifica." },
      ],
      tableTitle: "Soportes metodologicos",
      tableRows: [
        { name: "Marco metodologico", owner: "Investigadora", status: "Activo", progress: "75%" },
        { name: "Matriz de indicadores", owner: "Equipo UG", status: "Revision", progress: "60%" },
        { name: "Cronograma de fases", owner: "Administradora", status: "Activo", progress: "65%" },
      ],
    },
    diagnostico: {
      title: "Diagnostico / Encuesta",
      description: "Revision y analisis de respuestas individuales, agrupadas y cualitativas",
      primaryAction: "Validar datos",
      metrics: [
        { label: "Encuestas", value: "180", detail: "Respuestas iniciales disponibles", icon: ClipboardList },
        { label: "Bloques revisados", value: "7/10", detail: "Secciones con control de calidad", icon: FileCheck2 },
        { label: "Observaciones", value: "24", detail: "Registros cualitativos por validar", icon: FileText },
        { label: "Segmentos", value: "9", detail: "Parroquia, cultura, sector y edad", icon: Users },
      ],
      sections: [
        { title: "Revision de respuestas", items: ["Consulta de encuestas iniciales", "Respuestas individuales", "Respuestas agrupadas", "Validacion de datos"] },
        { title: "Bloques de analisis", items: ["Datos sociodemograficos", "Gestion empresarial y finanzas", "Marketing, tecnologia y redes", "Barreras, oportunidades y observaciones cualitativas"] },
      ],
      workflow: [
        { label: "Consultar datos", description: "Revisar respuestas por bloque y participante." },
        { label: "Validar calidad", description: "Marcar inconsistencias y observaciones." },
        { label: "Enviar a analitica", description: "Liberar datos para resultados estadisticos." },
      ],
      tableTitle: "Bloques del diagnostico",
      tableRows: [
        { name: "Sociodemografico", owner: "Investigadora", status: "Activo", progress: "80%" },
        { name: "Tecnologia y digitalizacion", owner: "Investigadora", status: "Revision", progress: "54%" },
        { name: "Barreras y oportunidades", owner: "Investigadora", status: "Activo", progress: "68%" },
      ],
    },
    analitica: {
      title: "Analitica de Necesidades",
      description: "Analisis estadistico, comparativo y cualitativo de las necesidades detectadas",
      primaryAction: "Interpretar datos",
      metrics: [
        { label: "Graficos", value: "14", detail: "Resultados estadisticos disponibles", icon: BarChart3 },
        { label: "Matrices", value: "3", detail: "Barreras, oportunidades y capacitacion", icon: LineChart },
        { label: "Brecha digital", value: "54%", detail: "Dificultades tecnologicas detectadas", icon: Brain },
        { label: "Financiamiento", value: "76%", detail: "Necesidad prioritaria", icon: TrendingUp },
      ],
      sections: [
        { title: "Analisis estadistico", items: ["Graficos estadisticos", "Tablas comparativas", "Analisis por parroquia", "Analisis por sector economico"] },
        { title: "Interpretacion", items: ["Matriz de barreras", "Matriz de oportunidades", "Brecha digital", "Necesidades de capacitacion"] },
      ],
      workflow: [
        { label: "Agrupar resultados", description: "Cruzar respuestas por variables clave." },
        { label: "Interpretar hallazgos", description: "Elaborar lectura academica y metodologica." },
        { label: "Preparar evidencias", description: "Enviar insumos a produccion cientifica y reportes." },
      ],
      tableTitle: "Analisis activos",
      tableRows: [
        { name: "Brecha digital por parroquia", owner: "Investigadora", status: "Activo", progress: "54%" },
        { name: "Acceso a financiamiento", owner: "Investigadora", status: "Activo", progress: "76%" },
        { name: "Necesidades por sector", owner: "Investigadora", status: "Revision", progress: "62%" },
      ],
    },
    prediccion: {
      title: "Prediccion de Cursos",
      description: "Revision de criterios de recomendacion y pertinencia formativa",
      primaryAction: "Revisar criterios",
      metrics: [
        { label: "Criterios", value: "18", detail: "Reglas respuesta-curso", icon: Brain },
        { label: "Perfiles", value: "180", detail: "Participantes con diagnostico", icon: Users },
        { label: "Cursos sugeridos", value: "412", detail: "Recomendaciones generadas", icon: BookOpenCheck },
        { label: "Observaciones", value: "9", detail: "Mejoras de pertinencia", icon: FileText },
      ],
      sections: [
        { title: "Revision academica", items: ["Visualizacion de cursos recomendados", "Criterios de recomendacion", "Relacion entre perfil y curso", "Necesidades por participante"] },
        { title: "Pertinencia", items: ["Necesidades por grupo", "Validacion de pertinencia", "Priorizacion de contenidos", "Observaciones para mejorar la malla"] },
      ],
      workflow: [
        { label: "Revisar regla", description: "Verificar relacion entre respuesta y curso sugerido." },
        { label: "Validar pertinencia", description: "Ajustar prioridades segun evidencia." },
        { label: "Retroalimentar malla", description: "Enviar observaciones a formadoras y administradora." },
      ],
      tableTitle: "Criterios de recomendacion",
      tableRows: [
        { name: "Finanzas basicas", owner: "Investigadora", status: "Activo", progress: "100%" },
        { name: "Marketing digital", owner: "Formadora", status: "Activo", progress: "90%" },
        { name: "Formalizacion", owner: "Investigadora", status: "Revision", progress: "70%" },
      ],
    },
    malla: {
      title: "Malla Formativa",
      description: "Consulta del avance, actividades, evaluaciones y satisfaccion del proceso formativo",
      primaryAction: "Revisar avance",
      metrics: [
        { label: "Modulos", value: "5", detail: "Cursos en ejecucion", icon: GraduationCap },
        { label: "Participantes", value: "126", detail: "Inscritas en cursos", icon: Users },
        { label: "Finalizacion", value: "45%", detail: "Promedio de avance", icon: TrendingUp },
        { label: "Evaluaciones", value: "38", detail: "Resultados disponibles", icon: FileCheck2 },
      ],
      sections: [
        { title: "Consulta formativa", items: ["Modulos formativos", "Seguimiento del avance", "Resultados de actividades", "Resultados de evaluaciones"] },
        { title: "Observacion del proceso", items: ["Nivel de finalizacion", "Satisfaccion con contenidos", "Observaciones del proceso", "Ajustes sugeridos"] },
      ],
      workflow: [
        { label: "Consultar avance", description: "Revisar progreso por modulo y participante." },
        { label: "Analizar resultados", description: "Evaluar actividades, calificaciones y satisfaccion." },
        { label: "Registrar observaciones", description: "Documentar mejoras para la malla formativa." },
      ],
      tableTitle: "Seguimiento formativo",
      tableRows: [
        { name: "Gestion financiera basica", owner: "Formadora", status: "Activo", progress: "62%" },
        { name: "Marketing digital", owner: "Formadora", status: "Revision", progress: "25%" },
        { name: "Modelo de negocio", owner: "Formadora", status: "Activo", progress: "45%" },
      ],
    },
    validacion: {
      title: "Validacion / Encuesta",
      description: "Resultados de satisfaccion, evaluacion por expertas y ajustes metodologicos",
      primaryAction: "Revisar matriz",
      metrics: [
        { label: "Satisfaccion", value: "60", detail: "Respuestas finales recibidas", icon: ClipboardList },
        { label: "Expertas", value: "8", detail: "Evaluaciones externas", icon: ShieldCheck },
        { label: "Claridad", value: "91%", detail: "Valoracion positiva", icon: FileCheck2 },
        { label: "Ajustes", value: "14", detail: "Recomendaciones metodologicas", icon: FileText },
      ],
      sections: [
        { title: "Resultados", items: ["Encuestas de satisfaccion", "Evaluacion por expertas", "Nivel de claridad", "Nivel de utilidad practica"] },
        { title: "Mejora metodologica", items: ["Nivel de viabilidad", "Comentarios de participantes", "Comentarios de expertas", "Ajustes metodologicos propuestos"] },
      ],
      workflow: [
        { label: "Consolidar respuestas", description: "Integrar valoraciones de participantes y expertas." },
        { label: "Interpretar resultados", description: "Analizar claridad, utilidad y viabilidad." },
        { label: "Proponer ajustes", description: "Preparar documento de mejoras metodologicas." },
      ],
      tableTitle: "Validaciones",
      tableRows: [
        { name: "Encuesta de satisfaccion", owner: "Investigadora", status: "Activo", progress: "75%" },
        { name: "Matriz de expertas", owner: "Investigadora", status: "Revision", progress: "50%" },
        { name: "Ajustes metodologicos", owner: "Investigadora", status: "Revision", progress: "35%" },
      ],
    },
    produccion: {
      title: "Produccion Cientifica",
      description: "Datos anonimizados, resultados cualitativos y evidencias para articulos y ponencias",
      primaryAction: "Nuevo insumo",
      metrics: [
        { label: "Datos anonimizados", value: "1", detail: "Base lista para analisis", icon: ShieldCheck },
        { label: "Resultados", value: "14", detail: "Graficos y tablas procesadas", icon: BarChart3 },
        { label: "Articulos", value: "2", detail: "Productos en redaccion", icon: FileText },
        { label: "Ponencias", value: "1", detail: "Evidencia preparada", icon: GraduationCap },
      ],
      sections: [
        { title: "Insumos", items: ["Datos anonimizados", "Resultados estadisticos", "Resultados cualitativos", "Evidencia de vinculacion"] },
        { title: "Productos", items: ["Articulos cientificos", "Ponencias", "Documentos academicos generados", "Exportacion cientifica"] },
      ],
      workflow: [
        { label: "Anonimizar datos", description: "Separar datos personales y base de investigacion." },
        { label: "Procesar evidencia", description: "Preparar resultados cuantitativos y cualitativos." },
        { label: "Registrar producto", description: "Dar seguimiento a articulos, ponencias y documentos." },
      ],
      tableTitle: "Produccion academica",
      tableRows: [
        { name: "Articulo de diagnostico", owner: "Investigadora", status: "Activo", progress: "60%" },
        { name: "Ponencia de vinculacion", owner: "Investigadora", status: "Revision", progress: "40%" },
        { name: "Dataset anonimizado", owner: "Administradora", status: "Activo", progress: "85%" },
      ],
    },
    avance: {
      title: "Avance del Proyecto",
      description: "Resultados parciales, finales, impacto y alertas de cumplimiento",
      primaryAction: "Revisar resultados",
      metrics: [
        { label: "Avance por fase", value: "65%", detail: "Cumplimiento global", icon: TrendingUp },
        { label: "Indicadores", value: "12", detail: "Metas bajo seguimiento", icon: LineChart },
        { label: "Impacto social", value: "7", detail: "Variables de resultado", icon: Users },
        { label: "Alertas", value: "6", detail: "Retrasos o incumplimientos", icon: FileCheck2 },
      ],
      sections: [
        { title: "Seguimiento", items: ["Avance por fase", "Cumplimiento de indicadores", "Cumplimiento de metas", "Resultados parciales"] },
        { title: "Impacto", items: ["Resultados finales", "Impacto social", "Impacto economico", "Impacto cientifico"] },
      ],
      workflow: [
        { label: "Revisar fase", description: "Analizar avance de diagnostico, formacion y validacion." },
        { label: "Comparar metas", description: "Cruzar resultados con indicadores." },
        { label: "Registrar alertas", description: "Documentar retrasos y riesgos." },
      ],
      tableTitle: "Resultados e indicadores",
      tableRows: [
        { name: "Diagnostico", owner: "Investigadora", status: "Activo", progress: "80%" },
        { name: "Formacion", owner: "Formadora", status: "Activo", progress: "55%" },
        { name: "Validacion", owner: "Investigadora", status: "Revision", progress: "30%" },
      ],
    },
    reportes: {
      title: "Reportes",
      description: "Reportes academicos de diagnostico, necesidades, formacion, validacion e impacto",
      primaryAction: "Generar reporte",
      metrics: [
        { label: "Reportes", value: "8", detail: "Disponibles para exportar", icon: FileText },
        { label: "Diagnostico", value: "1", detail: "Informe principal", icon: ClipboardList },
        { label: "Necesidades", value: "6", detail: "Segmentos analizados", icon: BarChart3 },
        { label: "Impacto", value: "65%", detail: "Avance reportable", icon: TrendingUp },
      ],
      sections: [
        { title: "Tipos", items: ["Reporte de diagnostico", "Reporte de necesidades", "Reporte de formacion", "Reporte de validacion"] },
        { title: "Exportacion", items: ["Reporte de indicadores", "Reporte de impacto", "PDF", "Excel"] },
      ],
      workflow: [
        { label: "Elegir fuente", description: "Seleccionar modulo y periodo." },
        { label: "Interpretar datos", description: "Incluir lectura academica y hallazgos." },
        { label: "Exportar", description: "Generar reporte PDF o Excel." },
      ],
      tableTitle: "Reportes academicos",
      tableRows: [
        { name: "Reporte de diagnostico", owner: "Investigadora", status: "Activo", progress: "80%" },
        { name: "Reporte de validacion", owner: "Investigadora", status: "Revision", progress: "50%" },
        { name: "Reporte de impacto", owner: "Investigadora", status: "Revision", progress: "35%" },
      ],
    },
  },
  formadora: {
    analitica: {
      title: "Analitica de Necesidades",
      description: "Consulta de necesidades detectadas para adaptar contenidos de formacion",
      primaryAction: "Ver necesidades",
      metrics: [
        { label: "Temas demandados", value: "6", detail: "Areas con mayor necesidad", icon: BarChart3 },
        { label: "Finanzas", value: "82%", detail: "Prioridad de capacitacion", icon: TrendingUp },
        { label: "Marketing", value: "76%", detail: "Demanda formativa", icon: LineChart },
        { label: "Tecnologia", value: "54%", detail: "Brecha digital", icon: Brain },
      ],
      sections: [
        { title: "Consulta formativa", items: ["Necesidades de capacitacion", "Perfil de aprendizaje", "Temas con mayor demanda", "Dificultades comunes"] },
        { title: "Adaptacion de contenidos", items: ["Conocimiento previo", "Administracion", "Finanzas", "Ventas, tecnologia y marketing digital"] },
      ],
      workflow: [
        { label: "Consultar necesidades", description: "Revisar resultados por grupo." },
        { label: "Adaptar clase", description: "Ajustar actividades y materiales." },
        { label: "Registrar observaciones", description: "Informar mejoras a la malla." },
      ],
      tableTitle: "Necesidades para formacion",
      tableRows: [
        { name: "Educacion financiera", owner: "Formadora", status: "Activo", progress: "82%" },
        { name: "Marketing digital", owner: "Formadora", status: "Activo", progress: "76%" },
        { name: "Uso de tecnologia", owner: "Formadora", status: "Revision", progress: "54%" },
      ],
    },
    prediccion: {
      title: "Prediccion de Cursos",
      description: "Cursos sugeridos por perfil, grupo y prioridad de refuerzo",
      primaryAction: "Ver sugerencias",
      metrics: [
        { label: "Cursos sugeridos", value: "8", detail: "Modulos recomendados", icon: BookOpenCheck },
        { label: "Grupos", value: "5", detail: "Segmentos de aprendizaje", icon: Users },
        { label: "Apoyo adicional", value: "42", detail: "Participantes priorizadas", icon: TrendingUp },
        { label: "Refuerzos", value: "6", detail: "Contenidos a reforzar", icon: FileCheck2 },
      ],
      sections: [
        { title: "Planificacion", items: ["Lista de cursos sugeridos", "Cursos por grupo", "Relacion necesidad-modulo", "Priorizacion de modulos"] },
        { title: "Apoyo", items: ["Recomendaciones de refuerzo", "Participantes con apoyo adicional", "Observaciones para clases", "Ajuste de contenidos"] },
      ],
      workflow: [
        { label: "Revisar sugerencias", description: "Consultar cursos por grupo." },
        { label: "Preparar refuerzos", description: "Definir actividades y ejemplos." },
        { label: "Actualizar plan", description: "Ajustar clases asignadas." },
      ],
      tableTitle: "Cursos sugeridos",
      tableRows: [
        { name: "Gestion financiera", owner: "Formadora", status: "Activo", progress: "82%" },
        { name: "Marketing digital", owner: "Formadora", status: "Activo", progress: "76%" },
        { name: "Formalizacion", owner: "Formadora", status: "Revision", progress: "68%" },
      ],
    },
    malla: {
      title: "Malla Formativa",
      description: "Cursos asignados, materiales, actividades, evaluaciones y retroalimentacion",
      primaryAction: "Gestionar curso",
      metrics: [
        { label: "Cursos asignados", value: "4", detail: "Modulos a cargo", icon: GraduationCap },
        { label: "Participantes", value: "86", detail: "Inscritas en cohortes", icon: Users },
        { label: "Actividades", value: "18", detail: "Pendientes de revision", icon: FileCheck2 },
        { label: "Avance", value: "52%", detail: "Promedio de finalizacion", icon: TrendingUp },
      ],
      sections: [
        { title: "Gestion de cursos", items: ["Cursos asignados", "Materiales didacticos", "Videos y documentos de apoyo", "Actividades practicas"] },
        { title: "Seguimiento", items: ["Evaluaciones", "Registro de asistencia", "Seguimiento de progreso", "Retroalimentacion a participantes"] },
      ],
      workflow: [
        { label: "Preparar material", description: "Subir guias y actividades." },
        { label: "Revisar avance", description: "Controlar asistencia y evaluaciones." },
        { label: "Retroalimentar", description: "Dar comentarios a participantes." },
      ],
      tableTitle: "Cursos a cargo",
      tableRows: [
        { name: "Gestion financiera basica", owner: "Formadora", status: "Activo", progress: "62%" },
        { name: "Comercializacion", owner: "Formadora", status: "Activo", progress: "45%" },
        { name: "Digitalizacion", owner: "Formadora", status: "Revision", progress: "25%" },
      ],
    },
    avance: {
      title: "Avance del Proyecto",
      description: "Avance de modulos formativos, participantes, actividades y cumplimiento de metas",
      primaryAction: "Actualizar avance",
      metrics: [
        { label: "Modulos", value: "4", detail: "Cursos bajo seguimiento", icon: GraduationCap },
        { label: "Completaron", value: "42", detail: "Participantes con cursos cerrados", icon: Users },
        { label: "Pendientes", value: "18", detail: "Actividades por completar", icon: FileCheck2 },
        { label: "Finalizacion", value: "52%", detail: "Promedio formativo", icon: TrendingUp },
      ],
      sections: [
        { title: "Avance formativo", items: ["Avance de modulos", "Participantes que completaron cursos", "Participantes pendientes", "Porcentaje de finalizacion"] },
        { title: "Resultados", items: ["Actividades", "Evaluaciones", "Observaciones del proceso", "Cumplimiento de metas formativas"] },
      ],
      workflow: [
        { label: "Registrar avance", description: "Actualizar progreso por participante." },
        { label: "Revisar evaluaciones", description: "Controlar resultados y dificultades." },
        { label: "Informar cumplimiento", description: "Enviar avance a administracion." },
      ],
      tableTitle: "Avance formativo",
      tableRows: [
        { name: "Gestion financiera", owner: "Formadora", status: "Activo", progress: "62%" },
        { name: "Marketing digital", owner: "Formadora", status: "Revision", progress: "25%" },
        { name: "Formalizacion", owner: "Formadora", status: "Activo", progress: "48%" },
      ],
    },
  },
  institucion_aliada: {
    proyecto: {
      title: "Proyecto",
      description: "Presentacion institucional, objetivos, alcance, fases e impactos esperados",
      primaryAction: "Ver presentacion",
      metrics: [
        { label: "Instituciones", value: "3", detail: "Participantes del proyecto", icon: FolderKanban },
        { label: "Alcance", value: "267", detail: "Participantes registradas", icon: Users },
        { label: "Fases", value: "5", detail: "Ejecucion metodologica", icon: Network },
        { label: "Impactos", value: "3", detail: "Social, economico y academico", icon: TrendingUp },
      ],
      sections: [
        { title: "Presentacion", items: ["Presentacion institucional", "Objetivo general", "Objetivos especificos", "Instituciones participantes"] },
        { title: "Alcance", items: ["Alcance del programa", "Poblacion beneficiaria", "Fases del proyecto", "Impactos esperados"] },
      ],
      workflow: [
        { label: "Consultar alcance", description: "Ver objetivos y poblacion beneficiaria." },
        { label: "Revisar fases", description: "Entender estado general del programa." },
        { label: "Consultar impacto", description: "Ver resultados agregados permitidos." },
      ],
      tableTitle: "Informacion institucional",
      tableRows: [
        { name: "Presentacion del proyecto", owner: "Administradora", status: "Activo", progress: "100%" },
        { name: "Alcance del programa", owner: "Equipo UG", status: "Activo", progress: "100%" },
        { name: "Impactos esperados", owner: "Investigadora", status: "Activo", progress: "75%" },
      ],
    },
    avance: {
      title: "Avance del Proyecto",
      description: "Avance por fase, cumplimiento de metas, indicadores y resultados generales",
      primaryAction: "Ver indicadores",
      metrics: [
        { label: "Avance global", value: "65%", detail: "Cumplimiento general", icon: TrendingUp },
        { label: "Metas", value: "12", detail: "Indicadores bajo seguimiento", icon: LineChart },
        { label: "Actividades", value: "48", detail: "Realizadas del cronograma", icon: FileCheck2 },
        { label: "Semaforo", value: "6", detail: "Alertas institucionales", icon: BarChart3 },
      ],
      sections: [
        { title: "Seguimiento general", items: ["Avance por fase", "Cumplimiento de metas", "Indicadores de impacto social", "Indicadores de impacto economico"] },
        { title: "Resultados", items: ["Impacto cientifico", "Resultados generales", "Actividades realizadas", "Actividades pendientes"] },
      ],
      workflow: [
        { label: "Revisar fase", description: "Consultar avance agregado." },
        { label: "Ver indicadores", description: "Evaluar cumplimiento institucional." },
        { label: "Descargar evidencia", description: "Usar reportes permitidos." },
      ],
      tableTitle: "Avance institucional",
      tableRows: [
        { name: "Diagnostico", owner: "Administradora", status: "Activo", progress: "80%" },
        { name: "Formacion", owner: "Formadora", status: "Activo", progress: "55%" },
        { name: "Validacion", owner: "Investigadora", status: "Revision", progress: "30%" },
      ],
    },
    reportes: {
      title: "Reportes",
      description: "Reportes generales, de avance, impacto e indicadores para toma de decisiones",
      primaryAction: "Descargar reporte",
      metrics: [
        { label: "Reportes", value: "4", detail: "Disponibles para institucion", icon: FileText },
        { label: "Avance", value: "65%", detail: "Reporte actualizado", icon: TrendingUp },
        { label: "Indicadores", value: "12", detail: "Seguimiento institucional", icon: BarChart3 },
        { label: "Impacto", value: "3", detail: "Dimensiones principales", icon: LineChart },
      ],
      sections: [
        { title: "Reportes disponibles", items: ["Reporte general del programa", "Reporte de avance", "Reporte de impacto", "Reporte de indicadores"] },
        { title: "Uso institucional", items: ["Reporte institucional", "Evidencia para decisiones", "Exportacion en PDF", "Exportacion en Excel si esta permitido"] },
      ],
      workflow: [
        { label: "Seleccionar reporte", description: "Elegir avance, impacto o indicadores." },
        { label: "Revisar evidencia", description: "Consultar datos agregados." },
        { label: "Exportar", description: "Descargar archivo institucional." },
      ],
      tableTitle: "Reportes para institucion aliada",
      tableRows: [
        { name: "Reporte general", owner: "Administradora", status: "Activo", progress: "65%" },
        { name: "Reporte de avance", owner: "Administradora", status: "Activo", progress: "65%" },
        { name: "Reporte de impacto", owner: "Investigadora", status: "Revision", progress: "35%" },
      ],
    },
  },
}
