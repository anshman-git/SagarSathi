import logging
import json
from typing import Optional, Dict, Any
from ..config import settings
from ..models import AgentState

logger = logging.getLogger(__name__)

class GeminiAgentEngine:
    """
    Integrates with Google GenAI SDK (Gemini) with function calling.
    Strict Grounding Rule: The model is given structured facts and only phrases them.
    If no key is configured, gracefully returns None to use the deterministic offline phrase bank.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL

    async def enhance_answer(self, state: AgentState) -> Optional[str]:
        if not self.api_key:
            return None

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model_name)

            prompt = f"""
You are SagarMitra, an expert marine intelligence AI assistant for Indian fishermen and coastal authorities.
Phrase the following structured ocean facts into a helpful, empathetic, and direct response in language code '{state.lang}'.
DO NOT change any numbers, dates, coordinates, distances, or safety verdicts.

Structured Facts:
- User Question: {state.user_text}
- Intent: {state.intent}
- Location: {state.entities.location.name if state.entities.location else 'Coast'}
- Vessel Profile: {state.entities.vessel_profile.value}
- Safety Verdict: {state.verdict.level.value if state.verdict else 'N/A'} - {state.verdict.headline if state.verdict else ''}
- Safe Departure Window: {state.verdict.safe_window_start if state.verdict else ''} to {state.verdict.safe_window_end if state.verdict else ''}
- Reasoning: {json.dumps(state.reasoning_steps)}
- Draft Base Advisory:
{state.answer_text}

Respond in the requested language ('{state.lang}') with clear formatting, bullet points, and appropriate marine emojis.
"""
            response = await model.generate_content_async(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.info(f"Gemini LLM call failed or key absent ({e}); using offline phrase bank.")

        return None
