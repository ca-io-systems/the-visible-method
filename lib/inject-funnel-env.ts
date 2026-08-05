const FUNNEL_ENV_KEYS = ["WHATSAPP_GROUP_URL"] as const;

/**
 * Replaces {{ENV_KEY}} placeholders in funnel HTML with server env values.
 *
 * @param html - Raw content HTML
 * @returns HTML with configured placeholders substituted
 */
export function injectFunnelEnv(html: string): string {
  let out = html;
  for (const key of FUNNEL_ENV_KEYS) {
    const value = process.env[key];
    if (value) {
      out = out.replaceAll(`{{${key}}}`, value);
    }
  }
  return out;
}
