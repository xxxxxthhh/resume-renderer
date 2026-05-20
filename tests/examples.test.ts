import { readFile, rm, writeFile } from "node:fs/promises";

import { afterEach, describe, expect, it } from "vitest";

import { renderDocuments } from "../src/render/renderDocuments";
import type { PdfWriter } from "../src/render/renderPdf";

afterEach(async () => {
  await rm("dist", { recursive: true, force: true });
});

describe("public examples", () => {
  it("renders the default example resume and cover letter config", async () => {
    const writePdf: PdfWriter = async ({ outputPath }) => {
      await writeFile(outputPath, "PDF", "utf8");
    };

    const results = await renderDocuments({
      configPath: "resume-renderer.config.json",
      writePdf,
    });

    expect(results.map((result) => result.id)).toEqual(["resume", "cover-letter"]);
    expect(await readFile("dist/example-resume.html", "utf8")).toContain("Example Candidate");
    expect(await readFile("dist/example-cover-letter.html", "utf8")).toContain("Dear hiring team");
    expect(await readFile("dist/example-resume.pdf", "utf8")).toBe("PDF");
    expect(await readFile("dist/example-cover-letter.pdf", "utf8")).toBe("PDF");
  });
});
