#!/usr/bin/env python3
"""
Local RAG Server - No API costs, runs on your laptop
Provides embeddings, search, and summarization
PRECOMPUTED MODE: No ML models, keyword matching only
"""
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
# No sklearn.cosine_similarity - using keyword matching in precomputed mode
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
import uvicorn
import os
import json

app = FastAPI(title="Local RAG for DAO Co-Pilot")

MODEL_NAME = "precomputed"
model = None
print("🧠 Lite RAG running in PRECOMPUTED mode (Render-safe)")

VECSTORE_PATH = "data/vecstore.json"
os.makedirs("data", exist_ok=True)

# Load existing vector store
if os.path.exists(VECSTORE_PATH):
    print(f"📂 Loading vector store from {VECSTORE_PATH}")
    with open(VECSTORE_PATH, "r") as f:
        raw = json.load(f)
        VECSTORE = {k: {**v, "embedding": np.array(v["embedding"])} for k, v in raw.items()}
    print(f"✅ Loaded {len(VECSTORE)} documents")
else:
    VECSTORE = {}
    print("📝 Starting with empty vector store")

class TextIn(BaseModel):
    text: str

class DocAdd(BaseModel):
    id: str
    daoId: str
    title: str = ""
    text: str
    outcome: str = ""
    type: str = "proposal"

class SearchQuery(BaseModel):
    daoId: str
    text: str
    topK: int = 5

def embed_text(text: str):
    """Embedding generation disabled - using precomputed embeddings only"""
    raise RuntimeError("Embedding generation disabled on Render. Use precomputed vecstore.json")

def persist_store():
    """Save vector store to disk"""
    serial = {}
    for k, v in VECSTORE.items():
        serial[k] = {**v}
        serial[k]["embedding"] = v["embedding"].tolist()
    with open(VECSTORE_PATH, "w") as f:
        json.dump(serial, f)
    print(f"💾 Saved {len(serial)} documents to {VECSTORE_PATH}")

@app.post("/embed")
def embed_endpoint(payload: TextIn):
    """Embedding generation disabled in precomputed mode"""
    return {"error": "Embedding generation disabled. Using precomputed vectors."}

@app.post("/add_doc")
def add_doc(payload: DocAdd):
    """Document addition disabled in precomputed mode"""
    return {"error": "Document addition disabled. Vecstore is precomputed."}

@app.post("/search")
def search_endpoint(payload: SearchQuery):
    """Search for similar documents using keyword matching (precomputed mode)"""
    if not payload.text.strip():
        return {"results": []}
    
    items = [(k, v) for k, v in VECSTORE.items() if v["daoId"] == payload.daoId]
    
    if not items:
        return {"results": []}
    
    # Simple keyword matching as fallback
    query_words = set(payload.text.lower().split())
    scored_items = []
    
    for key, val in items:
        text_words = set(val["text"].lower().split())
        overlap = len(query_words & text_words)
        score = overlap / max(len(query_words), 1)
        scored_items.append((key, val, score))
    
    # Sort by score descending
    scored_items.sort(key=lambda x: x[2], reverse=True)
    
    results = []
    for key, val, score in scored_items[:payload.topK]:
        results.append({
            "id": key,
            "title": val.get("title", ""),
            "text": val["text"][:500],
            "outcome": val.get("outcome", ""),
            "type": val.get("type", "proposal"),
            "score": float(score)
        })
    
    return {"results": results}

@app.post("/summarize")
def summarize(payload: TextIn):
    """Generate extractive summary using TextRank"""
    try:
        parser = PlaintextParser.from_string(payload.text, Tokenizer("english"))
        summarizer = TextRankSummarizer()
        
        word_count = len(payload.text.split())
        num_sentences = max(2, min(5, word_count // 100))
        
        summary_sentences = summarizer(parser.document, num_sentences)
        summary = " ".join(str(s) for s in summary_sentences)
        
        return {"summary": summary}
    except Exception as e:
        sentences = payload.text.split('.')[:3]
        return {"summary": ". ".join(sentences) + "."}

@app.get("/health")
def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "local-rag",
        "documents": len(VECSTORE),
        "model": MODEL_NAME
    }

@app.get("/stats")
def stats():
    """Get statistics about vector store"""
    dao_counts = {}
    for doc in VECSTORE.values():
        dao_id = doc["daoId"]
        dao_counts[dao_id] = dao_counts.get(dao_id, 0) + 1
    
    return {
        "total_documents": len(VECSTORE),
        "by_dao": dao_counts
    }

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Starting Local RAG Server")
    print("="*60)
    print(f"📍 URL: http://127.0.0.1:9000")
    print(f"📚 Docs: http://127.0.0.1:9000/docs")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="127.0.0.1", port=9000, log_level="info")
