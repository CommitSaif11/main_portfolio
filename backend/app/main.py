import os
from typing import Literal

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app import rag, llm, geo, visits

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGIN", "http://localhost:5173,http://localhost:5174").split(",")
    if origin.strip()
]

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Saif Portfolio RAG API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    rag.load()
    visits.init_db()
    llm.verify_groq_setup()


class ChatRequest(BaseModel):
    message: str
    mode: Literal["recruiter", "friend"] = "recruiter"


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    used_fallback: bool


class FitCheckRequest(BaseModel):
    job_description: str


class FitCheckResponse(BaseModel):
    matching_skills: list[str]
    gaps: list[str]
    overall_fit_summary: str


@app.get("/health")
def health():
    return {"status": "ok", "chunks_loaded": rag.chunk_count()}


@app.post("/visit")
@limiter.limit("5/minute")
def visit(request: Request):
    ip = geo.get_client_ip(request)
    location = geo.lookup_ip(ip)
    if location is None or location["lat"] is None or location["lon"] is None:
        return {"recorded": False}

    visits.record_visit(
        country=location["country"],
        region_name=location["region_name"],
        lat=location["lat"],
        lng=location["lon"],
    )
    return {
        "recorded": True,
        "country": location["country"],
        "region_name": location["region_name"],
    }


@app.get("/visit-stats")
def visit_stats(response: Response):
    response.headers["Cache-Control"] = "no-store"
    return visits.get_stats()


@app.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
def chat(request: Request, body: ChatRequest):
    if llm.is_greeting(body.message):
        return ChatResponse(answer=llm.generate_greeting_reply(body.mode), sources=[], used_fallback=False)

    retrieved = rag.retrieve(body.message, k=5)
    sources = sorted({chunk["source"] for chunk in retrieved})

    answer = llm.generate_answer(body.message, retrieved, mode=body.mode)
    if answer is not None:
        return ChatResponse(answer=answer, sources=sources, used_fallback=False)

    fallback_text = "\n\n---\n\n".join(chunk["text"] for chunk in retrieved[:3])
    fallback_answer = (
        "Note: this is a fallback response (no LLM used) — here's the most relevant "
        "raw information:\n\n" + fallback_text
    )
    return ChatResponse(answer=fallback_answer, sources=sources, used_fallback=True)


@app.post("/fit-check", response_model=FitCheckResponse)
@limiter.limit("10/minute")
def fit_check(request: Request, body: FitCheckRequest):
    retrieved = rag.retrieve(body.job_description, k=8)

    analysis = llm.generate_fit_analysis(body.job_description, retrieved)
    if analysis is not None:
        return FitCheckResponse(**analysis)

    fallback_text = "\n\n---\n\n".join(chunk["text"] for chunk in retrieved)
    return FitCheckResponse(
        matching_skills=[],
        gaps=[],
        overall_fit_summary=(
            "Automated analysis unavailable right now — here's what's relevant:\n\n"
            + fallback_text
        ),
    )
