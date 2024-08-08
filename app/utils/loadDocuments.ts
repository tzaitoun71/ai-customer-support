import puppeteer from 'puppeteer';
import { Document } from "@langchain/core/documents";

export const loadDocumentsFromWeb = async (url: string): Promise<Document[]> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const content = await page.evaluate(() => document.body.innerText); // Fetch the page content as plain text
  await browser.close();

  // Split content into chunks of approximately 2000 characters each
  const chunkText = (text: string, chunkSize: number): string[] => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const chunkSize = 2000; // Adjust based on average token size
  const chunks = chunkText(content, chunkSize);

  // Create Document objects from chunks
  const docs = chunks.map((chunk, index) => new Document({
    pageContent: chunk,
    metadata: { url, chunkIndex: index },
  }));

  return docs;
};
