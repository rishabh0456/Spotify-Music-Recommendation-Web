"""
Gemini AI integration for intelligent prompt-based song filtering.

Takes ML recommendations + user's natural language prompt,
sends to Gemini to understand intent, then re-ranks results.

If Gemini quota is exhausted, falls back to a local keyword-based
audio feature filter so the prompt box always produces useful results.
"""
import re
import json
from django.conf import settings
from google import genai


def get_gemini_client():
    """Get a Gemini client instance."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return None
    return genai.Client(api_key=api_key)


# ── Local fallback: keyword → audio feature scoring ─────────────────────────

MOOD_RULES = {
    # (feature, direction, weight)
    # direction: 'high' means we want high values, 'low' means we want low values
    'sad':        [('valence', 'low', 2.0), ('energy', 'low', 1.0)],
    'melancholy': [('valence', 'low', 2.0), ('energy', 'low', 1.0)],
    'heartbreak': [('valence', 'low', 2.0), ('danceability', 'low', 1.0)],
    'depressing': [('valence', 'low', 2.0), ('energy', 'low', 1.5)],
    'cry':        [('valence', 'low', 1.5), ('energy', 'low', 1.0)],
    'gloomy':     [('valence', 'low', 1.5), ('energy', 'low', 1.0)],

    'happy':      [('valence', 'high', 2.0), ('energy', 'high', 1.0)],
    'joy':        [('valence', 'high', 2.0), ('energy', 'high', 1.0)],
    'cheerful':   [('valence', 'high', 1.5), ('danceability', 'high', 1.0)],
    'fun':        [('valence', 'high', 1.5), ('danceability', 'high', 1.5)],
    'upbeat':     [('valence', 'high', 1.5), ('energy', 'high', 1.5)],
    'positive':   [('valence', 'high', 1.5), ('energy', 'high', 1.0)],

    'chill':      [('energy', 'low', 2.0), ('danceability', 'low', 1.0), ('valence', 'high', 0.5)],
    'calm':       [('energy', 'low', 2.0), ('danceability', 'low', 1.0)],
    'relax':      [('energy', 'low', 2.0), ('acousticness', 'high', 1.0)],
    'peaceful':   [('energy', 'low', 2.0), ('acousticness', 'high', 1.5)],
    'mellow':     [('energy', 'low', 1.5), ('acousticness', 'high', 1.0)],
    'sleep':      [('energy', 'low', 2.0), ('acousticness', 'high', 2.0), ('danceability', 'low', 1.0)],
    'late night': [('energy', 'low', 1.5), ('valence', 'low', 0.5)],

    'energetic':  [('energy', 'high', 2.0), ('danceability', 'high', 1.0)],
    'hype':       [('energy', 'high', 2.0), ('danceability', 'high', 1.5)],
    'intense':    [('energy', 'high', 2.0), ('valence', 'low', 0.5)],
    'workout':    [('energy', 'high', 2.0), ('tempo', 'high', 1.0)],
    'pump':       [('energy', 'high', 2.0), ('danceability', 'high', 1.5)],

    'party':      [('danceability', 'high', 2.0), ('energy', 'high', 1.5), ('valence', 'high', 1.0)],
    'dance':      [('danceability', 'high', 2.0), ('energy', 'high', 1.0)],
    'groove':     [('danceability', 'high', 1.5), ('energy', 'high', 1.0)],
    'club':       [('danceability', 'high', 2.0), ('energy', 'high', 1.5)],

    'romantic':   [('valence', 'high', 1.0), ('energy', 'low', 1.0), ('acousticness', 'high', 1.0)],
    'love':       [('valence', 'high', 1.5), ('energy', 'low', 0.5)],
    'date':       [('valence', 'high', 1.0), ('energy', 'low', 1.0)],
    'intimate':   [('energy', 'low', 1.5), ('acousticness', 'high', 1.5)],

    'focus':      [('instrumentalness', 'high', 2.0), ('energy', 'low', 1.0), ('speechiness', 'low', 1.5)],
    'study':      [('instrumentalness', 'high', 2.0), ('energy', 'low', 1.0)],
    'motivate':   [('energy', 'high', 1.5), ('valence', 'high', 1.5)],
    'acoustic':   [('acousticness', 'high', 2.0)],
    'instrumental': [('instrumentalness', 'high', 2.0), ('speechiness', 'low', 1.5)],
}


def _local_filter(recommendations, prompt):
    """
    Score and rank tracks using audio features based on keywords in the prompt.
    Always returns something useful even without an API.
    """
    prompt_lower = prompt.lower()

    # Gather all matching rules from keywords found in the prompt
    active_rules = []
    for keyword, rules in MOOD_RULES.items():
        if keyword in prompt_lower:
            active_rules.extend(rules)

    if not active_rules:
        # No matching keywords — return original order unchanged
        print(f"[LOCAL] No mood keywords matched in prompt: '{prompt}'. Returning original order.")
        return recommendations

    def score_track(track):
        score = 0.0
        for feature, direction, weight in active_rules:
            val = float(track.get(feature, 0.5))
            if direction == 'high':
                score += val * weight
            else:
                score += (1.0 - val) * weight
        return score

    ranked = sorted(recommendations, key=score_track, reverse=True)
    matched_keywords = [kw for kw in MOOD_RULES if kw in prompt_lower]
    print(f"[LOCAL] Filtered with keywords: {matched_keywords} — ranked {len(ranked)} tracks")
    return ranked


# ── Gemini AI filter ─────────────────────────────────────────────────────────

def filter_with_prompt(recommendations, prompt, track_name=None, artist_name=None):
    """
    Use Gemini AI to intelligently filter/re-rank recommendations
    based on the user's natural language prompt.

    Falls back to local audio feature scoring if Gemini is unavailable.

    Args:
        recommendations: List of dicts with track info + audio features
        prompt: User's natural language request (e.g. "sad songs for late night")
        track_name: The seed track name
        artist_name: The seed artist name

    Returns:
        Filtered and re-ranked list of recommendation dicts
    """
    if not prompt or not recommendations:
        return recommendations

    client = get_gemini_client()

    # ── Try Gemini first ──────────────────────────────────────────────────────
    if client:
        # Build a compact track list for Gemini
        track_summaries = []
        for i, rec in enumerate(recommendations):
            track_summaries.append({
                'index': i,
                'track': rec.get('track_name', ''),
                'artist': rec.get('artists', ''),
                'genre': rec.get('genre', ''),
                'energy': rec.get('energy', 0.5),
                'valence': rec.get('valence', 0.5),
                'danceability': rec.get('danceability', 0.5),
            })

        system_prompt = """You are a music recommendation AI assistant. 
