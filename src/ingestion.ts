import fs from 'fs';
import path from 'path';

export interface Document {
    content: string;
    metadata: {
        source: string;
    }
}

export function loadDocuments(directory: string): Document[] {
    const documents: Document[] = [];

    // Safety check for empty path
    if (!directory || !fs.existsSync(directory)) {
        console.error(`Error: Directory '${directory}' does not exist.`);
        return [];
    }

    const files = fs.readdirSync(directory);

    for (const file of files) {
        if (file.endsWith('.txt')) {
            const filePath = path.join(directory, file);
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                documents.push({
                    content: content,
                    metadata: {
                        source: file
                    }
                });
            } catch (error) {
                console.error(`Error reading file ${file}:`, error);
            }
        }
    }
    return documents;
}
