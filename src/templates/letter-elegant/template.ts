import type { ParsedMarkdownDocument } from "../../markdown/documentModel";
import { escapeHtml } from "../../utils/html";
import type { HtmlTemplate, TemplateRenderContext } from "../types";

export const letterElegantTemplate: HtmlTemplate = {
  id: "letter-elegant",
  cssFile: new URL("./style.css", import.meta.url),
  render(document, context) {
    return renderLetter(document, context);
  },
};

function renderLetter(document: ParsedMarkdownDocument, context: TemplateRenderContext): string {
  const lead = document.leadHtml ? `<div class="letter-lead">${document.leadHtml}</div>` : "";
  const sections = document.sections.map(renderSection).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(document.title)}</title>
  <style>${context.css}</style>
</head>
<body>
  <article class="letter-document" aria-label="${escapeHtml(document.title)} cover letter">
    <header class="letter-header">
      <h1>${escapeHtml(document.title)}</h1>
      ${lead}
    </header>
    ${sections}
  </article>
</body>
</html>`;
}

function renderSection(section: ParsedMarkdownDocument["sections"][number]): string {
  return `<section class="letter-section" id="${escapeHtml(section.slug)}">
  <h2>${escapeHtml(section.title)}</h2>
  <div class="section-body">
${section.html}
  </div>
</section>`;
}
