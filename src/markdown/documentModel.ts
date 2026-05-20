export interface MarkdownOutlineItem {
  depth: number;
  title: string;
  slug: string;
}

export interface MarkdownSection {
  title: string;
  slug: string;
  html: string;
}

export interface ParsedMarkdownDocument {
  title: string;
  slug: string;
  leadHtml: string;
  sections: MarkdownSection[];
  outline: MarkdownOutlineItem[];
}
