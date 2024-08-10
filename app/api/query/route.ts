import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { PineconeTranslator } from "@langchain/pinecone";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { prompt } from '@/app/utils/SystemPrompt';

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

let chatHistory: Array<HumanMessage | AIMessage | SystemMessage> = []; // Initialize chat history

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

    console.log("Embedding question and searching for relevant documents...");
    const relevantDocuments = await selfQueryRetriever.invoke(question);
    console.log("Relevant documents retrieved:", relevantDocuments);

    const documentContents = relevantDocuments.map(doc => doc.pageContent).join("\n");
    console.log("Document contents:", documentContents);

    // Append current question to chat history
    chatHistory.push(new HumanMessage(question));

    // Prepare the current set of messages including the previous history
    const messages = [
      new SystemMessage(prompt),
      ...chatHistory, // Include previous history
      new AIMessage(documentContents),
    ];

    console.log("Messages prepared for LLM:", messages);

    // Generate a response based on the retrieved documents and chat history
    const response = await llm.invoke(messages);
    console.log("Response generated:", response);

    // Ensure the response content is a string
    const answerContent = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    console.log("Generated response content:", answerContent);

    // Append assistant's response to chat history
    chatHistory.push(new AIMessage(answerContent));

    return NextResponse.json({ response: answerContent });
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 });
};
