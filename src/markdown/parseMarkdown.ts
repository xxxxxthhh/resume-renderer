import { Marked, type Token, type Tokens } from "marked";

import type {
  MarkdownOutlineItem,
  MarkdownSection,
  ParsedMarkdownDocument,
} from "./documentModel";
import { escapeHtml, slugify } from "../utils/html";

const markdownRenderer = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html(token: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(token.text);
    },
  },
});

export function parseMarkdown(markdown: string): ParsedMarkdownDocument {
  if (markdown.trim() === "") {
    throw new Error("Markdown document is empty.");
  }

  const tokens = markdownRenderer.lexer(markdown);
  const firstContentToken = tokens.find((token) => token.type !== "space");

  if (!isHeading(firstContentToken) || firstContentToken.depth !== 1) {
    throw new Error("Markdown document must start with an H1 title.");
  }

  const title = firstContentToken.text.trim();
  const leadTokens: Token[] = [];
  const sections: MarkdownSection[] = [];
  const outline: MarkdownOutlineItem[] = [];
  let currentSection: MutableSection | undefined;
  let skippedTitle = false;

  for (const token of tokens) {
    if (!skippedTitle && token === firstContentToken) {
      skippedTitle = true;
      continue;
    }

    if (isHeading(token)) {
      outline.push({
        depth: token.depth,
        title: token.text,
        slug: slugify(token.text),
      });

      if (token.depth === 2) {
        currentSection = {
          title: token.text,
          slug: slugify(token.text),
          tokens: [],
        };
        sections.push(currentSection);
        continue;
      }
    }

    if (currentSection) {
      currentSection.tokens.push(token);
    } else {
      leadTokens.push(token);
    }
  }

  return {
    title,
    slug: slugify(title),
    leadHtml: renderTokens(leadTokens),
    sections: sections.map((section) => ({
      title: section.title,
      slug: section.slug,
      html: renderTokens(section.tokens),
    })),
    outline,
  };
}

interface MutableSection {
  title: string;
  slug: string;
  tokens: Token[];
}

function isHeading(token: Token | undefined): token is Tokens.Heading {
  return token?.type === "heading";
}

function renderTokens(tokens: Token[]): string {
  return markdownRenderer.parser(tokens).trim();
}
