# Cold Case Detective

A Next.js application that uses AI to analyze cold case evidence.

## Features

-   **Next.js Framework**: Built with Next.js for server-side rendering and static site generation.
-   **AI Integration**: Utilizes Google's Gemini AI (`@google/generative-ai`) for advanced text analysis and generation.
-   **Vector Search**: Implements local vector search using LanceDB (`@lancedb/lancedb`) and Transformers (`@xenova/transformers`) for efficient evidence retrieval.
-   **Styling**: Styled with Tailwind CSS for a modern and responsive UI.
-   **Animation**: Uses Framer Motion for smooth animations.

## Tech Stack

-   **Frontend**: React, Next.js, Tailwind CSS, Framer Motion, Lucide React
-   **Backend/AI**: Google Generative AI, LanceDB, Xenova Transformers
-   **Language**: TypeScript

## Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/coldcase-detective.git
    cd coldcase-detective
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Set up environment variables:
    Create a `.env` file in the root directory and add your necessary API keys (e.g., Google AI API key).

### Running the Application

1.  Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

2.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

-   `src/app`: Application source code and pages.
-   `src/index.ts`: Main entry point (if applicable).
-   `src/ingestion.ts`: Scripts for ingesting evidence data.
-   `src/vectorStore.ts`: Configuration and logic for the vector database.
-   `evidence/`: Directory containing raw evidence files (text logs, reports).
-   `db/`: Directory for the LanceDB database files.

## Scripts

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production.
-   `npm start`: Starts the production server.
-   `npm run lint`: Lints the code.

## License

This project is licensed under the ISC License.
