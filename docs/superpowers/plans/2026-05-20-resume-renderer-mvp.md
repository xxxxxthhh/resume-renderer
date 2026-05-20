# Resume Renderer MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TypeScript CLI that renders portable Markdown resumes and cover letters into elegant HTML previews and Playwright-generated PDFs.

**Architecture:** The renderer loads a JSON config, resolves document paths relative to the config file, parses Markdown into a small document model, renders the model through print-first templates, and exports PDFs with Chromium through Playwright. Public examples are the default inputs so the repository is safe to publish.

**Tech Stack:** Node.js, TypeScript, `marked` for Markdown tokenization/rendering, Playwright for PDF export, Vitest for unit tests, and `tsx` for local CLI execution.

---

## Design Decisions To Lock

- Supported Markdown: headings, paragraphs, links, emphasis, strong text, unordered and ordered lists including nesting, blockquotes, horizontal rules, and fenced code blocks. Raw HTML is escaped instead of rendered.
- Document model: first H1 becomes the document title; content before the first H2 becomes lead/contact content; each H2 becomes a section; H3-H6 stay inside the current section body.
- Config default: `resume-renderer.config.json` in the current working directory. Relative input/output paths resolve from the config file directory.
- Output policy: create parent directories as needed and overwrite generated HTML/PDF files.
- Validation: fail fast for missing config, invalid document IDs, missing input files, missing H1 title, unknown template IDs, and empty Markdown bodies.
- Preview scope: MVP `preview` is a small static `dist/` server after rendering, not live reload.
- ATS safety: no icon fonts, no screenshot-based content, no CSS-generated important text, no decorative cards, no multi-column reading-order tricks.

## File Structure

- Create `package.json`, `package-lock.json`, `tsconfig.json`, and `vitest.config.ts` for the Node/TypeScript project.
- Create `resume-renderer.config.json` pointing to public examples under `examples/`.
- Create `src/config.ts` for config loading, path resolution, and validation.
- Create `src/markdown/documentModel.ts` and `src/markdown/parseMarkdown.ts` for the parse boundary.
- Create `src/templates/index.ts`, `src/templates/types.ts`, `src/templates/resume-elegant/template.ts`, `src/templates/resume-elegant/style.css`, `src/templates/letter-elegant/template.ts`, and `src/templates/letter-elegant/style.css`.
- Create `src/render/renderHtml.ts`, `src/render/renderPdf.ts`, and `src/render/renderDocuments.ts`.
- Create `src/cli.ts` for `render` and `preview`.
- Create `src/utils/html.ts`, `src/utils/files.ts`, and `src/utils/server.ts` for shared helpers.
- Create `examples/resume.md` and `examples/cover-letter.md`.
- Create tests under `tests/` for config, Markdown parsing, HTML rendering, and CLI argument behavior.
- Update `README.md` and `docs/design.md` with implementation details learned from the design review.

---

### Task 1: Scaffold The TypeScript CLI Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/cli.ts`
- Create: `tests/cli.test.ts`

- [ ] **Step 1: Write the failing CLI unit test**

Create `tests/cli.test.ts` with tests for parsing:

```ts
import { describe, expect, it } from "vitest";
import { parseCliArgs } from "../src/cli";

describe("parseCliArgs", () => {
  it("defaults to rendering all configured documents", () => {
    expect(parseCliArgs(["render"])).toEqual({
      command: "render",
      configPath: "resume-renderer.config.json",
      documentId: undefined,
    });
  });

  it("parses a selected document and custom config path", () => {
    expect(parseCliArgs(["render", "--document", "resume", "--config", "custom.json"])).toEqual({
      command: "render",
      configPath: "custom.json",
      documentId: "resume",
    });
  });

  it("parses preview with a default port", () => {
    expect(parseCliArgs(["preview"])).toEqual({
      command: "preview",
      configPath: "resume-renderer.config.json",
      documentId: undefined,
      port: 4173,
    });
  });
});
```

- [ ] **Step 2: Run test to verify RED**

Run: `npm test -- tests/cli.test.ts`

Expected: FAIL because `package.json`, Vitest, and `src/cli.ts` do not exist yet.

- [ ] **Step 3: Add project scaffolding and minimal CLI parser**

Create scripts:

```json
{
  "scripts": {
    "render": "tsx src/cli.ts render",
    "render:resume": "tsx src/cli.ts render --document resume",
    "render:cover-letter": "tsx src/cli.ts render --document cover-letter",
    "preview": "tsx src/cli.ts preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

Implement `parseCliArgs` with support for `render`, `preview`, `--config`, `--document`, and `--port`.

- [ ] **Step 4: Install dependencies and verify GREEN**

Run: `npm install`

Run: `npm test -- tests/cli.test.ts`

Expected: PASS for CLI parser tests.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts src/cli.ts tests/cli.test.ts
git commit -m "chore: scaffold node cli"
```

---

### Task 2: Load And Validate Renderer Config

**Files:**
- Create: `src/config.ts`
- Create: `src/utils/files.ts`
- Create: `resume-renderer.config.json`
- Create: `tests/config.test.ts`

