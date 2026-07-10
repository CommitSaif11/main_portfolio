## What it does
ThreatLens is a full-stack APK malware analysis platform built for the Bank of India,
Department of Financial Services, and IIT Hyderabad. A user uploads an Android APK and
the system reverse-engineers it, extracts metadata, scores it across three risk
dimensions, matches it against known malware family fingerprints, and runs the result
through a 4-agent LLM pipeline to produce a plain-English threat verdict plus a formal
downloadable PDF investigation report.

## My role
Built solo. Designed and implemented the full pipeline end to end: the static-analysis
extraction layer, the three independent heuristic scorers, the malware fingerprinting
system, the 4-agent LLM orchestration, the PDF report generator, and both the FastAPI
backend and React frontend.

## Tech stack
- Backend: FastAPI, Python 3.11, Androguard (manifest/permission/certificate
  extraction), apktool + JADX (decompilation to Java source)
- AI: Groq API, Llama 3.3 70B, custom 4-agent pipeline
- PDF generation: ReportLab
- Frontend: React 19, Vite 8, Axios
- Deployment: Render (frontend + backend)

## Key results / metrics
- Full pipeline (upload → heuristics → AI analysis → PDF report) completes in
  ~15–30 seconds.
- 4-agent architecture: Triage → Analyst → Synthesizer → Reporter, each agent
  consuming the prior agents' outputs plus raw decompiled code and heuristic scores.
- Risk scoring across 3 independent dimensions (permission abuse, bank
  impersonation, network indicators), each contributing to a final 0–100 risk score
  and CRITICAL/HIGH/MEDIUM/LOW/CLEAN verdict.
- Malware fingerprinting against 5 known banking-trojan families (Anatsa, SOVA,
  FluBot, TeaBot, Brata) using weighted Jaccard similarity across permission overlap,
  package-name pattern, and C2 URL pattern.
- Automated formal PDF report generation with executive summary, IOCs, and
  customer-facing advisory language.

## Interesting decisions / tradeoffs
- **Why 4 separate agents instead of one big prompt:** splitting triage, deep
  analysis, risk synthesis, and report writing into sequential specialized agents
  keeps each prompt focused and makes the reasoning auditable — you can see exactly
  where a verdict came from rather than trusting one opaque LLM call. It also lets
  each agent be tuned/re-prompted independently.
- **Real static analysis, not just an LLM guess:** heuristic scoring and fingerprint
  matching run first and are fully deterministic; the LLM layer explains and
  contextualizes those results rather than inventing them from scratch. That matters
  for something bank-facing — a wrong AI call needs to be explainable, not a black
  box.
- **Rate-limit resilience:** each Groq call includes 3 retry attempts with 5-second
  backoff on 429s, plus a deliberate 3-second pause between the 4 sequential agent
  calls to avoid cascading rate limits — necessary since the free Groq tier is used
  in production-style demos.
- **JSON parsing fallback:** if an agent returns malformed JSON, the system retries
  once with a stricter "raw JSON only" instruction before falling back to an
  error-tagged response rather than crashing the whole pipeline.
- **Weighted rather than binary fingerprint matching:** permission overlap, package
  name, and C2 URL pattern are weighted 0.5/0.3/0.2 rather than requiring an exact
  match, since real malware families and their clones vary in fingerprint but not in
  intent.

## Links
- GitHub: https://github.com/CommitSaif11/AI_BANK_FRAUD_APK_Detection
- Live Demo: https://apk-analyzer-frontend.onrender.com/