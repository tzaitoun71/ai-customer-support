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
    documentContents: "Document content", // Description of document contents
    attributeInfo: [], // Empty attribute info as we are not using it
    structuredQueryTranslator: new PineconeTranslator(), // Translator for queries
  });

  return { selfQueryRetriever, llm };
};

export const POST = async (req: NextRequest) => {
  try {
    console.log("Received request"); // Logging request receipt

    // Parsing question from request body
    const { question } = await req.json();
    console.log("Question received:", question); // Logging received question

    // Checking if question is provided
    if (!question) {
      console.log("No question provided"); // Logging absence of question
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    // Setting up Pinecone and LangChain
    const { selfQueryRetriever, llm } = await setupPineconeLangchain();
    console.log("Pinecone and LangChain setup complete"); // Logging setup completion

    // Retrieving relevant documents
    console.log("Embedding question and searching for relevant documents..."); // Indicating embedding step
    const relevantDocuments = await selfQueryRetriever.invoke(question);
    console.log("Relevant documents retrieved:", relevantDocuments); // Logging retrieved documents

    // Combining document contents into a single string
    const documentContents = relevantDocuments.map(doc => doc.pageContent).join("\n");
    console.log("Document contents:", documentContents); // Logging document contents

    // Preparing messages for the LLM
    const messages = [
      { type: "system", content: "You are a helpful assistant." },
      { type: "user", content: question },
      { type: "system", content: documentContents },
    ];
    console.log("Messages prepared for LLM:", messages); // Logging prepared messages

    // Generating a response based on the retrieved documents
    const response = await llm.invoke(messages as any);
    console.log("Response generated:", response); // Logging generated response

    // Extracting answer content from response
    const answer = response.content;
    console.log("Generated response content:", answer); // Logging answer content

    // Returning response as JSON
    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error("Error processing query:", error); // Logging error
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 }); // Returning empty JSON response
};