- [ ] **Step 1: Write failing config tests**

Cover default config filename, relative path resolution, document filtering, unknown document IDs, unknown templates, and missing input files.

- [ ] **Step 2: Run test to verify RED**

Run: `npm test -- tests/config.test.ts`

Expected: FAIL because `loadConfig` is not implemented.

- [ ] **Step 3: Implement config loader**

Implement:

```ts
loadConfig(configPath: string): Promise<RendererConfig>
selectDocuments(config: RendererConfig, documentId?: string): RenderDocumentConfig[]
```

Resolved document configs must include absolute `inputPath`, `htmlPath`, and `pdfPath`.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/config.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config.ts src/utils/files.ts resume-renderer.config.json tests/config.test.ts
git commit -m "feat: load renderer config"
```

---

### Task 3: Parse Markdown Into A Document Model

**Files:**
- Create: `src/markdown/documentModel.ts`
- Create: `src/markdown/parseMarkdown.ts`
- Create: `src/utils/html.ts`
- Create: `tests/markdown.test.ts`

- [ ] **Step 1: Write failing parser tests**

Cover H1 title extraction, lead/contact content, H2 sections, nested lists, links/emphasis rendering, raw HTML escaping, and empty Markdown validation.

- [ ] **Step 2: Run test to verify RED**

Run: `npm test -- tests/markdown.test.ts`

Expected: FAIL because parser modules do not exist.

- [ ] **Step 3: Implement parser**

Use `marked` lexer/parser. Escape raw HTML tokens, normalize title/sections, and preserve selectable link text in rendered HTML.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/markdown.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/markdown src/utils/html.ts tests/markdown.test.ts
git commit -m "feat: parse markdown into document model"
```

---

### Task 4: Render Elegant HTML Templates

**Files:**
- Create: `src/templates/types.ts`
- Create: `src/templates/index.ts`
- Create: `src/templates/resume-elegant/template.ts`
- Create: `src/templates/resume-elegant/style.css`
- Create: `src/templates/letter-elegant/template.ts`
- Create: `src/templates/letter-elegant/style.css`
- Create: `src/render/renderHtml.ts`
- Create: `tests/renderHtml.test.ts`

- [ ] **Step 1: Write failing HTML rendering tests**

Cover full HTML document output, CSS inlining, unknown template errors, no raw Markdown leakage, title metadata, section wrappers, and print CSS presence.

- [ ] **Step 2: Run test to verify RED**

Run: `npm test -- tests/renderHtml.test.ts`

Expected: FAIL because template modules do not exist.

- [ ] **Step 3: Implement templates**

Render ATS-friendly HTML with semantic headings, readable text order, print-first CSS, explicit `@page` rules, and page-break controls.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/renderHtml.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/templates src/render/renderHtml.ts tests/renderHtml.test.ts
git commit -m "feat: render elegant html templates"
```

---

### Task 5: Export PDFs And Wire Render Command

**Files:**
- Create: `src/render/renderPdf.ts`
- Create: `src/render/renderDocuments.ts`
- Modify: `src/cli.ts`
- Create: `tests/renderDocuments.test.ts`

- [ ] **Step 1: Write failing render orchestration tests**

Cover writing HTML, selecting one document, creating output directories, surfacing missing input errors, and calling PDF export through an injectable function.

- [ ] **Step 2: Run test to verify RED**

Run: `npm test -- tests/renderDocuments.test.ts`

Expected: FAIL because render orchestration is not implemented.

- [ ] **Step 3: Implement render orchestration and Playwright PDF export**

Implement `renderDocuments` with injectable `writePdf` for tests. Implement `renderPdf` with Chromium, `page.setContent`, `page.pdf({ printBackground: true, preferCSSPageSize: true })`.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/renderDocuments.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/render src/cli.ts tests/renderDocuments.test.ts
git commit -m "feat: export pdf with playwright"
```

---

### Task 6: Add Public Examples, Preview, Docs, And End-To-End Verification

**Files:**
- Create: `examples/resume.md`
- Create: `examples/cover-letter.md`
- Create: `src/utils/server.ts`
- Modify: `README.md`
- Modify: `docs/design.md`
- Modify: `src/cli.ts`

- [ ] **Step 1: Write or update tests**

Extend CLI tests for `preview --port 5000`; extend render tests to use public examples.

- [ ] **Step 2: Add examples and preview server**

Create realistic generic examples with no private details. Implement static serving of generated `dist/` files after running render.

- [ ] **Step 3: Update docs**

README must document setup, `npm install`, `npx playwright install chromium`, render commands, config shape, public/private input guidance, and troubleshooting.

- [ ] **Step 4: Run full verification**

Run:

```bash
npm test
npm run typecheck
npm run render
git diff --check
```

Expected: all commands exit 0, `dist/example-resume.html`, `dist/example-resume.pdf`, `dist/example-cover-letter.html`, and `dist/example-cover-letter.pdf` exist.

- [ ] **Step 5: Commit**

```bash
git add examples src README.md docs/design.md
git commit -m "docs: add public examples and usage"
```
