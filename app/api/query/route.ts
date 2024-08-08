import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { PineconeTranslator } from "@langchain/pinecone";

const setupPineconeLangchain = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8,
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  const selfQueryRetriever = SelfQueryRetriever.fromLLM({
    llm: llm,
    vectorStore: vectorStore,
    documentContents: "Document content",
    attributeInfo: [],
    structuredQueryTranslator: new PineconeTranslator(),
  });

  return { selfQueryRetriever, llm };
};

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    const { selfQueryRetriever, llm } = await setupPineconeLangchain();

    // Retrieve relevant documents
    const relevantDocuments = await selfQueryRetriever.invoke(question);

    // Prepare messages for the LLM
    const messages = [
      { type: "system", content: "You are a helpful assistant." },
      { type: "user", content: question },
      ...relevantDocuments.map(doc => ({ type: "system", content: doc.pageContent })),
    ];

    // Generate a response based on the retrieved documents
    const response = await llm.generate(messages as any);

    return NextResponse.json({ response: response.generations[0].toString() });
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
