import type { ParsedMarkdownDocument } from "../../markdown/documentModel";
import { escapeHtml } from "../../utils/html";
import type { HtmlTemplate, TemplateRenderContext } from "../types";

export const resumeElegantTemplate: HtmlTemplate = {
  id: "resume-elegant",
  cssFile: new URL("./style.css", import.meta.url),
  render(document, context) {
    return renderResume(document, context);
  },
};

function renderResume(document: ParsedMarkdownDocument, context: TemplateRenderContext): string {
  const lead = document.leadHtml
    ? `<div class="resume-lead">${document.leadHtml}</div>`
    : "";
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
  <main class="resume-document" aria-label="${escapeHtml(document.title)} resume">
    <header class="resume-header">
      <h1>${escapeHtml(document.title)}</h1>
      ${lead}
    </header>
    ${sections}
  </main>
</body>
</html>`;
}

function renderSection(section: ParsedMarkdownDocument["sections"][number]): string {
  return `<section class="resume-section" id="${escapeHtml(section.slug)}">
  <h2>${escapeHtml(section.title)}</h2>
  <div class="section-body">
${section.html}
  </div>
</section>`;
}
