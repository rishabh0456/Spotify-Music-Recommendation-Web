"""
Gemini AI integration for intelligent prompt-based song filtering.

Takes ML recommendations + user's natural language prompt,
sends to Gemini to understand intent, then re-ranks results.
"""
import json
from django.conf import settings
from google import genai


def get_gemini_client():
    """Get a Gemini client instance."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return None
    return genai.Client(api_key=api_key)


def filter_with_prompt(recommendations, prompt, track_name=None, artist_name=None):
    """
    Use Gemini AI to intelligently filter/re-rank recommendations
    based on the user's natural language prompt.
    
    Args:
        recommendations: List of dicts with track info + audio features
        prompt: User's natural language request (e.g. "sad songs for late night")
        track_name: The seed track name
        artist_name: The seed artist name
    
    Returns:
        Filtered and re-ranked list of recommendation dicts
    """
    client = get_gemini_client()
    if not client or not prompt or not recommendations:
        return recommendations

    # Build a compact track list for Gemini
    track_summaries = []
    for i, rec in enumerate(recommendations):
        summary = {
            'index': i,
            'track': rec.get('track_name', ''),
            'artist': rec.get('artists', ''),
            'genre': rec.get('genre', ''),
            'energy': rec.get('energy', 0.5),
            'valence': rec.get('valence', 0.5),
            'danceability': rec.get('danceability', 0.5),
        }
        track_summaries.append(summary)

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
        'gemini-1.5-flash-8b'
    ]

    try:
        response = None
        last_error = None
        
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
                break  # Successful call, exit the loop
            except Exception as e:
                last_error = e
                print(f"[WARN] Gemini model {model_name} failed: {e}. Trying fallback...")
                continue
                
        if not response:
            print(f"[ERROR] All Gemini models exhausted. Last error: {last_error}")
            return recommendations

        # Parse the response — extract JSON array using regex to be robust
        text = response.text.strip()
        import re
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            text = match.group(0)
        else:
            print(f"[WARN] Gemini returned no JSON array: {text[:50]}")
            return recommendations

        indices = json.loads(text)
        
        if not isinstance(indices, list):
            print("[WARN] Gemini returned non-list, using original order")
            return recommendations

        # Re-order recommendations based on Gemini's ranking
        filtered = []
        seen = set()
        for idx in indices:
            if isinstance(idx, int) and 0 <= idx < len(recommendations) and idx not in seen:
                filtered.append(recommendations[idx])
                seen.add(idx)

        if len(filtered) < 3:
            # Gemini returned too few — fallback to original
            print("[WARN] Gemini returned too few results, using original order")
            return recommendations

        print(f"[OK] Gemini filtered {len(recommendations)} -> {len(filtered)} tracks")
        return filtered

    except json.JSONDecodeError as e:
        print(f"[ERROR] Gemini JSON parse error: {e}")
        return recommendations
    except Exception as e:
        print(f"[ERROR] Gemini API error: {e}")
        return recommendations
