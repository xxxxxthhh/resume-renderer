import { loadConfig, selectDocuments } from "../config";
import { parseMarkdown } from "../markdown/parseMarkdown";
import { readTextFile, ensureParentDir, writeTextFile } from "../utils/files";
import { renderHtml } from "./renderHtml";
import { renderPdf, type PdfWriter } from "./renderPdf";

export interface RenderDocumentsOptions {
  configPath: string;
  documentId?: string;
  writePdf?: PdfWriter;
}

export interface RenderDocumentResult {
  id: string;
  inputPath: string;
  htmlPath: string;
  pdfPath: string;
}

export async function renderDocuments({
  configPath,
  documentId,
  writePdf = renderPdf,
}: RenderDocumentsOptions): Promise<RenderDocumentResult[]> {
  const config = await loadConfig(configPath);
  const documents = selectDocuments(config, documentId);
  const results: RenderDocumentResult[] = [];

  for (const documentConfig of documents) {
    const markdown = await readTextFile(documentConfig.inputPath);
    const parsedDocument = parseMarkdown(markdown);
    const html = await renderHtml(parsedDocument, documentConfig.template);

    await writeTextFile(documentConfig.htmlPath, html);
    await ensureParentDir(documentConfig.pdfPath);
    await writePdf({
      html,
      outputPath: documentConfig.pdfPath,
    });

    results.push({
      id: documentConfig.id,
      inputPath: documentConfig.inputPath,
      htmlPath: documentConfig.htmlPath,
      pdfPath: documentConfig.pdfPath,
    });
  }

  return results;
}
