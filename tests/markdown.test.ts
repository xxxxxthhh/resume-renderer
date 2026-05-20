import { describe, expect, it } from "vitest";

import { parseMarkdown } from "../src/markdown/parseMarkdown";

describe("parseMarkdown", () => {
  it("extracts the H1 title, lead content, and H2 sections", () => {
    const document = parseMarkdown(`# Ada Lovelace

ada@example.com | [GitHub](https://github.com/ada)

## Experience

### Analytical Engine Lab

- Built **reusable** calculation notes.
- Improved developer tooling.

## Education

Babbage Institute
`);

    expect(document.title).toBe("Ada Lovelace");
    expect(document.leadHtml).toContain('<a href="https://github.com/ada">GitHub</a>');
    expect(document.sections.map((section) => section.title)).toEqual(["Experience", "Education"]);
    expect(document.sections[0].html).toContain("<h3>Analytical Engine Lab</h3>");
    expect(document.sections[0].html).toContain("<strong>reusable</strong>");
    expect(document.outline).toEqual([
      { depth: 2, title: "Experience", slug: "experience" },
      { depth: 3, title: "Analytical Engine Lab", slug: "analytical-engine-lab" },
      { depth: 2, title: "Education", slug: "education" },
    ]);
  });

  it("renders nested lists without leaking Markdown syntax", () => {
    const document = parseMarkdown(`# Example

## Skills

- Languages
  - TypeScript
  - Python
- Systems
  1. CLIs
  2. PDF rendering
`);

    expect(document.sections[0].html).toContain("<ul>");
    expect(document.sections[0].html).toContain("<ol>");
    expect(document.sections[0].html).toContain("<li>TypeScript</li>");
    expect(document.sections[0].html).not.toContain("- TypeScript");
  });

  it("escapes raw HTML instead of rendering it", () => {
    const document = parseMarkdown(`# Example

<script>alert("nope")</script>

## Work

Used <span>inline HTML</span> in source.
`);

    expect(document.leadHtml).toContain("&lt;script&gt;");
    expect(document.leadHtml).not.toContain("<script>");
    expect(document.sections[0].html).toContain("&lt;span&gt;inline HTML&lt;/span&gt;");
    expect(document.sections[0].html).not.toContain("<span>inline HTML</span>");
  });

  it("rejects empty Markdown", () => {
    expect(() => parseMarkdown(" \n\t ")).toThrow(/Markdown document is empty/);
  });

  it("rejects documents without an H1 title", () => {
    expect(() => parseMarkdown("## Experience\n\nNo name here.")).toThrow(/must start with an H1 title/);
  });
});
