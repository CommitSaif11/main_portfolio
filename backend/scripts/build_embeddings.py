"""Build fastembed embeddings for the markdown knowledge base.

Reads data/raw/*.md, chunks into ~200-400 token pieces (splitting on headings and
paragraph boundaries), embeds with the ONNX export of all-MiniLM-L6-v2 (via
fastembed - no torch dependency, much lighter at runtime), and writes:
  - data/processed/chunks.json   (list of {id, text, source, section})
  - data/processed/embeddings.npy (float32 array, same row order as chunks.json)
"""

import json
import re
from pathlib import Path

import numpy as np
from fastembed import TextEmbedding

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"
# fastembed's own ONNX export of the same sentence-transformers model previously
# used directly - same weights/dims, just no torch runtime dependency.
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
MIN_TOKENS = 200
MAX_TOKENS = 400

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")


def count_tokens(text: str) -> int:
    return len(text.split())


def split_into_sections(md_text: str):
    """Split a markdown document into (section_title, body_lines) blocks by heading."""
    sections = []
    current_title = "Introduction"
    current_lines = []

    for line in md_text.splitlines():
        match = HEADING_RE.match(line)
        if match:
            if current_lines and any(l.strip() for l in current_lines):
                sections.append((current_title, current_lines))
            current_title = match.group(2).strip()
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines and any(l.strip() for l in current_lines):
        sections.append((current_title, current_lines))

    return sections


def split_into_paragraphs(lines):
    paragraphs = []
    buf = []
    for line in lines:
        if line.strip() == "":
            if buf:
                paragraphs.append("\n".join(buf).strip())
                buf = []
        else:
            buf.append(line)
    if buf:
        paragraphs.append("\n".join(buf).strip())
    return [p for p in paragraphs if p]


def chunk_section(title: str, lines):
    """Pack paragraphs of a section into ~MIN-MAX token chunks."""
    paragraphs = split_into_paragraphs(lines)
    chunks = []
    current_parts = []
    current_tokens = 0

    for para in paragraphs:
        para_tokens = count_tokens(para)

        if current_tokens + para_tokens > MAX_TOKENS and current_parts:
            chunks.append("\n\n".join(current_parts))
            current_parts = []
            current_tokens = 0

        current_parts.append(para)
        current_tokens += para_tokens

        if current_tokens >= MIN_TOKENS:
            chunks.append("\n\n".join(current_parts))
            current_parts = []
            current_tokens = 0

    if current_parts:
        chunks.append("\n\n".join(current_parts))

    # Prefix each chunk with its heading for context, unless already present.
    return [f"## {title}\n\n{c}" for c in chunks]


def build_chunks():
    chunks = []
    chunk_id = 0

    for md_path in sorted(RAW_DIR.glob("*.md")):
        text = md_path.read_text(encoding="utf-8")
        sections = split_into_sections(text)

        for title, lines in sections:
            for chunk_text in chunk_section(title, lines):
                chunks.append({
                    "id": chunk_id,
                    "text": chunk_text,
                    "source": md_path.name,
                    "section": title,
                })
                chunk_id += 1

    return chunks


def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    chunks = build_chunks()
    if not chunks:
        print(f"No .md files found in {RAW_DIR}")
        return

    print(f"Loading model '{MODEL_NAME}'...")
    model = TextEmbedding(model_name=MODEL_NAME)

    texts = [c["text"] for c in chunks]
    embeddings = np.array(list(model.embed(texts)), dtype="float32")

    chunks_path = PROCESSED_DIR / "chunks.json"
    embeddings_path = PROCESSED_DIR / "embeddings.npy"

    chunks_path.write_text(json.dumps(chunks, indent=2, ensure_ascii=False), encoding="utf-8")
    np.save(embeddings_path, embeddings)

    per_source = {}
    for c in chunks:
        per_source[c["source"]] = per_source.get(c["source"], 0) + 1

    print("\n=== Summary ===")
    print(f"Total chunks: {len(chunks)}")
    print(f"Embedding dimension: {embeddings.shape[1]}")
    print("Per-source breakdown:")
    for source, count in sorted(per_source.items()):
        print(f"  {source}: {count} chunks")
    print(f"\nSaved: {chunks_path}")
    print(f"Saved: {embeddings_path}")


if __name__ == "__main__":
    main()
