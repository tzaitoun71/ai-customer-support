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
    model: "gpt-4",
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

export const POST = async (req: NextRequest) => {
  try {
    console.log("Received request");
    const { question } = await req.json();
    console.log("Question received:", question);

    if (!question) {
      console.log("No question provided");
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    const { selfQueryRetriever, llm } = await setupPineconeLangchain();
    console.log("Pinecone and LangChain setup complete");

    // Retrieve relevant documents
    const relevantDocuments = await selfQueryRetriever.invoke(question);
    console.log("Relevant documents retrieved:", relevantDocuments);

    const documentContents = relevantDocuments.map(doc => doc.pageContent).join("\n");
    console.log("Document contents:", documentContents);

    // Prepare messages for the LLM
    const messages = [
      { type: "system", content: "You are a helpful assistant." },
      { type: "user", content: question },
      { type: "system", content: documentContents },
    ];
    console.log("Messages prepared for LLM:", messages);

    // Generate a response based on the retrieved documents
    const response = await llm.invoke(messages as any);
    console.log("Response generated:", response);

    const answer = response.content;
    console.log("Generated response content:", answer);

    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 });
};
