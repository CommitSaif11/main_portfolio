"""Groq LLM wrapper for answering questions and fit-check analysis about Saif."""

import json
import logging
import os
import re
import traceback

from groq import Groq

MODEL_NAME = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
TIMEOUT_SECONDS = 8

logger = logging.getLogger("app.llm")

_client = None


def _masked_key(key: str) -> str:
    if not key:
        return "<empty>"
    if len(key) <= 8:
        return "*" * len(key)
    return f"{key[:4]}...{key[-4:]} (len={len(key)})"


_api_key = os.environ.get("GROQ_API_KEY", "")
logger.warning("GROQ_API_KEY loaded: %s", _masked_key(_api_key))
logger.warning("GROQ_MODEL: %s", MODEL_NAME)


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=_api_key, timeout=TIMEOUT_SECONDS)
    return _client


def verify_groq_setup() -> bool:
    """Runs at startup: confirms the API key is present and the configured model
    is actually reachable, with a real (minimal) completion call - not just a
    config check. Loud pass/fail logging so a bad key/model is never discovered
    only later via a silent /chat fallback."""
    if not _api_key:
        logger.error("GROQ STARTUP CHECK FAILED: GROQ_API_KEY is missing or empty")
        return False

    try:
        client = _get_client()
        client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=5,
            timeout=TIMEOUT_SECONDS,
        )
        logger.warning("Groq connection OK — model: %s", MODEL_NAME)
        return True
    except Exception as exc:
        logger.error(
            "GROQ STARTUP CHECK FAILED: could not reach model '%s' - %s\n%s",
            MODEL_NAME,
            exc,
            traceback.format_exc(),
        )
        return False


GREETING_WORDS = [
    "hi", "hey", "hello", "yo", "sup", "hiya", "howdy", "morning", "afternoon",
    "evening", "greetings", "hola", "hii", "heya",
]


def _levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a or not b:
        return max(len(a), len(b))
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        curr = [i]
        for j, cb in enumerate(b, 1):
            cost = 0 if ca == cb else 1
            curr.append(min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost))
        prev = curr
    return prev[-1]


def is_greeting(message: str) -> bool:
    """True only for short small-talk with no real question content, e.g. "hi",
    "hello", "hey there", or typos of these like "hellpo" - not for anything that
    also asks something (e.g. "hi, what has Saif built")."""
    cleaned = re.sub(r"[^a-z\s]", "", message.lower()).strip()
    if not cleaned:
        return False
    words = cleaned.split()
    if len(words) > 3:
        return False
    if "?" in message:
        return False

    for word in words:
        if not any(_levenshtein(word, greeting) <= 1 for greeting in GREETING_WORDS):
            return False
    return True


GREETING_REPLY_BY_MODE = {
    "recruiter": "Hi there! I'm here to answer questions about Saif's experience, skills, or fit for a role - what would you like to know?",
    "friend": "Heyyy! What's up? Ask me anything about Saif - I'm an open book (mostly).",
}


def generate_greeting_reply(mode: str = "recruiter") -> str:
    return GREETING_REPLY_BY_MODE.get(mode, GREETING_REPLY_BY_MODE["recruiter"])


def _format_context(retrieved_chunks) -> str:
    parts = []
    for chunk in retrieved_chunks:
        parts.append(f"[Source: {chunk['source']} — {chunk['section']}]\n{chunk['text']}")
    return "\n\n---\n\n".join(parts)


CHAT_TONE_BY_MODE = {
    "recruiter": (
        "VOICE: Professional recruiter briefing. Confident, concise, zero filler words. "
        "Write like a sharp candidate one-pager - short declarative sentences. "
        "No slang, no jokes, no emoji."
    ),
    "friend": (
        "VOICE: Texting a friend. Casual, warm, a bit playful/funny - light teasing about "
        "Saif is welcome (e.g. joking about his hobbies or habits from the context). "
        "Contractions, informal phrasing, maybe an emoji here or there. Still actually helpful, "
        "not just jokes."
    ),
}

CHAT_SYSTEM_PROMPT = """You are Saif's personal portfolio assistant, speaking about Saif in a friendly, \
first-person-adjacent way (e.g. "Saif built..." or speaking as if representing him warmly and \
professionally). Answer the user's question ONLY using the context provided below about Saif. \
Do not invent facts, credentials, or experience not present in the context.

If the context does not contain enough information to answer the question, respond exactly with: \
"I don't have that info, but you can ask Saif directly."

Formatting rules:
- Keep answers short and scannable - use bullet points or short sentences, not long paragraphs.
- Never write more than 2-3 sentences of prose in a row before breaking into bullets or a new line.
- End every response with exactly one natural follow-up question inviting the user to ask more \
(e.g. "Want to know more about how that model was trained?"). This must read as your own \
curiosity/invitation, not a canned label.

{tone}
This voice must be clearly noticeable in your word choice and sentence rhythm - not just the topic.

Context about Saif:
{context}
"""


def generate_answer(query: str, retrieved_chunks, mode: str = "recruiter") -> str:
    context = _format_context(retrieved_chunks)
    tone = CHAT_TONE_BY_MODE.get(mode, CHAT_TONE_BY_MODE["recruiter"])
    temperature = 0.7 if mode == "friend" else 0.4
    system_prompt = CHAT_SYSTEM_PROMPT.format(context=context, tone=tone)

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query},
            ],
            temperature=temperature,
            max_tokens=1000,
            timeout=TIMEOUT_SECONDS,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        logger.error("generate_answer failed:\n%s", traceback.format_exc())
        return None


FIT_CHECK_SYSTEM_PROMPT = """You are analyzing how well Saif fits a job description, using ONLY the \
context about Saif provided below. Do not invent skills or experience not present in the context.

Respond ONLY with valid JSON matching this exact schema, no markdown fences, no extra text:
{{
  "matching_skills": ["..."],
  "gaps": ["..."],
  "overall_fit_summary": "2-3 sentence summary"
}}

Keep it tight: at most 6 items in "matching_skills", at most 4 items in "gaps", each item a short \
phrase (not a sentence). This keeps the response well within the token budget.

Context about Saif:
{context}
"""


def generate_fit_analysis(job_description: str, retrieved_chunks):
    context = _format_context(retrieved_chunks)
    system_prompt = FIT_CHECK_SYSTEM_PROMPT.format(context=context)

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Job description:\n{job_description}"},
            ],
            temperature=0.3,
            max_tokens=1500,
            timeout=TIMEOUT_SECONDS,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content.strip()
        parsed = json.loads(content)
        return {
            "matching_skills": parsed.get("matching_skills", []),
            "gaps": parsed.get("gaps", []),
            "overall_fit_summary": parsed.get("overall_fit_summary", ""),
        }
    except Exception:
        logger.error("generate_fit_analysis failed:\n%s", traceback.format_exc())
        return None
