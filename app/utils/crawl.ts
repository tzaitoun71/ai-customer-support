const cheerio = require('cheerio')
import { NodeHtmlMarkdown } from 'node-html-markdown';

export interface Page {
  url: string;
  content: string;
}

class Crawler {
  private seen = new Set<string>();
  private pages: Page[] = [];
  private queue: { url: string; depth: number }[] = [];

  constructor(private maxDepth: number = 2, private maxPages: number = 1) {}

  async crawl(startUrl: string): Promise<Page[]> {
    this.addToQueue(startUrl);

    while (this.shouldContinueCrawling()) {
      const { url, depth } = this.queue.shift()!;

      if (this.isTooDeep(depth) || this.isAlreadySeen(url)) continue;

      this.seen.add(url);

      const html = await this.fetchPage(url);

      this.pages.push({ url, content: this.parseHtml(html) });

      this.addNewUrlsToQueue(this.extractUrls(html, url), depth);
    }

    return this.pages;
  }

  private addToQueue(url: string, depth: number = 0): void {
    this.queue.push({ url, depth });
  }

  private shouldContinueCrawling(): boolean {
    return this.queue.length > 0 && this.pages.length < this.maxPages;
  }

  private isTooDeep(depth: number): boolean {
    return depth > this.maxDepth;
  }

  private isAlreadySeen(url: string): boolean {
    return this.seen.has(url);
  }

  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error(`Failed to fetch ${url}: ${error}`);
      return "";
    }
  }

  private parseHtml(html: string): string {
    const $ = cheerio.load(html);
    $("a").removeAttr("href");
    return NodeHtmlMarkdown.translate($.html());
  }

  private extractUrls(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const relativeUrls = $("a")
      .map((_: any, link: any) => $(link).attr("href"))
      .get() as string[];
    return relativeUrls.map((relativeUrl) => new URL(relativeUrl, baseUrl).href);
  }

  private addNewUrlsToQueue(urls: string[], depth: number): void {
    urls.forEach((url) => this.addToQueue(url, depth + 1));
  }
}

export { Crawler };
