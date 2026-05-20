import { describe, expect, it } from "vitest";

import { parseMarkdown } from "../src/markdown/parseMarkdown";
import { renderHtml } from "../src/render/renderHtml";

const resumeMarkdown = `# Ada Lovelace

ada@example.com | [GitHub](https://github.com/ada)

## Summary

Developer focused on **clear tools** and reliable systems.

## Experience

### Analytical Engine Lab

- Built renderer CLIs.
`;

describe("renderHtml", () => {
  it("renders a complete resume HTML document with inlined print CSS", async () => {
    const html = await renderHtml(parseMarkdown(resumeMarkdown), "resume-elegant");

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("<title>Ada Lovelace</title>");
    expect(html).toContain("@page");
    expect(html).toContain('class="resume-document"');
    expect(html).toContain('<section class="resume-section" id="summary">');
    expect(html).toContain("<strong>clear tools</strong>");
    expect(html).not.toContain("**clear tools**");
  });

  it("renders a complete cover letter HTML document", async () => {
    const html = await renderHtml(parseMarkdown(`# Ada Lovelace

May 20, 2026

## Example Team

Dear hiring team,

I build careful developer tools.
`), "letter-elegant");

    expect(html).toContain('class="letter-document"');
    expect(html).toContain("<h1>Ada Lovelace</h1>");
    expect(html).toContain('<section class="letter-section" id="example-team">');
    expect(html).toContain("Dear hiring team");
  });

  it("escapes document titles in metadata", async () => {
    const html = await renderHtml(parseMarkdown(`# Ada <Engineer>

## Summary

Hello.
`), "resume-elegant");

    expect(html).toContain("<title>Ada &lt;Engineer&gt;</title>");
    expect(html).toContain("<h1>Ada &lt;Engineer&gt;</h1>");
    expect(html).not.toContain("<title>Ada <Engineer></title>");
  });

  it("rejects unknown templates", async () => {
    await expect(renderHtml(parseMarkdown(resumeMarkdown), "unknown-template")).rejects.toThrow(
      /Unknown template/,
    );
  });
});
