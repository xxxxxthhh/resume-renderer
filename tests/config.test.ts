import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadConfig, selectDocuments } from "../src/config";

const tempRoots: string[] = [];

async function createTempRoot(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "resume-renderer-config-"));
  tempRoots.push(root);
  return root;
}

async function writeConfig(root: string, documents = [baseDocument()]) {
  const configPath = path.join(root, "resume-renderer.config.json");
  await writeFile(configPath, JSON.stringify({ documents }, null, 2), "utf8");
  return configPath;
}

function baseDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: "resume",
    input: "resume.md",
    template: "resume-elegant",
    html: "dist/resume.html",
    pdf: "dist/resume.pdf",
    ...overrides,
  };
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("loadConfig", () => {
  it("loads documents and resolves paths relative to the config file", async () => {
    const root = await createTempRoot();
    await writeFile(path.join(root, "resume.md"), "# Example Resume\n\nHello.", "utf8");
    const configPath = await writeConfig(root);

    const config = await loadConfig(configPath);

    expect(config.configPath).toBe(configPath);
    expect(config.documents).toHaveLength(1);
    expect(config.documents[0]).toMatchObject({
      id: "resume",
      inputPath: path.join(root, "resume.md"),
      htmlPath: path.join(root, "dist/resume.html"),
      pdfPath: path.join(root, "dist/resume.pdf"),
      template: "resume-elegant",
    });
  });

  it("rejects missing input files", async () => {
    const root = await createTempRoot();
    const configPath = await writeConfig(root);

    await expect(loadConfig(configPath)).rejects.toThrow(/Input file does not exist/);
  });

  it("rejects unknown template IDs", async () => {
    const root = await createTempRoot();
    await writeFile(path.join(root, "resume.md"), "# Example Resume\n", "utf8");
    const configPath = await writeConfig(root, [baseDocument({ template: "flashy" })]);

    await expect(loadConfig(configPath)).rejects.toThrow(/Unknown template "flashy"/);
  });
});

describe("selectDocuments", () => {
  it("returns all documents when no ID is selected", async () => {
    const root = await createTempRoot();
    await writeFile(path.join(root, "resume.md"), "# Resume\n", "utf8");
    await writeFile(path.join(root, "letter.md"), "# Letter\n", "utf8");
    const configPath = await writeConfig(root, [
      baseDocument(),
      baseDocument({
        id: "cover-letter",
        input: "letter.md",
        template: "letter-elegant",
        html: "dist/letter.html",
        pdf: "dist/letter.pdf",
      }),
    ]);
    const config = await loadConfig(configPath);

    expect(selectDocuments(config).map((document) => document.id)).toEqual(["resume", "cover-letter"]);
  });

  it("returns one selected document by ID", async () => {
    const root = await createTempRoot();
    await writeFile(path.join(root, "resume.md"), "# Resume\n", "utf8");
    await writeFile(path.join(root, "letter.md"), "# Letter\n", "utf8");
    const configPath = await writeConfig(root, [
      baseDocument(),
      baseDocument({
        id: "cover-letter",
        input: "letter.md",
        template: "letter-elegant",
        html: "dist/letter.html",
        pdf: "dist/letter.pdf",
      }),
    ]);
    const config = await loadConfig(configPath);

    expect(selectDocuments(config, "cover-letter").map((document) => document.id)).toEqual(["cover-letter"]);
  });

  it("rejects unknown selected document IDs", async () => {
    const root = await createTempRoot();
    await writeFile(path.join(root, "resume.md"), "# Resume\n", "utf8");
    const configPath = await writeConfig(root);
    const config = await loadConfig(configPath);

    expect(() => selectDocuments(config, "missing")).toThrow(/Document "missing" was not found/);
  });
});
