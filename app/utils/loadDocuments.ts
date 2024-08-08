import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";

export const loadDocumentsFromWeb = async (url: string): Promise<Document[]> => {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();
  return docs;
};
