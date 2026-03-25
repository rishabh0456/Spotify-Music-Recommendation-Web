import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from ml.data_loader import load_data, get_feature_matrix, FEATURE_COLUMNS

# Global cache
_df             = None
_feature_matrix = None

# Genre groups — same region/language stays together
GENRE_GROUPS = {
    # Indian
    'indian': ['indian', 'bollywood', 'desi', 'hindi',
               'punjabi', 'tamil', 'telugu', 'bhojpuri'],
    # East Asian
    'east-asian': ['cantopop', 'j-pop', 'j-idol', 'j-rock',
                   'k-pop', 'anime', 'mandopop', 'korean'],
    # Middle Eastern
    'middle-eastern': ['iranian', 'arabic', 'turkish',
                       'persian', 'afrobeat'],
    # Latin / South American
    'latin': ['latin', 'brazil', 'forro', 'tango', 'salsa',
              'samba', 'bossanova', 'reggaeton', 'mpb'],
    # Malay / Southeast Asian
    'southeast-asian': ['malay', 'philippines', 'thai'],
    # African
    'african': ['afrobeat', 'afropop', 'highlife'],
    # Western — everything else
    'western': ['pop', 'rock', 'hip-hop', 'jazz', 'classical',
                'electronic', 'metal', 'country', 'blues',
                'soul', 'rnb', 'indie', 'alternative',
                'study', 'sleep', 'ambient', 'acoustic',
                'comedy', 'disney', 'kids', 'happy', 'club',
                'dance', 'edm', 'techno', 'house', 'trance',
                'grunge', 'punk', 'black-metal', 'heavy-metal',
                'bluegrass', 'idm', 'chicago-house', 'breakbeat',
                'new-age', 'detroit-techno', 'deep-house',
                'drum-and-bass', 'grindcore']
}


def get_genre_group(genre):
    """
    Returns the broad region/language group for a genre.
    """
    if not genre or genre == 'Unknown':
        return 'western'
    genre_lower = genre.lower()
    for group, genres in GENRE_GROUPS.items():
        if any(g in genre_lower for g in genres):
            return group
    return 'western'


def _load_model():
    """
    Load dataset and build feature matrix once.
    Reuses cached version on subsequent calls.
    """
    global _df, _feature_matrix

    if _df is not None and _feature_matrix is not None:
        return _df, _feature_matrix

    print("🔄 Loading ML model...")
    _df = load_data()

    scaler = MinMaxScaler()
    _feature_matrix = scaler.fit_transform(get_feature_matrix(_df))

    print("✅ ML model ready.")
    return _df, _feature_matrix

def get_recommendations(track_name, artist_name=None, n=10, ai_prompt=None):
    """
    Get smart recommendations:
    - Same language/region songs first
    - Flexible count (5-10) based on similarity threshold
    - Optional AI prompt to refine results
    """
    try:
        df, feature_matrix = _load_model()

        # Find the track
        query = df['track_name'].str.lower() == track_name.lower()
        if artist_name:
            query = query & (
                df['artists'].str.lower().str.contains(
                    artist_name.lower(), na=False
                )
            )

        matches = df[query]

        if matches.empty:
            return {
                'success': False,
                'message': f'Track "{track_name}" not found. '
                           'Try searching first to find the exact name.'
            }

        track_idx   = matches.index[0]
        input_track = df.iloc[track_idx]
        input_genre = input_track.get('track_genre', 'Unknown')
        input_group = get_genre_group(input_genre)

        print(f"🎵 Input track genre: {input_genre} → group: {input_group}")

        # Compute similarity scores for this track only
        scores = cosine_similarity(
            [feature_matrix[track_idx]], feature_matrix
        )[0]

        # Build scored list excluding input track
        scored = [
            (i, float(scores[i]))
            for i in range(len(df))
            if i != track_idx
        ]

        # Sort by similarity descending
        scored.sort(key=lambda x: x[1], reverse=True)

        # ── Apply AI prompt filter ──────────────────────────
        if ai_prompt:
            scored = _apply_prompt_filter(df, scored, ai_prompt)

        # ── Same region/language filter ─────────────────────
        same_region = [
            (i, s) for i, s in scored
            if get_genre_group(
                df.iloc[i].get('track_genre', 'Unknown')
            ) == input_group
        ]

        # If not enough same-region results, allow cross-region
        if len(same_region) < 5:
            same_region = scored

        # ── Flexible count based on threshold ───────────────
        # Keep tracks with similarity > 0.7 (good match)
        # Minimum 5, Maximum 10
        THRESHOLD    = 0.70
        MIN_RESULTS  = 5
        MAX_RESULTS  = 10

        strong_matches = [
            (i, s) for i, s in same_region if s >= THRESHOLD
        ]

        if len(strong_matches) >= MIN_RESULTS:
            final = strong_matches[:MAX_RESULTS]
        else:
            # Not enough strong matches — lower threshold
            final = same_region[:MIN_RESULTS]

        print(f"✅ Found {len(final)} recommendations "
              f"(group: {input_group}, threshold: {THRESHOLD})")

        # Build result
        recommendations = []
        for idx, score in final:
            row = df.iloc[idx]
            recommendations.append({
                'track_name':     row['track_name'],
                'artists':        row['artists'],
                'genre':          row.get('track_genre', 'Unknown'),
                'energy':         round(float(row['energy']), 2),
                'valence':        round(float(row['valence']), 2),
                'danceability':   round(float(row['danceability']), 2),
                'acousticness':   round(float(row['acousticness']), 2),
                'tempo':          round(float(row['tempo']), 2),
                'popularity':     int(row.get('popularity', 0)),
                'similarity':     round(score * 100, 1),
                'region_group':   get_genre_group(
                                      row.get('track_genre', 'Unknown')
                                  ),
            })

        return {
            'success':         True,
            'input_track':     track_name,
            'input_genre':     input_genre,
            'input_group':     input_group,
            'total_results':   len(recommendations),
            'recommendations': recommendations
        }

    except FileNotFoundError as e:
        return {'success': False, 'message': str(e)}
    except Exception as e:
        return {
            'success': False,
            'message': f'Recommendation engine error: {str(e)}'
        }


