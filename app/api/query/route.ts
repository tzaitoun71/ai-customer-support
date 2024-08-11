import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { PineconeTranslator } from "@langchain/pinecone";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { prompt } from '@/app/utils/SystemPrompt';

interface ChatHistory {
  [key: string]: Array<HumanMessage | AIMessage | SystemMessage>;
}

const chatHistories: ChatHistory = {}; // Store chat history per user session

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

export const POST = async (req: NextRequest) => {
  try {
    const { question, userId } = await req.json();

    if (!question || !userId) {
      return NextResponse.json({ error: "No question or user ID provided" }, { status: 400 });
    }

    const { selfQueryRetriever, llm } = await setupPineconeLangchain();

    // Initialize chat history for the user if it doesn't exist
    if (!chatHistories[userId]) {
      chatHistories[userId] = [];
    }

    // Fetch relevant documents based on the user's query
    const relevantDocuments = await selfQueryRetriever.invoke(question);
    const documentContents = relevantDocuments.map(doc => doc.pageContent).join("\n");

    // Append current question to chat history
    chatHistories[userId].push(new HumanMessage(question));

    // Prepare the current set of messages including the previous history
    const messages = [
      new SystemMessage(prompt),
      ...chatHistories[userId], // Include previous history
      new AIMessage(documentContents),
    ];

    // Generate a response based on the retrieved documents and chat history
    const response = await llm.invoke(messages);
    const answerContent = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    // Append assistant's response to chat history
    chatHistories[userId].push(new AIMessage(answerContent));

    return NextResponse.json({ response: answerContent });
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 });
};

// New function to clear chat history when user signs out
export const DELETE = async (req: NextRequest) => {
  try {
    const { userId } = await req.json();

    if (chatHistories[userId]) {
      delete chatHistories[userId]; // Clear chat history for this user
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
