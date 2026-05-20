# Markdown Application Renderer Design

## Purpose

Build a small open-source renderer that turns Markdown application materials into polished PDF documents. The immediate use case is an OpenAI application package, but the project should stand alone as a useful developer tool: Markdown in, elegant HTML/PDF out.

The project should demonstrate the same DevEx story as the application itself: clear inputs, predictable outputs, inspectable intermediate artifacts, good defaults, and a workflow that is easy for another developer to run.

## Product Scope

### MVP

- Render `resume.md` into a recruiter-ready PDF.
- Render `cover-letter.md` into a polished PDF.
- Generate matching HTML previews for both documents.
- Keep generated outputs in `dist/`.
- Provide a single command that renders the configured document set.
- Keep source Markdown portable and readable without renderer-specific clutter.

### Later

- Add multiple visual templates.
- Add a browser preview server with live reload.
- Add generic example documents so the repo can be public without exposing private application materials.
- Add PDF visual regression checks or snapshot tests.
- Add theme tokens for typography, spacing, and accent color.

## Non-Goals

- Do not build a full web app in the first version.
- Do not require LaTeX, Pandoc, or system-level PDF tools.
- Do not make the Markdown format overly custom.
- Do not expose private application notes, private repos, or sensitive project details in public examples.

## Recommended Architecture

Use a Node.js and TypeScript CLI with browser-based PDF generation.

```text
resume-renderer/
  src/
    cli.ts
    config.ts
    markdown/
      parseMarkdown.ts
      documentModel.ts
    render/
      renderHtml.ts
      renderPdf.ts
    templates/
      resume-elegant/
        template.ts
        style.css
      letter-elegant/
        template.ts
        style.css
  examples/
    resume.md
    cover-letter.md
  dist/
  docs/
    design.md
```

## Rendering Flow

```text
Markdown source
  -> parse headings, paragraphs, links, lists, and emphasis
  -> normalize into a small document model
  -> render HTML with a chosen template
  -> apply print CSS
  -> export PDF with Chromium through Playwright
  -> write HTML and PDF outputs to dist/
```

Playwright is the preferred PDF backend because it gives strong CSS support, clickable links, selectable text, and realistic print layout. The implementation should pin the dependency and document the browser install step.

## Configuration

Use a small config file so the renderer is reusable and the application materials stay outside the renderer project.

```json
{
  "documents": [
    {
      "id": "resume",
      "input": "../resume/resume.md",
      "template": "resume-elegant",
      "html": "dist/Tianhao-Xu-Resume.html",
      "pdf": "dist/Tianhao-Xu-Resume.pdf"
    },
    {
      "id": "cover-letter",
      "input": "../cover-letter/cover-letter.md",
      "template": "letter-elegant",
      "html": "dist/Tianhao-Xu-Cover-Letter.html",
      "pdf": "dist/Tianhao-Xu-Cover-Letter.pdf"
    }
  ]
}
```

For the public repository, replace these with generic examples under `examples/`.

## Visual Direction

The default template should feel elegant but conservative:

- Black and warm-gray typography with one restrained accent color.
- Clear section hierarchy without decorative cards.
- Tight spacing that supports a one-page or two-page resume.
- ATS-friendly text: selectable text, real links, no screenshot-based layout.
- Print-first CSS with explicit page margins and page-break handling.
- No heavy graphics, gradients, or ornamental backgrounds.

The resume template should prioritize scan speed: name and contact at top, concise summary, skills, projects, experience, education, certifications. The cover-letter template should prioritize comfortable reading and a strong first-page impression.

## CLI Shape

Target commands:

```bash
npm run render
npm run render:resume
npm run render:cover-letter
npm run preview
```

Implementation commands can wrap a TypeScript CLI:

```bash
resume-renderer render
resume-renderer render --document resume
resume-renderer preview
```

## Quality Bar

The MVP is acceptable when:

- Current resume and cover letter render to HTML and PDF.
- PDF text is selectable and links are clickable.
- No raw Markdown syntax leaks into the output.
- Page breaks do not split headings from their first content block.
- The renderer exits non-zero when an input file is missing or Markdown parsing fails.
- README documents setup, rendering, and how to replace private input files with public examples.

## Public-Release Strategy

Keep this as a standalone git repository from the first commit. Commit history should tell a clean story:

1. `docs: capture renderer design`
2. `chore: scaffold node cli`
3. `feat: parse markdown into document model`
4. `feat: render elegant resume html`
5. `feat: export pdf with playwright`
6. `feat: render cover letter`
7. `docs: add public examples and usage`

Before publishing, audit the repo for:

- `.env` files, API keys, tokens, and local paths.
- Private application materials that should not become examples.
- Generated PDFs that contain personal phone or private notes if the repo is intended to be generic.
- Dependency lockfile quality and reproducible install instructions.

## Resume Story

Once public, this project can be described as:

> Built an open-source Markdown-to-PDF application-materials renderer with TypeScript, print CSS, and Playwright PDF export, turning Markdown resumes and cover letters into polished recruiter-ready PDFs with inspectable HTML previews.

