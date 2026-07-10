## What it does
SiliconSeal is an automated optical inspection system that verifies whether an
Integrated Circuit (IC) chip is genuine or counterfeit by analyzing the text markings
printed on it — replacing the manual microscope-based inspection process. Built for
Bharat Electronics Limited (BEL) at Smart India Hackathon 2025 Finals (Problem
Statement ID: 25162), where counterfeit ICs are a serious risk in defense and aerospace
equipment.

## My role
Built in a team of six with me as the team lead, presented at SIH 2025 National Finals for BEL. Designed and implemented the
full detection pipeline (YOLOv8 → PaddleOCR → verification/scoring), the malware
knowledge base and pattern-matching engine, the Groq LLM risk-assessment layer, and
both the FastAPI backend and React frontend across 3 scanning modes.
My main role was making the AI Layer and the FastAPI Backend and governing all the team decisions.

## Tech stack
- Backend: FastAPI (Python 3.11), YOLOv8 (Ultralytics) for IC detection, PaddleOCR for
  text extraction, Regex + Aho-Corasick trie for pattern verification, OpenCV/Pillow/
  NumPy for image processing, JWT (python-jose + bcrypt) for admin auth
- AI: Groq API, Llama 3.3 70B, for plain-English risk assessment
- Frontend: React 19, Vite, Tailwind CSS v4, Framer Motion, React Dropzone
- Deployment: Render (frontend), Hugging Face Spaces / Docker (backend)

## Key results / metrics
- Pipeline: image upload → YOLOv8 detects and crops the IC region → PaddleOCR extracts
  part number, date code, lot code, and logo → verification engine matches extracted
  text against a knowledge base → weighted scoring engine produces a verdict.
- Weighted confidence scoring: Part number 60%, Date code 25%, Lot code 15%.
  GENUINE ≥85%, UNCERTAIN 50–84%, FAKE <50%.
- Knowledge base of 27+ IC entries with OCR-tolerant regex patterns, auto-enrichable
  via the Mouser API.
- 3 scanning modes: single image, batch (up to 20 images), and live camera.
- Dual verification algorithms: regex for known/catalogued ICs, Aho-Corasick trie for
  auto-detection of unlisted ones.
- YYWW date-code validation — a future-dated code is an automatic FAKE verdict, a
  strong and cheap signal before any ML/LLM layer is even needed.

## Interesting decisions / tradeoffs
- **Two verification algorithms instead of one:** regex handles ICs already in the
  knowledge base precisely; the Aho-Corasick trie exists specifically for ICs *not*
  yet catalogued, so the system degrades gracefully instead of just failing closed
  on anything new.
- **Weighted scoring instead of exact-match-only:** OCR on physical chip markings is
  never perfect (glare, wear, angle), so the system needed graded confidence rather
  than binary pass/fail — the 60/25/15 weighting reflects that the part number is the
  most forgeable-relevant and reliable field, while lot code is the least decisive.
- **LLM layer sits after the deterministic pipeline, not instead of it:** exactly
  like ThreatLens — YOLO/OCR/scoring produce the actual verdict data, and Groq's job
  is explaining that verdict in plain English with risk factors, not making the
  call itself. Important for a defense-adjacent use case where the verdict has to be
  justifiable.
- **Handled the free-tier cold start head-on instead of hiding it:** since the
  backend runs on Hugging Face Spaces free tier and sleeps after 15 minutes, the
  frontend explicitly detects "backend offline" and shows a wake-up banner with a
  retry button, rather than just showing a silent failure — a UX lesson directly
  relevant to your own portfolio backend's cold-start problem.
- **JWT-gated admin layer** (KB management, pattern generation) kept separate from
  the public scanning endpoints, so the core product works with zero auth friction
  while sensitive operations stay protected.

## Links
- GitHub: https://github.com/CommitSaif11/SiliconSeal
- Live Demo: https://siliconseal.onrender.com/