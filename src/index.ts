import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { querySimilar, addDocuments } from './vectorStore';
import { loadDocuments } from './ingestion';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// Configure Gemini
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("Error: GOOGLE_API_KEY not found in environment variables.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// Using gemini-2.5-flash as requested
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function retrieveContext(query: string): Promise<string> {
    const results = await querySimilar(query, 3);

    // Explicit typing for results from lancedb
    // In strict mode, we need to know the shape
    if (!results || results.length === 0) {
        return "";
    }

    const contextParts = results.map((r: any) => {
        return `--- SOURCE: ${r.source} ---\n${r.text}\n-----------------------`;
    });

    return contextParts.join("\n\n");
}

async function askDetective(question: string) {
    console.log(`\nScanning case files for: '${question}'...`);
    const context = await retrieveContext(question);

    if (!context) {
        console.log("No relevant evidence found.");
        return;
    }

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

    try {
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error during generation:", error);
        return "System error during analysis.";
    }
}

async function main() {
    // Ensure database is populated (simple check)
    const dbPath = path.join(__dirname, '../db');
    // We can also just run ingestion every time for this demo or check if folder exists
    // Ideally we check if it has data, but for simplicity let's re-ingest if db folder missing
    if (!fs.existsSync(dbPath)) {
        console.log("Initializing vector store...");
        const evidenceDir = path.join(__dirname, '../evidence');
        const docs = loadDocuments(evidenceDir);
        if (docs.length > 0) {
            await addDocuments(docs);
        } else {
            console.error("No evidence files found to ingest.");
            return;
        }
    } else {
        // Optional: Re-ingest to ensure latest data is in DB for this demo run
        console.log("Updating vector store...");
        const evidenceDir = path.join(__dirname, '../evidence');
        const docs = loadDocuments(evidenceDir);
        await addDocuments(docs);
    }

    // Multi-source synthesis test
    const testQuestion = "What is the timeline of events involving the red vehicle, and what forensic evidence links it to the scene?";

    console.log(`QUESTION: ${testQuestion}`);
    const answer = await askDetective(testQuestion);

    console.log("\nDETECTIVE'S REPORT:\n");
    console.log(answer);
}

if (require.main === module) {
    main().catch(console.error);
}
