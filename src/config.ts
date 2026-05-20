import path from "node:path";

import { pathExists, readTextFile } from "./utils/files";

export const SUPPORTED_TEMPLATE_IDS = ["resume-elegant", "letter-elegant"] as const;

export type TemplateId = (typeof SUPPORTED_TEMPLATE_IDS)[number];

export interface RawDocumentConfig {
  id: string;
  input: string;
  template: TemplateId;
  html: string;
  pdf: string;
}

export interface RenderDocumentConfig extends RawDocumentConfig {
  inputPath: string;
  htmlPath: string;
  pdfPath: string;
}

export interface RendererConfig {
  configPath: string;
  rootDir: string;
  documents: RenderDocumentConfig[];
}

interface RawRendererConfig {
  documents?: unknown;
}

export async function loadConfig(configPath: string): Promise<RendererConfig> {
  const absoluteConfigPath = path.resolve(configPath);

  if (!(await pathExists(absoluteConfigPath))) {
    throw new Error(`Config file does not exist: ${absoluteConfigPath}`);
  }

  const rawConfig = parseConfigJson(await readTextFile(absoluteConfigPath), absoluteConfigPath);
  const rootDir = path.dirname(absoluteConfigPath);
  const documents = await normalizeDocuments(rawConfig, rootDir);

  return {
    configPath: absoluteConfigPath,
    rootDir,
    documents,
  };
}

export function selectDocuments(
  config: RendererConfig,
  documentId?: string,
): RenderDocumentConfig[] {
  if (!documentId) {
    return config.documents;
  }

  const selected = config.documents.find((document) => document.id === documentId);

  if (!selected) {
    throw new Error(
      `Document "${documentId}" was not found. Available documents: ${config.documents
        .map((document) => document.id)
        .join(", ")}`,
    );
  }

  return [selected];
}

function parseConfigJson(contents: string, configPath: string): RawRendererConfig {
  try {
    return JSON.parse(contents) as RawRendererConfig;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not parse config JSON at ${configPath}: ${message}`);
  }
}

async function normalizeDocuments(
  rawConfig: RawRendererConfig,
  rootDir: string,
): Promise<RenderDocumentConfig[]> {
  if (!Array.isArray(rawConfig.documents) || rawConfig.documents.length === 0) {
    throw new Error("Config must define at least one document.");
  }

  const seenIds = new Set<string>();
  const documents: RenderDocumentConfig[] = [];

  for (const [index, rawDocument] of rawConfig.documents.entries()) {
    const document = normalizeDocument(rawDocument, index, rootDir);

    if (seenIds.has(document.id)) {
      throw new Error(`Duplicate document id "${document.id}".`);
    }

    seenIds.add(document.id);

    if (!(await pathExists(document.inputPath))) {
      throw new Error(`Input file does not exist for document "${document.id}": ${document.inputPath}`);
    }

    documents.push(document);
  }

  return documents;
}

function normalizeDocument(
  rawDocument: unknown,
  index: number,
  rootDir: string,
): RenderDocumentConfig {
  if (!isRecord(rawDocument)) {
    throw new Error(`Document at index ${index} must be an object.`);
  }

  const id = requireString(rawDocument, "id", index);
  const input = requireString(rawDocument, "input", index);
  const template = requireTemplateId(requireString(rawDocument, "template", index));
  const html = requireString(rawDocument, "html", index);
  const pdf = requireString(rawDocument, "pdf", index);

  return {
    id,
    input,
    template,
    html,
    pdf,
    inputPath: path.resolve(rootDir, input),
    htmlPath: path.resolve(rootDir, html),
    pdfPath: path.resolve(rootDir, pdf),
  };
}

function requireString(rawDocument: Record<string, unknown>, key: string, index: number): string {
  const value = rawDocument[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Document at index ${index} must define a non-empty "${key}" string.`);
  }

  return value;
}

function requireTemplateId(value: string): TemplateId {
  if (SUPPORTED_TEMPLATE_IDS.includes(value as TemplateId)) {
    return value as TemplateId;
  }

  throw new Error(
    `Unknown template "${value}". Supported templates: ${SUPPORTED_TEMPLATE_IDS.join(", ")}`,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
