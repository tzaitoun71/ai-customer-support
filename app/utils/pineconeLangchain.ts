import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { ChatOpenAI } from "@langchain/openai";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { PineconeTranslator } from "@langchain/pinecone";

const docs = [
  new Document({
    id: '1',
    pageContent: "A bunch of scientists bring back dinosaurs and mayhem breaks loose",
    metadata: { year: 1993, rating: 7.7, genre: "science fiction" },
  }),
  new Document({
    id: '2',
    pageContent: "Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
    metadata: { year: 2010, director: "Christopher Nolan", rating: 8.2 },
  }),
  new Document({
    id: '3',
    pageContent: "A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
    metadata: { year: 2006, director: "Satoshi Kon", rating: 8.6 },
  }),
  new Document({
    id: '4',
    pageContent: "A bunch of normal-sized women are supremely wholesome and some men pine after them",
    metadata: { year: 2019, director: "Greta Gerwig", rating: 8.3 },
  }),
  new Document({
    id: '5',
    pageContent: "Toys come alive and have a blast doing so",
    metadata: { year: 1995, genre: "animated" },
  }),
  new Document({
    id: '6',
    pageContent: "Three men walk into the Zone, three men walk out of the Zone",
    metadata: {
      year: 1979,
      director: "Andrei Tarkovsky",
      genre: "science fiction",
      rating: 9.9,
    },
  }),
];

const attributeInfo = [
  {
    name: "genre",
    description: "The genre of the movie",
    type: "string or array of strings",
  },
  {
    name: "year",
    description: "The year the movie was released",
    type: "number",
  },
  {
    name: "director",
    description: "The director of the movie",
    type: "string",
  },
  {
    name: "rating",
    description: "The rating of the movie (1-10)",
    type: "number",
  },
  {
    name: "length",
    description: "The length of the movie in minutes",
    type: "number",
  },
];

export const setupPineconeLangchain = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  console.log("Embeddings instance created");

  // Check for existing documents in the index
  const existingDocIds = new Set<string>();
  for (const doc of docs) {
    const queryResponse = await pineconeIndex.query({
      vector: (await embeddings.embedDocuments([doc.pageContent]))[0],
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
    const vectors = await embeddings.embedDocuments(newDocs.map(doc => doc.pageContent));
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

  const vectorStore = new PineconeStore(embeddings, { pineconeIndex });

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8,
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  console.log("LLM instance created");

  const selfQueryRetriever = SelfQueryRetriever.fromLLM({
    llm: llm,
    vectorStore: vectorStore,
    documentContents: "Brief summary of a movie",
    attributeInfo: attributeInfo,
    structuredQueryTranslator: new PineconeTranslator(),
  });

  console.log("SelfQueryRetriever instance created");

  return selfQueryRetriever;
};
