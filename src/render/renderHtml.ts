import { fileURLToPath } from "node:url";

import type { ParsedMarkdownDocument } from "../markdown/documentModel";
import { getTemplate } from "../templates";
import { readTextFile } from "../utils/files";

export async function renderHtml(
  document: ParsedMarkdownDocument,
  templateId: string,
): Promise<string> {
  const template = getTemplate(templateId);
  const css = await readTextFile(fileURLToPath(template.cssFile));

  return template.render(document, { css });
}
