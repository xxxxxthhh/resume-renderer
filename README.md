# Resume Renderer

Markdown-to-HTML/PDF renderer for polished application materials.

Resume Renderer keeps resumes and cover letters in plain Markdown, then renders them into clean HTML previews and recruiter-ready PDFs. It is designed for people who want version-controlled application materials without giving up polished output.

The current version implements the rendering layer. A later slice may add optional AI-assisted job-description review, but the renderer works without any API keys.

## Current Status

Renderer MVP implemented:

- TypeScript CLI for rendering configured Markdown documents.
- Public example resume and cover letter inputs under `examples/`.
- Matching HTML and PDF outputs under `dist/`.
- Print-first resume and cover-letter templates.
- Playwright-powered PDF export with selectable text and clickable links.
- Test coverage for config loading, Markdown parsing, HTML rendering, CLI parsing, and document rendering.

Planned AI layer:

- Compare a resume and cover letter against a job description.
- Generate a structured application review report with keyword coverage, evidence gaps, credibility risks, and concrete edit suggestions.
- Keep AI output advisory and human-reviewed; never overwrite source Markdown automatically.

See [docs/design.md](docs/design.md) for the full design direction.

## Quick Start

```bash
npm install
npx playwright install chromium
npm run render
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

`dist/` is ignored by git so generated documents do not get committed by accident.

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

To render your own application materials, create a separate local config and point it at files outside this repo:

```bash
npm run render -- --config ../my-application-materials/resume-renderer.config.json
```

Keep local configs and generated personal PDFs out of git if they contain contact details, job descriptions, or other non-public material.

## Markdown Contract

Supported Markdown includes headings, paragraphs, links, emphasis, strong text, ordered and unordered lists, nested lists, blockquotes, horizontal rules, and fenced code blocks. Raw HTML is escaped instead of rendered.

The first H1 is the document title. Content before the first H2 is treated as lead/contact content. Each H2 starts a top-level section.

## Quality Commands

```bash
npm test
npm run typecheck
git diff --check
```

## Privacy Notes

- Public examples use fictional names, emails, companies, and links.
- Raw HTML in Markdown is escaped instead of rendered.
- Generated HTML/PDF output is ignored by default.
- API keys, local configs, and personal application materials should stay outside this repository.
