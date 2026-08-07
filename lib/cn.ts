/**
 * Joins truthy class name fragments.
 *
 * @param parts - Class name candidates
 * @returns Space-separated class string
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
