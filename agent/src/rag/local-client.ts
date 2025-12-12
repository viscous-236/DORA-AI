/**
 * Local RAG Client - TypeScript client for Python RAG server
 * No API costs, runs on localhost:9000
 */

const LOCAL_RAG_URL = process.env.LOCAL_RAG_URL || 'http://127.0.0.1:9000';

export interface LocalSearchResult {
  id: string;
  title: string;
  text: string;
  outcome: string;
  type: string;
  score: number;
}

export interface LocalDocument {
  id: string;
  daoId: string;
  title: string;
  text: string;
  outcome?: string;
  type?: string;
}

/**
 * Check if local RAG server is available
 */
export async function isLocalRAGAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_RAG_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    const data: any = await response.json();
    return response.ok && data.status === 'ok';
  } catch (error) {
    return false;
  }
}

/**
 * Generate embedding for text
 */
export async function embedLocal(text: string): Promise<number[]> {
  const response = await fetch(`${LOCAL_RAG_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) {
    throw new Error(`Embed failed: ${response.statusText}`);
  }
  
  const data: any = await response.json();
  return data.embedding;
}

/**
 * Search for similar documents
 */
export async function searchLocal(
  daoId: string,
  text: string,
  topK: number = 5
): Promise<LocalSearchResult[]> {
  const response = await fetch(`${LOCAL_RAG_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ daoId, text, topK })
  });
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  const data: any = await response.json();
  return data.results;
}

/**
 * Generate extractive summary using TextRank
 */
export async function summarizeLocal(text: string): Promise<string> {
  const response = await fetch(`${LOCAL_RAG_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) {
    throw new Error(`Summarize failed: ${response.statusText}`);
  }
  
  const data: any = await response.json();
  return data.summary;
}

/**
 * Add document to vector store
 */
export async function addDocumentLocal(doc: LocalDocument): Promise<void> {
  const response = await fetch(`${LOCAL_RAG_URL}/add_doc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });
  
  if (!response.ok) {
    throw new Error(`Add document failed: ${response.statusText}`);
  }
}
