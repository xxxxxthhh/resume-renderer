# Resume Renderer

Markdown-to-PDF renderer for polished application materials.

This is a standalone project extracted from an application-materials workflow. The goal is to keep source documents in Markdown while producing elegant, recruiter-ready PDFs through a repeatable, reviewable, open-source toolchain.

## Current Status

MVP renderer implemented:

- TypeScript CLI for rendering configured Markdown documents.
- Public example resume and cover letter inputs under `examples/`.
- Matching HTML and PDF outputs under `dist/`.
- Print-first resume and cover-letter templates.
- Playwright-powered PDF export with selectable text and clickable links.

See [docs/design.md](docs/design.md) for the design background.

## Setup

```bash
npm install
npx playwright install chromium
```

Playwright needs a local Chromium browser for PDF export. Unit tests do not require the browser, but `npm run render` does.

## Render

```bash
npm run render
npm run render:resume
npm run render:cover-letter
```

Generated files:

- `dist/example-resume.html`
- `dist/example-resume.pdf`
- `dist/example-cover-letter.html`
- `dist/example-cover-letter.pdf`

## Preview

```bash
npm run preview
```

The preview command renders the configured documents, then starts a small static server for the generated output directory.

## Configuration

The default config file is `resume-renderer.config.json`.

```json
{
  "documents": [
    {
      "id": "resume",
      "input": "examples/resume.md",
      "template": "resume-elegant",
      "html": "dist/example-resume.html",
      "pdf": "dist/example-resume.pdf"
    }
  ]
}
```

Relative paths resolve from the config file location. Outputs are overwritten on each render.

To render private application materials, create a separate local config and point it at files outside this public repo:

```bash
npm run render -- --config ../private-materials/resume-renderer.config.json
```

## Markdown Contract

Supported Markdown includes headings, paragraphs, links, emphasis, strong text, ordered and unordered lists, nested lists, blockquotes, horizontal rules, and fenced code blocks. Raw HTML is escaped instead of rendered.

The first H1 is the document title. Content before the first H2 is treated as lead/contact content. Each H2 starts a top-level section.

## Quality Commands

```bash
npm test
npm run typecheck
git diff --check
```