Your job is to filter and re-rank a list of songs based on what the user wants.

You will receive:
1. A list of recommended songs with their audio features (energy, valence, danceability)
2. The user's natural language prompt describing what they want

Audio features explained:
- energy (0-1): How intense/fast the song is. Low = calm, High = intense
- valence (0-1): How happy/positive the song sounds. Low = sad/dark, High = happy/cheerful  
- danceability (0-1): How suitable for dancing. Low = not danceable, High = very danceable

Your task:
- Understand the user's intent from their prompt
- Select the BEST matching songs from the list
- Return ONLY a JSON array of indices (0-based) of the songs that match, ordered from best match to worst
- Return at least 5 indices if possible, up to 15 maximum
- If the user asks for a specific artist, prioritize songs by that artist
- If the user asks for a mood (sad, happy, romantic, etc.), use the audio features to filter

IMPORTANT: Return ONLY a valid JSON array of numbers, nothing else. Example: [2, 5, 0, 7, 3]"""

        user_message = f"""Seed track: "{track_name or 'Unknown'}" by {artist_name or 'Unknown'}

User's request: "{prompt}"

Songs to filter (with audio features):
{json.dumps(track_summaries, indent=2)}

Return the JSON array of indices for the best matching songs:"""

        models_to_try = [
            'gemini-3-flash-preview',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
        ]

        try:
            response = None

            for model_name in models_to_try:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=user_message,
                        config={
                            'system_instruction': system_prompt,
                            'temperature': 0.3,
                            'max_output_tokens': 800,
                            'response_mime_type': 'application/json',
                        }
                    )
                    print(f"[OK] Successfully used Gemini model: {model_name}")
                    break
                except Exception as e:
                    # 429 quota is per-project — no point retrying other models
                    if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
                        print(f"[WARN] Gemini quota exhausted — switching to local filter.")
                        return _local_filter(recommendations, prompt)
                    print(f"[WARN] Gemini model {model_name} failed: {e}. Trying next...")
                    continue

            if response:
                # Parse the response — extract JSON array using robust regex
                text = response.text.strip()

                # Strip markdown code fences if present
                text = re.sub(r'^```(?:json)?\s*', '', text)
                text = re.sub(r'\s*```$', '', text)

                indices = []

                # First attempt: full JSON array parse
                match = re.search(r'\[\s*(?:[\d,\s]*)\s*\]', text, re.DOTALL)
                if match:
                    try:
                        indices = json.loads(match.group(0))
                        print(f"[OK] Gemini returned indices: {indices}")
                    except json.JSONDecodeError:
                        indices = []

                # Second attempt: grab all digit sequences
                if not indices:
                    numbers = re.findall(r'\b(\d+)\b', text)
                    if numbers:
                        indices = [int(n) for n in numbers]
                        print(f"[OK] Extracted indices from text: {indices}")

                if indices:
                    filtered = []
                    seen = set()
                    for idx in indices:
                        try:
                            idx_int = int(idx)
                            if 0 <= idx_int < len(recommendations) and idx_int not in seen:
                                filtered.append(recommendations[idx_int])
                                seen.add(idx_int)
                        except (ValueError, TypeError):
                            continue

                    if len(filtered) >= 3:
                        print(f"[OK] Gemini filtered {len(recommendations)} → {len(filtered)} tracks")
                        return filtered
                    else:
                        print(f"[WARN] Gemini returned too few results ({len(filtered)}), using local filter.")

        except Exception as e:
            print(f"[ERROR] Gemini API error: {e}. Switching to local filter.")

    # ── Local fallback ────────────────────────────────────────────────────────
    return _local_filter(recommendations, prompt)
