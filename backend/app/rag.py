"""In-memory retrieval over the pre-built chunk embeddings."""

import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parents[2]
CHUNKS_PATH = ROOT / "data" / "processed" / "chunks.json"
EMBEDDINGS_PATH = ROOT / "data" / "processed" / "embeddings.npy"
MODEL_NAME = "all-MiniLM-L6-v2"

_model = None
_chunks = None
_embeddings = None
_embeddings_norm = None


def load():
    global _model, _chunks, _embeddings, _embeddings_norm

    _chunks = json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))
    _embeddings = np.load(EMBEDDINGS_PATH)
    norms = np.linalg.norm(_embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1e-8
    _embeddings_norm = _embeddings / norms

    _model = SentenceTransformer(MODEL_NAME)


def chunk_count() -> int:
    return len(_chunks) if _chunks is not None else 0


def retrieve(query: str, k: int = 5):
    if _model is None or _chunks is None:
        raise RuntimeError("rag module not loaded; call load() at startup")

    query_emb = _model.encode([query], convert_to_numpy=True)[0]
    query_norm = query_emb / (np.linalg.norm(query_emb) or 1e-8)

    scores = _embeddings_norm @ query_norm
    top_idx = np.argsort(-scores)[:k]

    results = []
    for idx in top_idx:
        chunk = _chunks[int(idx)]
        results.append({
            "id": chunk["id"],
            "text": chunk["text"],
            "source": chunk["source"],
            "section": chunk["section"],
            "score": float(scores[idx]),
        })
    return results
