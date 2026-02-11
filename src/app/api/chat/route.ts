import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { querySimilar, initializeStoreIfNeeded } from '../../../vectorStore';

// Initialize Gemini
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { messages } = body;
        const lastMessage = messages[messages.length - 1];
        const question = lastMessage.content;

        // 1. Ensure Vector Store is ready (Serverless /tmp check)
        await initializeStoreIfNeeded();

        // 2. Retrieve Context
        console.log(`Searching for: ${question}`);
        const results = await querySimilar(question, 3);

        // 3. Format Context
        let context = "";
        if (results && results.length > 0) {
            context = results.map((r: any) =>
                `--- SOURCE: ${r.source} ---\n${r.text}\n-----------------------`
            ).join("\n\n");
        }

        // 4. Construct Prompt
        const systemPrompt = `You are a strict Cold Case Detective system. 
Your job is to answer the user's question based ONLY on the provided evidence context.
You must cite your sources explicitly using the format [filename] (e.g., [witness_statement.txt]).
Do not hallucinate. If the answer is not in the context, say "I cannot find evidence to answer this."`;

        const fullPrompt = `${systemPrompt}

EVIDENCE CONTEXT:
${context}

QUESTION:
${question}

ANSWER:`;

        // 5. Generate Response
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ role: 'assistant', content: text });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
