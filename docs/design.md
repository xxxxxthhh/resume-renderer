# AI Application Materials Renderer Design

## Purpose

Build a small open-source tool that helps developers keep application materials in Markdown, use AI to review and adapt them responsibly, and export polished recruiter-ready PDFs.

The project should not be "yet another Markdown-to-PDF wrapper." Its reason to exist is the workflow around the renderer:

- Compare a base resume against a specific job description.
- Surface keyword, evidence, and clarity gaps.
- Generate human-reviewable suggestions instead of silently rewriting the source.
- Produce elegant HTML/PDF outputs once the human has accepted the changes.

The current implementation has completed the rendering layer. The OpenAI-powered review layer is the next planned slice.

## Implementation Status

### Implemented in v0.1

- TypeScript CLI with `render` and `preview` commands.
- Config-driven Markdown rendering.
- Public example resume and cover-letter inputs under `examples/`.
- Elegant resume and cover-letter HTML templates.
- Playwright PDF export.
- Static preview server for generated output.
- Tests for config loading, CLI parsing, Markdown parsing, HTML rendering, examples, and end-to-end document rendering.

### Planned next

- OpenAI API integration for job-description review.
- Structured JSON and Markdown review reports.
- Optional cover-letter drafting from resume plus job description.
- Review report template.
- Public generic job-description example.

## Product Scope

### Renderer MVP

- Render `resume.md` into a recruiter-ready HTML preview and PDF.
- Render `cover-letter.md` into a polished HTML preview and PDF.
- Generate matching HTML previews for both documents.
- Keep generated outputs in `dist/`.
- Provide a single command that renders the configured document set.
- Keep source Markdown portable and readable without renderer-specific clutter.

### AI Review MVP

- Accept a job description Markdown file as analysis input.
- Use the OpenAI API to generate a structured application review report:
  - role fit summary
  - missing or weak evidence
  - ATS/keyword coverage notes
  - overclaim or credibility risks
  - concrete edit suggestions
- Optionally generate a draft tailored cover letter from `resume.md` and the job description.
- Never overwrite source files automatically; write AI outputs to `dist/reports/` or `workspaces/`.

### Later

- Add multiple visual templates.
- Add a browser preview server with live reload.
- Add an interactive accept/reject suggestion workflow.
- Add generic public examples for multiple roles.
- Add PDF visual regression checks or snapshot tests.
- Add theme tokens for typography, spacing, and accent color.

## Non-Goals

- Do not build a full web app in the first version.
- Do not require LaTeX, Pandoc, or system-level PDF tools.
- Do not auto-fabricate experience, skills, dates, metrics, or public proof.
- Do not auto-submit applications or scrape private job boards.
- Do not expose private application notes, private repos, phone numbers, or sensitive project details in public examples.
- Do not make the Markdown format overly custom.

## Architecture

Use a Node.js and TypeScript CLI with three clear layers:

1. Markdown document parsing and rendering.
2. OpenAI-powered application analysis.
3. HTML/PDF output generation.

```text
resume-renderer/
  src/
    cli.ts
    config.ts
    markdown/
      parseMarkdown.ts
      documentModel.ts
    ai/
      openaiClient.ts
      analyzeApplication.ts
      draftCoverLetter.ts
      prompts/
        applicationReview.ts
        coverLetterDraft.ts
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
      report-elegant/
        template.ts
        style.css
  examples/
    resume.md
    cover-letter.md
    job-description.md
  dist/
  docs/
    design.md
```

The `ai/` and `report-elegant/` pieces are planned. The renderer, Markdown parser, templates, and preview server are implemented.

## Workflow

```text
Markdown resume + optional cover letter + job description
  -> parse into a small document model
  -> run OpenAI application review
  -> write structured report and suggested edits
  -> human reviews and edits Markdown
  -> render HTML with chosen template
  -> apply print CSS
  -> export PDF with Chromium through Playwright
  -> write HTML, PDF, and review reports to dist/
```

The AI layer must be advisory. It can produce critique, missing-evidence notes, and draft text, but the user owns factual accuracy and final edits.

Playwright is the preferred PDF backend because it gives strong CSS support, clickable links, selectable text, and realistic print layout. The implementation pins the dependency and documents the browser install step.

## MVP Decisions

- The default config file is `resume-renderer.config.json`.
- Public example inputs live under `examples/` so the repository can be published without private application material.
- Relative paths in config resolve from the config file directory.
- Generated HTML and PDF outputs are overwritten on each render.
- The supported Markdown subset is headings, paragraphs, links, emphasis, strong text, ordered and unordered lists, nested lists, blockquotes, horizontal rules, and fenced code blocks.
- Raw HTML is escaped instead of rendered.
- The first H1 is the document title; content before the first H2 is lead/contact content; each H2 starts a top-level section.
- `preview` is an MVP static server for generated `dist/` files, not a live-reload browser app.

## OpenAI Integration

The OpenAI API should be used for structured, auditable outputs rather than opaque free-form rewriting.

### Application Review Output

The review command should produce JSON plus a readable Markdown report:

