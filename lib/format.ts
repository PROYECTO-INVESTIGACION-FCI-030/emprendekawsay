/** Convierte cada palabra a mayúscula inicial: "maria perez" -> "Maria Perez" */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
}
