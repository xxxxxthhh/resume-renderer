import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { renderDocuments } from "../src/render/renderDocuments";
import type { PdfWriter } from "../src/render/renderPdf";

const tempRoots: string[] = [];

async function createProject(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "resume-renderer-run-"));
  tempRoots.push(root);
  await mkdir(path.join(root, "inputs"), { recursive: true });
  await writeFile(
    path.join(root, "inputs/resume.md"),
    "# Ada Lovelace\n\nada@example.com\n\n## Summary\n\nBuilds **tools**.",
    "utf8",
  );
  await writeFile(
    path.join(root, "inputs/letter.md"),
    "# Ada Lovelace\n\nMay 20, 2026\n\n## OpenAI\n\nHello.",
    "utf8",
  );
  await writeFile(
    path.join(root, "resume-renderer.config.json"),
    JSON.stringify(
      {
        documents: [
          {
            id: "resume",
            input: "inputs/resume.md",
            template: "resume-elegant",
            html: "dist/resume/index.html",
            pdf: "dist/resume/resume.pdf",
          },
          {
            id: "cover-letter",
            input: "inputs/letter.md",
            template: "letter-elegant",
            html: "dist/letter/index.html",
            pdf: "dist/letter/letter.pdf",
          },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );
  return root;
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("renderDocuments", () => {
  it("renders every configured document to HTML and PDF outputs", async () => {
    const root = await createProject();
    const writePdf = vi.fn<PdfWriter>(async ({ html, outputPath }) => {
      await writeFile(outputPath, `PDF:${html.length}`, "utf8");
    });

    const results = await renderDocuments({
      configPath: path.join(root, "resume-renderer.config.json"),
      writePdf,
    });

    expect(results.map((result) => result.id)).toEqual(["resume", "cover-letter"]);
    expect(await readFile(path.join(root, "dist/resume/index.html"), "utf8")).toContain(
      'class="resume-document"',
    );
    expect(await readFile(path.join(root, "dist/letter/index.html"), "utf8")).toContain(
      'class="letter-document"',
    );
    expect(await readFile(path.join(root, "dist/resume/resume.pdf"), "utf8")).toMatch(/^PDF:/);
    expect(writePdf).toHaveBeenCalledTimes(2);
  });

  it("renders only a selected document", async () => {
    const root = await createProject();
    const writePdf = vi.fn<PdfWriter>(async ({ outputPath }) => {
      await writeFile(outputPath, "PDF", "utf8");
    });

    const results = await renderDocuments({
      configPath: path.join(root, "resume-renderer.config.json"),
      documentId: "cover-letter",
      writePdf,
    });

    expect(results.map((result) => result.id)).toEqual(["cover-letter"]);
    expect(writePdf).toHaveBeenCalledTimes(1);
    await expect(readFile(path.join(root, "dist/resume/index.html"), "utf8")).rejects.toThrow();
  });

  it("surfaces missing input errors", async () => {
    const root = await createProject();
    await writeFile(
      path.join(root, "resume-renderer.config.json"),
      JSON.stringify({
        documents: [
          {
            id: "resume",
            input: "missing.md",
            template: "resume-elegant",
            html: "dist/resume.html",
            pdf: "dist/resume.pdf",
          },
        ],
      }),
      "utf8",
    );

    await expect(
      renderDocuments({ configPath: path.join(root, "resume-renderer.config.json") }),
    ).rejects.toThrow(/Input file does not exist/);
  });
});
