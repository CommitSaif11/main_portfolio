## What it does
SBI FinVerse is a proactive banking AI agent built for an SBI Hackathon. Instead of
waiting for customers to ask about products, it continuously scans customer financial
profiles, detects meaningful life events (salary spikes, an upcoming insurance lapse,
marriage, approaching retirement, idle savings), and has an AI conversation agent
("Aria") initiate a warm, contextually relevant outreach with a tailored product
recommendation — the bank reaches out first.

## My role
Built in a team for a hackathon submission.
My specific role was to make the backend and the AI layer and how to manage the data for the RAG layer for the LLM.

## Tech stack
- Backend: FastAPI, Python 3.10, LangChain + langchain-groq, Groq API
  (llama-3.3-70b-versatile), Pydantic v2
- Frontend: React 19, Vite 8, Axios, custom CSS (no framework)
- Deployment: Render (render.yaml included)

## Key results / metrics
- 3-stage agent pipeline: a rule-based TriggerEngine (deterministic, no ML — explicitly
  chosen for speed and explainability) detects 6 life-event types; a
  ProductRecommender scores all 7 SBI products by tag overlap and returns the top 2
  matches; a LangChain + Groq ConversationAgent generates the actual outreach or
  conversational reply.
- Every response includes 5 human-readable reasoning steps shown live in the UI, so
  the agent's decision process is fully transparent rather than a black box.
- Action-detection layer flags when a customer's reply contains confirmation language
  (yes, sure, interested, go ahead, etc.) and surfaces a visible "Action Confirmed"
  state.
- Demo dataset of 5 customer profiles, each engineered to trigger a distinct life
  event type, so the whole pipeline is demonstrable end-to-end without needing real
  bank data.

## Interesting decisions / tradeoffs
- **Deterministic rule-based trigger detection, not ML, for life-event detection:**
  a conscious choice — in a hackathon/banking context, "why did the system flag this
  customer" needs to be instantly explainable to a bank stakeholder, and rule-based
  logic is faster and fully auditable compared to a model that would need training
  data the team didn't have.
- **Splitting detection, recommendation, and conversation into 3 distinct agents**
  rather than one LLM doing everything: keeps the parts that must be reliable (event
  detection, product matching) deterministic, and reserves the LLM for the part that
  actually benefits from natural language — the conversation itself.
- **"Initiate" as a first-class message type:** the conversation agent has an explicit
  proactive-outreach mode distinct from reply-continuation, which is the core product
  differentiator (banks reaching out first) rather than a generic chatbot wrapper.
- This is the weakest of the group in terms of polish/production-readiness — built
  fast for a hackathon — but it's a good demonstration of multi-agent orchestration
  design and is worth keeping in the RAG knowledge base as a "here's how I think about
  agent architecture" example, even if not headlined as flagship work.

## Links
- GitHub: https://github.com/CommitSaif11/SBI_FINVERSE