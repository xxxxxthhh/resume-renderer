import type { TemplateId } from "../config";
import type { ParsedMarkdownDocument } from "../markdown/documentModel";

export interface TemplateRenderContext {
  css: string;
}

export interface HtmlTemplate {
  id: TemplateId;
  cssFile: URL;
  render(document: ParsedMarkdownDocument, context: TemplateRenderContext): string;
}
