import type { HtmlTemplate } from "./types";
import { letterElegantTemplate } from "./letter-elegant/template";
import { resumeElegantTemplate } from "./resume-elegant/template";

const templates = new Map<string, HtmlTemplate>([
  [resumeElegantTemplate.id, resumeElegantTemplate],
  [letterElegantTemplate.id, letterElegantTemplate],
]);

export function getTemplate(templateId: string): HtmlTemplate {
  const template = templates.get(templateId);

  if (!template) {
    throw new Error(`Unknown template "${templateId}".`);
  }

  return template;
}
