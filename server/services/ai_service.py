"""
DEVNEXUS TECH — Server-Side AI Services (OpenAI & Google Gemini).
Never exposes API keys to the frontend and never fakes AI responses when unconfigured.
"""

import json
import requests

from server.config import Config, _is_real_secret

SYSTEM_PROMPT = (
    "You are the official DEVNEXUS TECH AI Engineering Assistant. "
    "DEVNEXUS TECH is a newly launched software development & AI solutions company founded by Shabeer Ahmed, "
    "serving clients in Pakistan and internationally (UK, USA, Canada, UAE, Australia). "
    "Core services: Website Development, Web Application Development, E-commerce Development, "
    "Custom Software Development, AI Chatbots, AI Automation (n8n), Admin Dashboard Development, "
    "UI/UX Design (Figma), and API Integration (Appwrite, Stripe, PayPal, JazzCash, Easypaisa, Resend, WhatsApp Cloud). "
    "Be accurate, concise, transparent about being a newly launched studio, and never fabricate client testimonials or metrics."
)


def _call_openai(messages: list[dict], json_mode: bool = False) -> tuple[str | None, str | None]:
    if not _is_real_secret(Config.OPENAI_API_KEY):
        return None, "OpenAI not configured"
    payload = {
        "model": Config.OPENAI_MODEL,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 700,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    try:
        res = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {Config.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=20,
        )
        if not res.ok:
            return None, f"OpenAI HTTP {res.status_code}: {res.text[:200]}"
        content = res.json()["choices"][0]["message"]["content"]
        return content, None
    except Exception as exc:
        return None, str(exc)


def _call_gemini(prompt: str, system_instruction: str = SYSTEM_PROMPT) -> tuple[str | None, str | None]:
    if not _is_real_secret(Config.GEMINI_API_KEY):
        return None, "Gemini not configured"
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{Config.GEMINI_MODEL}:generateContent?key={Config.GEMINI_API_KEY}"
    )
    payload = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 700},
    }
    try:
        res = requests.post(url, json=payload, timeout=20)
        if not res.ok:
            return None, f"Gemini HTTP {res.status_code}: {res.text[:200]}"
        candidates = res.json().get("candidates") or []
        parts = ((candidates[0].get("content") or {}).get("parts") or []) if candidates else []
        text = "".join(p.get("text", "") for p in parts).strip()
        return (text or None), (None if text else "Empty Gemini response")
    except Exception as exc:
        return None, str(exc)


def _run_llm(user_prompt: str, preferred_provider: str = "auto", history: list[dict] | None = None, json_mode: bool = False) -> dict:
    has_openai = _is_real_secret(Config.OPENAI_API_KEY)
    has_gemini = _is_real_secret(Config.GEMINI_API_KEY)

    if not (has_openai or has_gemini):
        return {
            "configured": False,
            "provider": None,
            "text": None,
            "error": "Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured on the server.",
        }

    order = []
    if preferred_provider == "gemini":
        order = ["gemini", "openai"]
    elif preferred_provider == "openai":
        order = ["openai", "gemini"]
    else:
        order = ["gemini", "openai"] if has_gemini else ["openai", "gemini"]

    errors = {}
    for provider in order:
        if provider == "openai" and has_openai:
            msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
            for h in (history or [])[-6:]:
                role = "assistant" if h.get("role") == "assistant" else "user"
                msgs.append({"role": role, "content": str(h.get("content", ""))[:1000]})
            msgs.append({"role": "user", "content": user_prompt})
            text, err = _call_openai(msgs, json_mode=json_mode)
            if text:
                return {"configured": True, "provider": f"openai:{Config.OPENAI_MODEL}", "text": text}
            errors["openai"] = err
        elif provider == "gemini" and has_gemini:
            history_str = ""
            if history:
                history_str = "\n".join(
                    f"{'Assistant' if h.get('role') == 'assistant' else 'User'}: {str(h.get('content', ''))[:600]}"
                    for h in history[-6:]
                )
            full_prompt = f"{history_str}\nUser: {user_prompt}".strip() if history_str else user_prompt
            text, err = _call_gemini(full_prompt)
            if text:
                return {"configured": True, "provider": f"gemini:{Config.GEMINI_MODEL}", "text": text}
            errors["gemini"] = err

    return {
        "configured": True,
        "provider": None,
        "text": None,
        "error": f"AI provider call failed: {errors}",
    }


def chat_assistant(message: str, history: list[dict] | None = None, preferred_provider: str = "auto") -> dict:
    return _run_llm(message, preferred_provider=preferred_provider, history=history)


def qualify_lead(inquiry_data: dict, preferred_provider: str = "auto") -> dict:
    prompt = (
        "Analyze this incoming software agency client inquiry and respond strictly in JSON with keys: "
        "score (integer 1-100), priority (High|Medium|Low), recommended_service (string), "
        "estimated_timeline (string), summary (2 sentences), next_questions (array of 3 strings).\n\n"
        f"Inquiry: {json.dumps(inquiry_data)}"
    )
    res = _run_llm(prompt, preferred_provider=preferred_provider, json_mode=True)
    if not res.get("text"):
        return res
    raw = res["text"].strip()
    if raw.startswith("```"):
        raw = raw.strip("`").replace("json\n", "", 1).strip()
    try:
        res["qualification"] = json.loads(raw)
    except Exception:
        res["qualification"] = {"summary": raw, "score": None, "priority": "Medium"}
    return res


def draft_client_reply(inquiry_data: dict, tone: str = "professional", preferred_provider: str = "auto") -> dict:
    prompt = (
        f"Write a concise, {tone} reply email from DEVNEXUS TECH to the prospective client below. "
        "Acknowledge their requirements, ask 2-3 clarifying engineering questions, and invite them to a discovery call. "
        "Keep it honest and avoid fabricated statistics.\n\n"
        f"Inquiry: {json.dumps(inquiry_data)}"
    )
    return _run_llm(prompt, preferred_provider=preferred_provider)


def project_requirement_assistant(brief: str, service_type: str, preferred_provider: str = "auto") -> dict:
    prompt = (
        f"A client wants to start a '{service_type}' project with DEVNEXUS TECH. "
        f"Based on their notes: \"{brief}\", generate a structured JSON object with keys: "
        "refined_scope (string), recommended_features (array of 5 strings), "
        "suggested_stack (array of strings), key_risks_or_questions (array of 3 strings), "
        "estimated_phases (array of strings). Respond ONLY with valid JSON."
    )
    res = _run_llm(prompt, preferred_provider=preferred_provider, json_mode=True)
    if not res.get("text"):
        return res
    raw = res["text"].strip()
    if raw.startswith("```"):
        raw = raw.strip("`").replace("json\n", "", 1).strip()
    try:
        res["analysis"] = json.loads(raw)
    except Exception:
        res["analysis"] = {"refined_scope": raw}
    return res