```json
{
  "roleFitSummary": "Short summary of fit and gaps",
  "keywordCoverage": [
    {
      "keyword": "developer experience",
      "status": "strong",
      "evidence": ["AI Coding Workflow / PLAN.md Harness"]
    }
  ],
  "missingEvidence": [
    {
      "claim": "public technical writing",
      "risk": "weak public proof",
      "suggestion": "Link a public bilingual tutorial or remove the claim"
    }
  ],
  "credibilityRisks": [
    {
      "text": "Built with Codex",
      "risk": "May sound like long-term usage if evidence is thin",
      "saferWording": "Used Codex in recent repo-aware local work"
    }
  ],
  "editSuggestions": [
    {
      "document": "resume",
      "section": "Selected Projects",
      "suggestion": "Move the public artifact before private projects"
    }
  ]
}
```

### Guardrails

- The model must not invent experience, metrics, employers, dates, degrees, certifications, or public links.
- The model should ask for evidence when a claim is unsupported.
- Suggested rewrites must preserve factual constraints from the source Markdown.
- AI output should be stored as review artifacts, not silently applied to source files.
- API keys must come from environment variables and must never be committed.

## Configuration

Use a small config file so the renderer is reusable. Public examples should point only to files under `examples/`.

```json
{
  "documents": [
    {
      "id": "resume",
      "input": "examples/resume.md",
      "template": "resume-elegant",
      "html": "dist/example-resume.html",
      "pdf": "dist/example-resume.pdf"
    },
    {
      "id": "cover-letter",
      "input": "examples/cover-letter.md",
      "template": "letter-elegant",
      "html": "dist/example-cover-letter.html",
      "pdf": "dist/example-cover-letter.pdf"
    }
  ],
  "analysis": {
    "jobDescription": "examples/job-description.md",
    "resume": "examples/resume.md",
    "coverLetter": "examples/cover-letter.md",
    "report": "dist/reports/application-review.md",
    "json": "dist/reports/application-review.json"
  }
}
```

The current renderer reads the `documents` section. The `analysis` section is reserved for the next OpenAI review slice.

A private local config can point to real application materials outside the public repository, but it should be ignored by git.

## Visual Direction

The default templates should feel elegant but conservative:

- Black and warm-gray typography with one restrained accent color.
- Clear section hierarchy without decorative cards.
- Tight spacing that supports a one-page or two-page resume.
- ATS-friendly text: selectable text, real links, no screenshot-based layout.
- Print-first CSS with explicit page margins and page-break handling.
- No heavy graphics, gradients, or ornamental backgrounds.

The resume template should prioritize scan speed: name and contact at top, concise summary, skills, projects, experience, education, certifications. The cover-letter template should prioritize comfortable reading and a strong first-page impression. The future review report template should prioritize evidence traceability and clear action items.

## CLI Shape

Implemented commands:

```bash
npm run render
npm run render:resume
npm run render:cover-letter
npm run preview
```

Planned commands:

```bash
npm run analyze
resume-renderer analyze --job examples/job-description.md
resume-renderer draft-cover-letter --job examples/job-description.md
```

## Quality Bar

The renderer MVP is acceptable when:

- Example resume and cover letter render to HTML and PDF.
- PDF text is selectable and links are clickable.
- No raw Markdown syntax leaks into the output.
- Page breaks do not split headings from their first content block.
- The renderer exits non-zero when an input file is missing or Markdown parsing fails.
- README documents setup, rendering, preview, privacy boundaries, and public example usage.

The AI review MVP will be acceptable when:

- The analyzer produces structured JSON and a readable Markdown report from example inputs.
- The analyzer refuses to proceed when the OpenAI API key is missing and explains how to configure it.
- The report flags missing evidence and credibility risks without fabricating content.
- AI outputs are written as review artifacts, not applied silently.

## Public-Release Strategy

Keep this as a standalone git repository from the first commit. Commit history should tell a clean story:

1. `docs: capture renderer design`
2. `docs: refocus tool around ai application review`
3. `chore: scaffold node cli`
4. `feat: parse markdown into document model`
5. `feat: render elegant resume html`
6. `feat: export pdf with playwright`
7. `docs: add public examples and usage`
8. `feat: analyze application materials with openai`

Before publishing, audit the repo for:

- `.env` files, API keys, tokens, and local paths.
- Private application materials that should not become examples.
- Generated PDFs that contain personal phone numbers or private notes if the repo is intended to be generic.
- AI reports that quote private job descriptions or personal notes.
- Dependency lockfile quality and reproducible install instructions.

## Resume Story

Once public, the renderer MVP can be described as:

> Built an open-source Markdown-to-PDF application-materials renderer with TypeScript, print CSS, and Playwright PDF export, turning Markdown resumes and cover letters into polished recruiter-ready PDFs with inspectable HTML previews.

After the OpenAI review slice lands, the stronger story becomes:

> Built an open-source AI-assisted application materials workflow with TypeScript, OpenAI API analysis, structured Markdown reports, print CSS, and Playwright PDF export, helping developers compare resumes against job descriptions and generate polished recruiter-ready PDFs without losing human control over factual claims.

## Timing

This project should not block application submission. It belongs to the post-submission proof-building track and can later become a public GitHub pin.
