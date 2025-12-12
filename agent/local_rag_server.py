#!/usr/bin/env python3
"""
Local RAG Server - No API costs, runs on your laptop
Provides embeddings, search, and summarization
"""
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
import uvicorn
import os
import json

app = FastAPI(title="Local RAG for DAO Co-Pilot")

MODEL_NAME = os.environ.get("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
print(f"🔄 Loading embedding model: {MODEL_NAME}")
model = SentenceTransformer(MODEL_NAME)
print("✅ Model loaded!")

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
    """Generate embedding for text"""
    vec = model.encode([text], show_progress_bar=False)[0]
    return np.array(vec).astype(float)

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
    """Generate embedding for text"""
    emb = embed_text(payload.text)
    return {"embedding": emb.tolist()}

@app.post("/add_doc")
def add_doc(payload: DocAdd):
    """Add document to vector store"""
    emb = embed_text(payload.text)
    VECSTORE[payload.id] = {
        "daoId": payload.daoId,
        "title": payload.title,
        "text": payload.text,
        "outcome": payload.outcome,
        "type": payload.type,
        "embedding": emb
    }
    persist_store()
    return {"ok": True, "id": payload.id}

@app.post("/search")
def search_endpoint(payload: SearchQuery):
    """Search for similar documents"""
    q_emb = embed_text(payload.text)
    items = [(k, v) for k, v in VECSTORE.items() if v["daoId"] == payload.daoId]
    
    if not items:
        return {"results": []}
    
    embs = np.array([v["embedding"] for _, v in items])
    sims = cosine_similarity([q_emb], embs)[0]
    ranked_idx = sims.argsort()[::-1][:payload.topK]
    
    results = []
    for i in ranked_idx:
        key, val = items[i]
        results.append({
            "id": key,
            "title": val.get("title", ""),
            "text": val["text"][:500],
            "outcome": val.get("outcome", ""),
            "type": val.get("type", "proposal"),
            "score": float(sims[i])
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
