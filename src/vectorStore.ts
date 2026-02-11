import * as lancedb from '@lancedb/lancedb';
import { pipeline } from '@xenova/transformers';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { loadDocuments, Document } from './ingestion';

// --- Configuration ---
// In a serverless env (Vercel), we can only write to /tmp
const DB_PATH = path.join(os.tmpdir(), 'coldcase_db');
const TABLE_NAME = 'evidence';

// --- Embedding Pipeline ---
let embedder: any = null;

async function getEmbedder() {
    if (!embedder) {
        console.log("Loading embedding model...");
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return embedder;
}

// --- Vector Store Logic ---

export async function createVectorStore() {
    // Ensure DB directory exists
    if (!fs.existsSync(DB_PATH)) {
        fs.mkdirSync(DB_PATH, { recursive: true });
    }

    const db = await lancedb.connect(DB_PATH);
    return db;
}

export async function addDocuments(documents: Document[]) {
    const db = await createVectorStore();
    const generateEmbedding = await getEmbedder();

    const data = [];
    console.log(`Embedding ${documents.length} documents...`);

    for (const doc of documents) {
        const output = await generateEmbedding(doc.content, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data) as number[];

        data.push({
            vector: embedding,
            text: doc.content,
            source: doc.metadata.source
        });
    }

    try {
        await db.createTable(TABLE_NAME, data, { mode: 'overwrite' });
        console.log(`Successfully stored ${data.length} documents in LanceDB at ${DB_PATH}.`);
    } catch (e) {
        console.error("Error creating table:", e);
    }
}

export async function querySimilar(query: string, limit: number = 3) {
    const db = await createVectorStore();
    const generateEmbedding = await getEmbedder();

    const output = await generateEmbedding(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(output.data) as number[];

    // Ensure table exists; if strictly ephemeral, might need to init outside
    // For this demo, we assume init happens before query or check existence
    try {
        const table = await db.openTable(TABLE_NAME);
        const results = await table.vectorSearch(queryVector)
            .limit(limit)
            .toArray();
        return results;
    } catch (e) {
        console.warn("Table not found (might be cold start). Returning empty.", e);
        return [];
    }
}

// Helper to init DB if needed (called by API route)
export async function initializeStoreIfNeeded() {
    const db = await createVectorStore();
    const tableNames = await db.tableNames();

    if (!tableNames.includes(TABLE_NAME)) {
        console.log("Table not found in /tmp. Re-ingesting evidence...");
        // In Next.js, process.cwd() is the project root
        const evidenceDir = path.join(process.cwd(), 'evidence');
        console.log(`Looking for evidence in: ${evidenceDir}`);
        const docs = loadDocuments(evidenceDir);
        await addDocuments(docs);
    }
}
