import { Award, BookOpenCheck, CheckSquare, ClipboardList, Headphones } from "lucide-react"

export const participantModules = {
  diagnostico: {
    title: "Diagnostico",
    description: "Encuesta inicial de necesidades de formacion y capacitacion",
    action: "Iniciar encuesta",
    actionHref: "/diagnostico/encuesta",
    icon: ClipboardList,
    progress: 0,
    steps: [
      {
        title: "Introduccion y consentimiento",
        detail: "Confirma que aceptas participar y que la informacion sera usada con fines academicos y formativos.",
      },
      {
        title: "Completar datos sociodemograficos",
        detail: "Parroquia, sector, edad, nivel de instruccion, estado civil y autoidentificacion cultural.",
      },
      {
        title: "Registrar informacion del emprendimiento",
        detail: "Tiempo del negocio, sector, trabajadores, ingresos y caracteristicas principales.",
      },
      {
        title: "Enviar respuestas",
        detail: "Tus respuestas ayudaran a recomendar cursos adecuados para fortalecer tu emprendimiento.",
      },
    ],
    notes: [
      "No existen respuestas correctas o incorrectas.",
      "La informacion sera tratada con confidencialidad.",
      "Los resultados alimentan la malla formativa y las recomendaciones de cursos.",
    ],
  },
  malla: {
    title: "Malla Formativa",
    description: "Cursos recomendados, materiales, actividades, evaluaciones y certificados",
    action: "Continuar curso",
    actionHref: "/malla-formativa",
    icon: BookOpenCheck,
    progress: 45,
    steps: [
      {
        title: "Curso de gestion financiera basica",
        detail: "Modulo en progreso con actividades practicas y evaluacion corta.",
        done: true,
      },
      {
        title: "Marketing digital y redes sociales",
        detail: "Curso recomendado para promocionar productos y llegar a nuevos clientes.",
      },
      {
        title: "Formalizacion del negocio",
        detail: "Contenido sobre permisos, RUC, tramites y administracion basica.",
      },
      {
        title: "Certificado",
        detail: "Disponible cuando completes los modulos asignados y sus evaluaciones.",
      },
    ],
    notes: [
      "Los cursos se recomiendan segun tu diagnostico inicial.",
      "Puedes consultar materiales, videos y guias descargables.",
      "Tu avance se actualiza al completar actividades y evaluaciones.",
    ],
  },
  validacion: {
    title: "Validacion",
    description: "Encuesta final de satisfaccion sobre claridad, utilidad y facilidad de uso",
    action: "Responder encuesta final",
    actionHref: "/validacion",
    icon: CheckSquare,
    progress: 0,
    steps: [
      {
        title: "Finalizar cursos asignados",
        detail: "La encuesta final se habilita al completar la ruta formativa.",
      },
      {
        title: "Valorar claridad y utilidad",
        detail: "Comparte tu opinion sobre los cursos, materiales y formadoras.",
      },
      {
        title: "Indicar dificultades",
        detail: "Registra problemas encontrados y recomendaciones de mejora.",
      },
      {
        title: "Enviar comentario final",
        detail: "Tus respuestas ayudaran a mejorar el programa.",
      },
    ],
    notes: [
      "La encuesta final mide satisfaccion y pertinencia del programa.",
      "Tus comentarios sirven para ajustar contenidos y metodologia.",
      "La validacion actualiza el avance de cierre de tu participacion.",
    ],
  },
  certificados: {
    title: "Certificados",
    description: "Constancias disponibles segun tu avance en la ruta formativa",
    action: "Ver formacion",
    actionHref: "/malla-formativa",
    icon: Award,
    progress: 45,
    steps: [
      {
        title: "Completar diagnostico",
        detail: "El diagnostico inicial activa tu ruta formativa personalizada.",
        done: true,
      },
      {
        title: "Finalizar modulos asignados",
        detail: "Cada modulo debe completarse con sus actividades y evaluaciones.",
      },
      {
        title: "Validar participacion",
        detail: "La encuesta final confirma tu experiencia y cierre del proceso.",
      },
      {
        title: "Descargar certificado",
        detail: "El certificado se habilita cuando cumplas los requisitos de participacion.",
      },
    ],
    notes: [
      "Los certificados se habilitan al completar la ruta asignada.",
      "Si falta una actividad, revisa Formacion y Evaluaciones.",
      "El certificado refleja tu participacion en el programa Kawsay Emprende.",
    ],
  },
  apoyoTecnico: {
    title: "Apoyo tecnico",
    description: "Orientacion para resolver dudas sobre acceso, encuestas, cursos y certificados",
    action: "Ir a mi perfil",
    actionHref: "/perfil",
    icon: Headphones,
    progress: 0,
    steps: [
      {
        title: "Revisar datos de contacto",
        detail: "Mantener tu telefono y correo actualizados facilita recibir apoyo.",
      },
      {
        title: "Identificar el problema",
        detail: "Indica si la dificultad esta en diagnostico, formacion, evaluaciones o certificados.",
      },
      {
        title: "Solicitar acompanamiento",
        detail: "El equipo de apoyo puede orientarte para continuar tu participacion.",
      },
      {
        title: "Confirmar solucion",
        detail: "Despues de recibir apoyo, vuelve al modulo pendiente y continua tu proceso.",
      },
    ],
    notes: [
      "Usa este espacio si tienes problemas para acceder o completar una actividad.",
      "Tambien puedes actualizar tus datos desde Mi perfil.",
      "El apoyo tecnico acompana tu participacion durante todo el programa.",
    ],
  },
}