def _apply_prompt_filter(df, scored, prompt):
    """
    Filter/re-rank results based on AI prompt keywords.
    Examples:
      'chill and relaxing' → boost low energy, high acousticness
      'party songs'        → boost high energy, high danceability
      'sad songs'          → boost low valence
      'romantic'           → boost high valence, low tempo
    """
    prompt = prompt.lower().strip()

    # Keyword → feature preference map
    preferences = {
        'chill':      {'energy': 'low',  'acousticness': 'high'},
        'relax':      {'energy': 'low',  'acousticness': 'high'},
        'sleep':      {'energy': 'low',  'tempo': 'low'},
        'study':      {'energy': 'low',  'speechiness': 'low'},
        'party':      {'energy': 'high', 'danceability': 'high'},
        'dance':      {'danceability': 'high', 'energy': 'high'},
        'workout':    {'energy': 'high', 'tempo': 'high'},
        'sad':        {'valence': 'low', 'energy': 'low'},
        'happy':      {'valence': 'high','energy': 'high'},
        'romantic':   {'valence': 'high','tempo': 'low'},
        'energetic':  {'energy': 'high', 'tempo': 'high'},
        'acoustic':   {'acousticness': 'high'},
        'instrumental':{'speechiness': 'low'},
        'loud':       {'loudness': 'high','energy': 'high'},
        'soft':       {'energy': 'low',  'loudness': 'low'},
    }

    # Find matching preferences from prompt
    active_prefs = {}
    for keyword, prefs in preferences.items():
        if keyword in prompt:
            active_prefs.update(prefs)

    if not active_prefs:
        return scored  # No matching keywords — return as is

    # Re-score based on preferences
    def preference_score(idx):
        row   = df.iloc[idx]
        bonus = 0.0
        for feature, direction in active_prefs.items():
            try:
                val = float(row.get(feature, 0.5))
                if direction == 'high':
                    bonus += val
                else:
                    bonus += (1.0 - val)
            except Exception:
                pass
        return bonus / len(active_prefs)

    # Combine similarity + preference score
    reranked = [
        (i, sim * 0.6 + preference_score(i) * 0.4)
        for i, sim in scored
    ]
    reranked.sort(key=lambda x: x[1], reverse=True)
    return reranked


def get_recommendations_by_features(features, n=10):
    """
    Get recommendations by raw audio features.
    Used with Spotify API integration.
    """
    try:
        df, feature_matrix = _load_model()

        scaler = MinMaxScaler()
        scaled = scaler.fit_transform(get_feature_matrix(df))

        input_vector = np.array([[
            features.get('danceability',     0.5),
            features.get('energy',           0.5),
            features.get('loudness',         0.5),
            features.get('speechiness',      0.1),
            features.get('acousticness',     0.5),
            features.get('instrumentalness', 0.0),
            features.get('liveness',         0.1),
            features.get('valence',          0.5),
            features.get('tempo',            0.5),
        ]])

        scores      = cosine_similarity(input_vector, scaled)[0]
        top_indices = np.argsort(scores)[::-1][:n]

        recommendations = []
        for idx in top_indices:
            row = df.iloc[idx]
            recommendations.append({
                'track_name':   row['track_name'],
                'artists':      row['artists'],
                'genre':        row.get('track_genre', 'Unknown'),
                'energy':       round(float(row['energy']), 2),
                'valence':      round(float(row['valence']), 2),
                'danceability': round(float(row['danceability']), 2),
                'popularity':   int(row.get('popularity', 0)),
                'similarity':   round(float(scores[idx]) * 100, 1),
            })

        return {
            'success':         True,
            'total_results':   len(recommendations),
            'recommendations': recommendations
        }

    except Exception as e:
        return {
            'success': False,
            'message': f'Feature-based recommendation error: {str(e)}'
        }