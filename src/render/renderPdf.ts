import { chromium } from "playwright";

import { ensureParentDir } from "../utils/files";

export interface PdfWriteRequest {
  html: string;
  outputPath: string;
}

export type PdfWriter = (request: PdfWriteRequest) => Promise<void>;

export const renderPdf: PdfWriter = async ({ html, outputPath }) => {
  await ensureParentDir(outputPath);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    await page.emulateMedia({ media: "print" });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: outputPath,
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
};
