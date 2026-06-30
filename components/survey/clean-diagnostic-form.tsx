"use client"

import { type FormEvent, useActionState, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { guardarCuestionarioLimpio } from "@/lib/cuestionario-limpio-actions"

type Answers = Record<string, string>

const yesSometimesNo = ["Sí", "A veces", "No"]

function capitalizeFirstWord(value: string) {
  const trimmed = value.replace(/^\s+/, "")
  if (!trimmed) return ""
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function SelectField({
  name,
  label,
  options,
  value,
  onChange,
  required,
}: {
  name: string
  label: string
  options: string[]
  value: string
  onChange: (name: string, value: string) => void
  required?: boolean
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        required={required}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextField({
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  name: string
  label: string
  value: string
  onChange: (name: string, value: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <Input
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={(event) => onChange(name, capitalizeFirstWord(event.target.value))}
        placeholder={placeholder}
        required={required}
      />
    </label>
  )
}

function CheckboxField({
  name,
  label,
  options,
  values,
  onToggle,
  required,
}: {
  name: string
  label: string
  options: string[]
  values: string[]
  onToggle: (name: string, value: string) => void
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-start gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={values.includes(option)}
              onChange={() => onToggle(name, option)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

const STEPS = [
  { id: "base", title: "Información base del negocio", description: "Ubicación, sector, antigüedad y perfil general." },
  { id: "gestion", title: "Gestión y finanzas", description: "Formalización, control, planificación y precios." },
  { id: "marketing", title: "Marketing y tecnología", description: "Promoción, dispositivos, aplicaciones y pagos." },
  { id: "cultura", title: "Cultura e identidad", description: "Solo para quienes aplican el bloque cultural." },
  { id: "general", title: "Cierre", description: "Interés en el programa y modalidad preferida." },
] as const

type StepId = (typeof STEPS)[number]["id"]

export function CleanDiagnosticForm() {
  const [state, action, pending] = useActionState(guardarCuestionarioLimpio, null)
  const [answers, setAnswers] = useState<Answers>({})
  const [multi, setMulti] = useState<Record<string, string[]>>({})
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [submitRequested, setSubmitRequested] = useState(false)
  const [warning, setWarning] = useState("")
  const serializedAnswers = useMemo(() => JSON.stringify(answers), [answers])
  const serializedMulti = useMemo(() => JSON.stringify(multi), [multi])

  useEffect(() => {
    if (state?.ok && submitRequested) {
      setCompleted(true)
    }
  }, [state?.ok, submitRequested])

  function setAnswer(name: string, value: string) {
    setWarning("")
    setAnswers((current) => ({ ...current, [name]: value }))
  }

  function toggleAnswer(name: string, value: string) {
    setWarning("")
    setMulti((current) => {
      const currentValues = current[name] ?? []
      const next = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value]
      return { ...current, [name]: next }
    })
  }

  const showParroquiaOtro = answers.parroquia === "Otro"
  const showSectorOtro = answers.sector_economico === "Otro"
  const showPueblo = answers.etnia === "Indígena"
  const showEtniaOtro = answers.etnia === "Otra"
  const showPromocion = answers.promocion_negocio === "Busco activamente nuevas formas de promocionar mi negocio (ferias, redes, volantes, etc.)"
  const showDispositivos = answers.dispositivo_internet === "Sí" || answers.dispositivo_internet === "A veces"
  const showApps = answers.usa_apps_digitales === "Sí" || answers.usa_apps_digitales === "A veces"
  const showPagos = answers.usa_pagos_digitales === "Sí" || answers.usa_pagos_digitales === "A veces"
  const showCultura = ["Indígena", "Afroecuatoriana", "Montubia", "Blanca"].includes(answers.etnia)
  const showCulturaDetalles = showCultura && (answers.incorpora_cultura === "Sí" || answers.incorpora_cultura === "A veces")
  const showRedesDetalles = answers.participa_asociaciones === "Sí" || answers.participa_asociaciones === "A veces"
  const showContacto = answers.interes_programa === "Sí"
  const showMediosPromocionOtro = showPromocion && (multi.medios_promocion ?? []).includes("Otro")
  const showDispositivosOtro = showDispositivos && (multi.dispositivos_usados ?? []).includes("Otro")
  const showAppsOtro = showApps && (multi.apps_usadas ?? []).includes("Otro")
  const showPagosOtro = showPagos && (multi.pagos_usados ?? []).includes("Otro")
  const showElementosCulturalesOtro = showCulturaDetalles && (multi.elementos_culturales ?? []).includes("Otro")
  const showAsociacionesOtro = showRedesDetalles && (multi.asociaciones ?? []).includes("Otro")
  const showDificultadOtro = answers.dificultad_tecnologia === "Otro"

  useEffect(() => {
    if (answers.dispositivo_internet === "No") {
      setAnswers((current) => ({
        ...current,
        usa_apps_digitales: "",
        usa_pagos_digitales: "",
        dificultad_tecnologia: "",
        dificultad_tecnologia_otro: "",
      }))
      setMulti((current) => ({
        ...current,
        dispositivos_usados: [],
        apps_usadas: [],
        pagos_usados: [],
      }))
    }
  }, [answers.dispositivo_internet])

  const hiddenMulti = useMemo(() => {
    const values = { ...multi }
    if (!showPromocion) delete values.medios_promocion
    if (!showDispositivos) delete values.dispositivos_usados
    if (!showApps) delete values.apps_usadas
    if (!showPagos) delete values.pagos_usados
    if (!showCulturaDetalles) delete values.elementos_culturales
    if (!showRedesDetalles) delete values.asociaciones
    return values
  }, [multi, showPromocion, showDispositivos, showApps, showPagos, showCulturaDetalles, showRedesDetalles])

  const canContinue = (stepId: StepId) => {
    if (stepId === "base") {
      return Boolean(answers.parroquia && answers.sector_ubicacion && answers.antiguedad_emprendimiento && answers.sector_economico && answers.ingreso_mensual && answers.nivel_instruccion && answers.etnia && (!showParroquiaOtro || answers.parroquia_otro) && (!showSectorOtro || answers.sector_economico_otro) && (!showPueblo || answers.pueblo_nacionalidad) && (!showEtniaOtro || answers.autoidentificacion_otro))
    }
    if (stepId === "gestion") {
      return Boolean(answers.situacion_formalizacion && answers.control_dinero && answers.planifica_metas && answers.reinvierte_ganancias && answers.define_precios_costos)
    }
    if (stepId === "marketing") {
      const base = Boolean(answers.promocion_negocio && answers.usa_sugerencias_clientes && answers.dispositivo_internet && answers.dificultad_tecnologia)
      const tecnologiaOk =
        answers.dispositivo_internet === "No"
          ? true
          : Boolean(answers.usa_apps_digitales && answers.usa_pagos_digitales)
      const multiOk =
        (!showPromocion || hiddenMulti.medios_promocion?.length) &&
        (!showDispositivos || hiddenMulti.dispositivos_usados?.length) &&
        (!showApps || hiddenMulti.apps_usadas?.length) &&
        (!showPagos || hiddenMulti.pagos_usados?.length) &&
        (!showDificultadOtro || answers.dificultad_tecnologia_otro || answers.dificultad_tecnologia !== "Otro")
      return base && tecnologiaOk && multiOk && (!showMediosPromocionOtro || answers.medios_promocion_otro) && (!showDispositivosOtro || answers.dispositivos_usados_otro) && (!showAppsOtro || answers.apps_usadas_otro) && (!showPagosOtro || answers.pagos_usados_otro)
    }
    if (stepId === "cultura") {
      const base = Boolean((!showCultura || answers.incorpora_cultura) && (!showCultura || answers.participa_asociaciones || !showCulturaDetalles) && (!showCultura || answers.origen_conocimiento_cultural || !showCulturaDetalles))
      return base && (!showCulturaDetalles || hiddenMulti.elementos_culturales?.length) && (!showElementosCulturalesOtro || answers.elementos_culturales_otro) && (!showAsociacionesOtro || answers.asociaciones_otro)
    }
    if (stepId === "general") {
      return Boolean(answers.interes_programa && answers.modalidad_preferida && (!showContacto || answers.contacto_programa))
    }
    return true
  }

  function missingMessage(stepId: StepId) {
    if (stepId === "base") {
      if (!answers.parroquia) return "Falta responder la pregunta 1."
      if (showParroquiaOtro && !answers.parroquia_otro) return "Falta especificar la parroquia en la pregunta 1."
      if (!answers.sector_ubicacion) return "Falta responder la pregunta 2."
      if (!answers.antiguedad_emprendimiento) return "Falta responder la pregunta 3."
      if (!answers.sector_economico) return "Falta responder la pregunta 4."
      if (showSectorOtro && !answers.sector_economico_otro) return "Falta especificar el sector económico en la pregunta 4."
      if (!answers.ingreso_mensual) return "Falta responder la pregunta 5."
      if (!answers.nivel_instruccion) return "Falta responder la pregunta 6."
      if (!answers.etnia) return "Falta responder la pregunta 7."
      if (showPueblo && !answers.pueblo_nacionalidad) return "Falta especificar el pueblo o nacionalidad en la pregunta 7."
      if (showEtniaOtro && !answers.autoidentificacion_otro) return "Falta especificar la autoidentificación en la pregunta 7."
    }
    if (stepId === "gestion") {
      if (!answers.situacion_formalizacion) return "Falta responder la pregunta 8."
      if (!answers.control_dinero) return "Falta responder la pregunta 9."
      if (!answers.planifica_metas) return "Falta responder la pregunta 10."
      if (!answers.reinvierte_ganancias) return "Falta responder la pregunta 11."
      if (!answers.define_precios_costos) return "Falta responder la pregunta 12."
    }
    if (stepId === "marketing") {
      if (!answers.promocion_negocio) return "Falta responder la pregunta 13."
      if (showPromocion && !(multi.medios_promocion?.length)) return "Falta marcar al menos una opción en la pregunta 13."
      if (showMediosPromocionOtro && !answers.medios_promocion_otro) return "Falta especificar la opción 'Otro' en la pregunta 13."
      if (!answers.usa_sugerencias_clients) return "Falta responder la pregunta 14."
      if (!answers.dispositivo_internet) return "Falta responder la pregunta 15."
      if (showDispositivos && !(multi.dispositivos_usados?.length)) return "Falta marcar al menos una opción en la pregunta 15."
      if (showDispositivosOtro && !answers.dispositivos_usados_otro) return "Falta especificar la opción 'Otro' en la pregunta 15."
      if (showDispositivos && !answers.usa_apps_digitales) return "Falta responder la pregunta 16."
      if (showApps && !(multi.apps_usadas?.length)) return "Falta marcar al menos una opción en la pregunta 16."
      if (showAppsOtro && !answers.apps_usadas_otro) return "Falta especificar la opción 'Otro' en la pregunta 16."
      if (showDispositivos && !answers.usa_pagos_digitales) return "Falta responder la pregunta 17."
      if (showPagos && !(multi.pagos_usados?.length)) return "Falta marcar al menos una opción en la pregunta 17."
      if (showPagosOtro && !answers.pagos_usados_otro) return "Falta especificar la opción 'Otro' en la pregunta 17."
      if (!answers.dificultad_tecnologia) return "Falta responder la pregunta 18."
      if (showDificultadOtro && !answers.dificultad_tecnologia_otro) return "Falta especificar la opción 'Otro' en la pregunta 18."
    }
    if (stepId === "cultura") {
      if (!answers.incorpora_cultura) return "Falta responder la pregunta 19."
      if (showCulturaDetalles && !(multi.elementos_culturales?.length)) return "Falta marcar al menos una opción en la pregunta 19."
      if (showElementosCulturalesOtro && !answers.elementos_culturales_otro) return "Falta especificar la opción 'Otro' en la pregunta 19."
      if (showCulturaDetalles && !answers.origen_conocimiento_cultural) return "Falta responder la pregunta 20."
      if (!answers.participa_asociaciones) return "Falta responder la pregunta 21."
      if (showRedesDetalles && !(multi.asociaciones?.length)) return "Falta marcar al menos una opción en la pregunta 21."
      if (showAsociacionesOtro && !answers.asociaciones_otro) return "Falta especificar la opción 'Otro' en la pregunta 21."
    }
    if (stepId === "general") {
      if (!answers.interes_programa) return "Falta responder la pregunta 22."
      if (showContacto && !answers.contacto_programa) return "Falta completar el dato de contacto en la pregunta 22."
      if (!answers.modalidad_preferida) return "Falta responder la pregunta 23."
    }
    return ""
  }

  const visibleSteps = showCultura ? STEPS : STEPS.filter((step) => step.id !== "cultura")
  const currentStep = visibleSteps[Math.min(stepIndex, visibleSteps.length - 1)]
  const currentStepId = currentStep.id

  function goNextStep() {
    const missing = missingMessage(currentStepId)
    if (missing) {
      setWarning(missing)
      return
    }
    if (!canContinue(currentStepId)) return
    setWarning("")
    setStepIndex((current) => Math.min(current + 1, visibleSteps.length - 1))
  }

  function goPrevStep() {
    setWarning("")
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  function handleFinalSubmit(event: FormEvent<HTMLFormElement>) {
    if (!submitRequested) {
      event.preventDefault()
      return
    }
  }

  if (completed) {
    return (
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-2 bg-[#00529b]" />
        <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f1fb] text-2xl text-[#00529b]">
            ✓
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00529b]">Encuesta finalizada</p>
            <h2 className="text-2xl font-semibold text-slate-950">Gracias por completar el cuestionario</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Tus respuestas fueron enviadas correctamente. Esta encuesta ya quedó cerrada en este dispositivo y no se
              puede modificar nuevamente.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Puedes cerrar esta pestaña con tranquilidad.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form action={action} noValidate onSubmit={handleFinalSubmit} className="space-y-6">
      <input type="hidden" name="answers_json" value={serializedAnswers} />
      <input type="hidden" name="multi_json" value={serializedMulti} />
      {warning ? (
        <div className="fixed right-4 top-4 z-50 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg">
          <p className="font-semibold">Revisa esta respuesta</p>
          <p className="mt-1">{warning}</p>
        </div>
      ) : null}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Bloque {Math.min(stepIndex + 1, visibleSteps.length)} de {visibleSteps.length}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{currentStep.title}</h2>
            <p className="text-sm text-slate-600">{currentStep.description}</p>
          </div>
          <div className="text-sm text-slate-500">Todas las preguntas son obligatorias</div>
        </CardContent>
      </Card>

      {currentStepId === "base" ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Información base del negocio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SelectField name="parroquia" label="1. ¿En qué parroquia se encuentra ubicado el emprendimiento?" options={["Tarqui", "Ximena", "Febres Cordero", "Pascuales", "Letamendi", "9 de Octubre", "Ayacucho", "Chongón", "Posorja", "Tenguel", "Otro"]} value={answers.parroquia ?? ""} onChange={setAnswer} required />
            {showParroquiaOtro ? <TextField name="parroquia_otro" label="Especifique la parroquia" value={answers.parroquia_otro ?? ""} onChange={setAnswer} placeholder="Escriba la parroquia" required /> : null}
            <TextField name="sector_ubicacion" label="2. ¿Cuál es el sector en donde se encuentra ubicado el emprendimiento? Ciudadela/barrio/cooperativa" value={answers.sector_ubicacion ?? ""} onChange={setAnswer} placeholder="Escriba el sector" required />
            <SelectField name="antiguedad_emprendimiento" label="3. ¿Cuántos años tiene vigente el emprendimiento?" options={["Menos de 1 año", "1-3 años", "4-6 años", "7 años o más"]} value={answers.antiguedad_emprendimiento ?? ""} onChange={setAnswer} required />
            <SelectField name="sector_economico" label="4. ¿Cuál es el principal sector económico del emprendimiento?" options={["Artesanías/manualidades", "Textiles/confecciones", "Alimentación/gastronomía", "Comercio (venta de productos)", "Servicios", "Otro"]} value={answers.sector_economico ?? ""} onChange={setAnswer} required />
            {showSectorOtro ? <TextField name="sector_economico_otro" label="Especifique el sector económico" value={answers.sector_economico_otro ?? ""} onChange={setAnswer} placeholder="Escriba el sector" required /> : null}
            <SelectField name="ingreso_mensual" label="5. ¿Cuál es el ingreso mensual aproximado que genera el emprendimiento?" options={["Menos de 200 USD", "200 - 399 USD", "400 - 699 USD", "700 - 999 USD", "1000 USD o más"]} value={answers.ingreso_mensual ?? ""} onChange={setAnswer} required />
            <SelectField name="nivel_instruccion" label="6. ¿Cuál es su mayor nivel de instrucción formal alcanzado?" options={["Sin instrucción", "Primaria", "Secundaria", "Técnica/tecnológica", "Universitaria", "Posgrado"]} value={answers.nivel_instruccion ?? ""} onChange={setAnswer} required />
            <SelectField name="etnia" label="7. ¿Con qué etnia se autoidentifica?" options={["Indígena", "Afroecuatoriana", "Mestiza", "Montubia", "Blanca", "Otra"]} value={answers.etnia ?? ""} onChange={setAnswer} required />
            {showPueblo ? <TextField name="pueblo_nacionalidad" label="Pueblo o nacionalidad" value={answers.pueblo_nacionalidad ?? ""} onChange={setAnswer} placeholder="Escriba el pueblo o nacionalidad" required /> : null}
            {showEtniaOtro ? <TextField name="autoidentificacion_otro" label="Especifique su autoidentificación" value={answers.autoidentificacion_otro ?? ""} onChange={setAnswer} placeholder="Escriba la autoidentificación" required /> : null}
          </CardContent>
        </Card>
      ) : null}

      {currentStepId === "gestion" ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Gestión y finanzas del negocio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SelectField name="situacion_formalizacion" label="8. Sobre los papeles de su negocio, ¿cuál es su situación actual?" options={["Ya estoy formalizado/a al 100% y tengo todos mis documentos en regla.", "Estoy en proceso (tengo algunos documentos, pero me faltan o están en trámite).", "Aún no me formalizo, porque no sé por dónde empezar ni qué documentos necesito.", "Aún no me formalizo, principalmente por la falta de recursos económicos o costos de los trámites.", "Aún no me formalizo, porque los procesos me parecen demasiado complejos o largos"]} value={answers.situacion_formalizacion ?? ""} onChange={setAnswer} required />
            <SelectField name="control_dinero" label="9. ¿Lleva algún control o registro del dinero que gana y gasta de su negocio?" options={yesSometimesNo} value={answers.control_dinero ?? ""} onChange={setAnswer} required />
            <SelectField name="planifica_metas" label="10. ¿Suele planificar lo que quiere lograr en su negocio cada mes?" options={yesSometimesNo} value={answers.planifica_metas ?? ""} onChange={setAnswer} required />
            <SelectField name="reinvierte_ganancias" label="11. ¿Guarda una parte de las ganancias para volver a invertir en su negocio?" options={yesSometimesNo} value={answers.reinvierte_ganancias ?? ""} onChange={setAnswer} required />
            <SelectField name="define_precios_costos" label="12. Al fijar el precio de venta, ¿toma en cuenta lo que le cuesta hacerlo o comprarlo y la ganancia que espera tener?" options={yesSometimesNo} value={answers.define_precios_costos ?? ""} onChange={setAnswer} required />
          </CardContent>
        </Card>
      ) : null}

      {currentStepId === "marketing" ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Marketing y tecnología del negocio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SelectField name="promocion_negocio" label="13. ¿Qué hace normalmente para que más personas conozcan o compren en su negocio?" options={["Solo espero que los clientes lleguen a mi local", "Busco activamente nuevas formas de promocionar mi negocio (ferias, redes, volantes, etc.)"]} value={answers.promocion_negocio ?? ""} onChange={setAnswer} required />
            {showPromocion ? <CheckboxField name="medios_promocion" label="Si marcó la segunda opción, indique las opciones que utiliza con más frecuencia" options={["Boca a boca (recomendaciones)", "Ferias o mercados", "Volantes o afiches", "Redes sociales (Facebook, WhatsApp, Instagram, etc.)", "Otro"]} values={multi.medios_promocion ?? []} onToggle={toggleAnswer} required /> : null}
            {showMediosPromocionOtro ? <TextField name="medios_promocion_otro" label="Especifique otros medios de promoción" value={answers.medios_promocion_otro ?? ""} onChange={setAnswer} placeholder="Escriba el medio" required /> : null}
            <SelectField name="usa_sugerencias_clientes" label="14. ¿Utiliza las opiniones y sugerencias de sus clientes para hacer mejoras o cambios?" options={yesSometimesNo} value={answers.usa_sugerencias_clientes ?? ""} onChange={setAnswer} required />
            <SelectField name="dispositivo_internet" label="15. ¿Cuenta con algún dispositivo con acceso a internet para apoyar la gestión de su negocio?" options={yesSometimesNo} value={answers.dispositivo_internet ?? ""} onChange={setAnswer} required />
            <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              Si respondió “No”, pase directamente a la pregunta 18. Si respondió “Sí” o “A veces”, continúe con las preguntas siguientes.
            </div>
            {showDispositivos ? <CheckboxField name="dispositivos_usados" label="Indique cuál utiliza con mayor frecuencia" options={["Teléfono celular / smartphone", "Computadora / laptop", "Tablet", "Otro"]} values={multi.dispositivos_usados ?? []} onToggle={toggleAnswer} required /> : null}
            {showDispositivosOtro ? <TextField name="dispositivos_usados_otro" label="Especifique otro dispositivo" value={answers.dispositivos_usados_otro ?? ""} onChange={setAnswer} placeholder="Escriba el dispositivo" required /> : null}
            {showDispositivos ? (
              <>
                <SelectField name="usa_apps_digitales" label="16. ¿Acostumbra a utilizar aplicaciones digitales como WhatsApp, Facebook u otros para dar a conocer sus productos y conversar con sus clientes?" options={yesSometimesNo} value={answers.usa_apps_digitales ?? ""} onChange={setAnswer} required />
                {showApps ? <CheckboxField name="apps_usadas" label="Indique cuáles aplicaciones utiliza" options={["WhatsApp", "Facebook/Marketplace", "Instagram", "TikTok", "Mercado Libre", "Apps de delivery (PedidosYa, Uber Eats)", "Otro"]} values={multi.apps_usadas ?? []} onToggle={toggleAnswer} required /> : null}
                {showAppsOtro ? <TextField name="apps_usadas_otro" label="Especifique otra aplicación" value={answers.apps_usadas_otro ?? ""} onChange={setAnswer} placeholder="Escriba la aplicación" required /> : null}
                <SelectField name="usa_pagos_digitales" label="17. ¿Acostumbra a usar pagos digitales, como transferencias bancarias o aplicaciones móviles, para cobrar o pagar en su negocio?" options={yesSometimesNo} value={answers.usa_pagos_digitales ?? ""} onChange={setAnswer} required />
                {showPagos ? <CheckboxField name="pagos_usados" label="Indique cuáles medios de pago utiliza" options={["Transferencia bancaria", "PayPhone", "Deuna / botón QR", "Aplicación del banco móvil / banca en línea", "Enlace o botón de pago que envía por redes sociales / WhatsApp", "Otro"]} values={multi.pagos_usados ?? []} onToggle={toggleAnswer} required /> : null}
                {showPagosOtro ? <TextField name="pagos_usados_otro" label="Especifique otro medio de pago" value={answers.pagos_usados_otro ?? ""} onChange={setAnswer} placeholder="Escriba el medio de pago" required /> : null}
              </>
            ) : null}
            <SelectField name="dificultad_tecnologia" label="18. ¿Cuál es la principal dificultad que ha tenido para usar la tecnología en la gestión de su negocio?" options={["No tengo internet o es muy caro", "No sé usar bien las aplicaciones", "No tengo tiempo para aprender", "No tengo quién me enseñe", "Otro"]} value={answers.dificultad_tecnologia ?? ""} onChange={setAnswer} required />
            {showDificultadOtro ? <TextField name="dificultad_tecnologia_otro" label="Especifique otra dificultad" value={answers.dificultad_tecnologia_otro ?? ""} onChange={setAnswer} placeholder="Escriba la dificultad" required /> : null}
          </CardContent>
        </Card>
      ) : null}

      {currentStepId === "cultura" ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Cultura e identidad del negocio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SelectField name="incorpora_cultura" label="19. ¿Incorpora elementos de su cultura o tradiciones en su negocio?" options={yesSometimesNo} value={answers.incorpora_cultura ?? ""} onChange={setAnswer} required={showCultura} />
            {showCulturaDetalles ? <CheckboxField name="elementos_culturales" label="Si marcó Sí o A veces, indique cuáles" options={["Saberes o recetas familiares", "Técnicas artesanales o manualidades tradicionales", "Materiales o recursos propios de su comunidad", "Símbolos, música o formas de vestir culturales", "Otro"]} values={multi.elementos_culturales ?? []} onToggle={toggleAnswer} required /> : null}
            {showElementosCulturalesOtro ? <TextField name="elementos_culturales_otro" label="Especifique otro elemento cultural" value={answers.elementos_culturales_otro ?? ""} onChange={setAnswer} placeholder="Escriba el elemento cultural" required /> : null}
            {showCulturaDetalles ? <TextField name="origen_conocimiento_cultural" label="20. ¿De dónde provienen esos conocimientos o prácticas culturales que aplica en su negocio?" value={answers.origen_conocimiento_cultural ?? ""} onChange={setAnswer} placeholder="Escriba la procedencia" required /> : null}
            {showCultura ? <SelectField name="participa_asociaciones" label="21. ¿Participa en grupos o asociaciones donde comparta su cultura o dé a conocer sus productos tradicionales?" options={yesSometimesNo} value={answers.participa_asociaciones ?? ""} onChange={setAnswer} required /> : null}
            {showRedesDetalles ? <CheckboxField name="asociaciones" label="Si marcó Sí o A veces, indique en cuáles" options={["Asociación o grupo de artesanas", "Cooperativa o red de mujeres", "Feria cultural o mercado tradicional", "Grupo en línea (WhatsApp, Facebook, etc.)", "Otro"]} values={multi.asociaciones ?? []} onToggle={toggleAnswer} required /> : null}
            {showAsociacionesOtro ? <TextField name="asociaciones_otro" label="Especifique otra asociación o grupo" value={answers.asociaciones_otro ?? ""} onChange={setAnswer} placeholder="Escriba la asociación" required /> : null}
          </CardContent>
        </Card>
      ) : null}

      {currentStepId === "general" ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Cierre</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SelectField name="interes_programa" label="22. ¿Le gustaría participar en el programa de capacitación y formación para emprendedoras?" options={["Sí", "No"]} value={answers.interes_programa ?? ""} onChange={setAnswer} required />
            {showContacto ? <TextField name="contacto_programa" label="Si su respuesta fue sí, proporcione un número de WhatsApp activo o correo electrónico" value={answers.contacto_programa ?? ""} onChange={setAnswer} placeholder="WhatsApp o correo" required /> : null}
            <SelectField name="modalidad_preferida" label="23. ¿En qué modalidad preferiría recibir las capacitaciones?" options={["Presencial", "Virtual", "Híbrida"]} value={answers.modalidad_preferida ?? ""} onChange={setAnswer} required />
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{state?.message ?? "Completa el bloque actual para continuar."}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={goPrevStep} disabled={stepIndex === 0 || pending}>
            Anterior
          </Button>
          {stepIndex < visibleSteps.length - 1 ? (
            <Button type="button" onClick={goNextStep} disabled={pending}>
              Siguiente
            </Button>
          ) : (
            <Button type="submit" onClick={() => setSubmitRequested(true)} disabled={pending}>
              {pending ? "Enviando..." : "Enviar encuesta"}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
