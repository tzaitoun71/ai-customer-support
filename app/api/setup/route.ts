import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { PineconeTranslator } from "@langchain/pinecone";
import { loadDocumentsFromWeb } from '../../utils/loadDocuments';

const url = "https://news.ycombinator.com/item?id=34817881";

const setupPineconeLangchain = async () => {
  console.log("Pinecone API Key:", process.env.PINECONE_API_KEY);
  console.log("Pinecone Index:", process.env.PINECONE_INDEX);
  console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  console.log("Embeddings instance created");

  const docs = await loadDocumentsFromWeb(url);

  // Ensure documents have unique IDs
  docs.forEach((doc, index) => {
    if (!doc.id) {
      doc.id = `doc_${index}`;
    }
  });

  // Check for existing documents in the index
  const existingDocIds = new Set<string>();
  for (const doc of docs) {
    const contentToEmbed = `${doc.pageContent} ${JSON.stringify(doc.metadata)}`;
    const queryResponse = await pineconeIndex.query({
      vector: (await embeddings.embedDocuments([contentToEmbed]))[0],
      topK: 1,
      includeMetadata: true,
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      existingDocIds.add(doc.id as string);
    }
  }

  // Filter out documents that already exist in the index
  const newDocs = docs.filter(doc => !existingDocIds.has(doc.id as string));

  // Only upsert new documents
  if (newDocs.length > 0) {
    const vectors = await embeddings.embedDocuments(newDocs.map(doc => `${doc.pageContent} ${JSON.stringify(doc.metadata)}`));
    const upsertVectors = newDocs.map((doc, index) => ({
      id: doc.id as string,
      values: vectors[index],
      metadata: doc.metadata,
    }));

    await pineconeIndex.upsert(upsertVectors);

    console.log("Vector store created with new documents");
  } else {
    console.log("No new documents to index");
  }

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8,
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  console.log("LLM instance created");

  const selfQueryRetriever = SelfQueryRetriever.fromLLM({
    llm: llm,
    vectorStore: vectorStore,
    documentContents: "Document content",
    attributeInfo: [],
    structuredQueryTranslator: new PineconeTranslator(),
  });

  console.log("SelfQueryRetriever instance created");

  return selfQueryRetriever;
};

export async function POST(req: NextRequest) {
  try {
    const retriever = await setupPineconeLangchain();
    return NextResponse.json({ message: "Retriever setup complete", retriever });
  } catch (error) {
    console.error("Error setting up Pinecone Langchain:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
