from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ml.recommender import get_recommendations, get_recommendations_by_features
from ml.data_loader import load_data, search_tracks
from api.spotify import get_track_details, enrich_recommendations
from api.db import get_db


def success_response(data, status_code=status.HTTP_200_OK):
    return Response({
        'success': True,
        'data': data
    }, status=status_code)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({
        'success': False,
        'error': {
            'status_code': status_code,
            'message': message
        }
    }, status=status_code)


# ─── HEALTH CHECK ───────────────────────────────────────────
@api_view(['GET'])
def health_check(request):
    return success_response({
        'status':  'running',
        'message': 'Spotify Recommender API is up!'
    })


# ─── SEARCH TRACKS ──────────────────────────────────────────
@api_view(['GET'])
def search(request):
    query = request.GET.get('q', '').strip()

    if not query:
        return error_response('Search query "q" is required.')

    if len(query) < 2:
        return error_response('Query must be at least 2 characters.')

    try:
        df = load_data()
        results = search_tracks(df, query)

        if not results:
            return error_response(
                f'No tracks found for "{query}". Try a different search.',
                status.HTTP_404_NOT_FOUND
            )

        return success_response({
            'query':   query,
            'count':   len(results),
            'results': results
        })

    except Exception as e:
        return error_response(
            f'Search failed: {str(e)}',
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ─── RECOMMEND BY TRACK NAME ────────────────────────────────
@api_view(['GET'])
def recommend(request):
    track_name  = request.GET.get('track', '').strip()
    artist_name = request.GET.get('artist', '').strip()
    n           = int(request.GET.get('n', 10))
    use_spotify = request.GET.get('spotify', 'true').lower() == 'true'
    ai_prompt   = request.GET.get('prompt', '').strip() or None

    if not track_name:
        return error_response('Track name "track" is required.')

    if n < 1 or n > 50:
        return error_response('n must be between 1 and 50.')

    try:
        result = get_recommendations(
            track_name,
            artist_name=artist_name or None,
            n=n,
            ai_prompt=ai_prompt
        )

        if not result['success']:
            return error_response(result['message'], status.HTTP_404_NOT_FOUND)

        recommendations = result['recommendations']

        if use_spotify:
            recommendations = enrich_recommendations(recommendations)

        try:
            db = get_db()
            db.searches.insert_one({
                'track':     track_name,
                'artist':    artist_name,
                'prompt':    ai_prompt,
                'genre':     result.get('input_genre'),
                'group':     result.get('input_group'),
                'results':   len(recommendations)
            })
        except Exception:
            pass

        return success_response({
            'input_track':    track_name,
            'input_genre':    result.get('input_genre'),
            'input_group':    result.get('input_group'),
            'total_results':  len(recommendations),
            'recommendations': recommendations
        })

    except Exception as e:
        return error_response(
            f'Recommendation failed: {str(e)}',
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ─── RECOMMEND BY SPOTIFY TRACK ID ──────────────────────────
@api_view(['GET'])
def recommend_by_spotify(request):
    track_name  = request.GET.get('track', '').strip()
    artist_name = request.GET.get('artist', '').strip()
    n           = int(request.GET.get('n', 10))

    if not track_name:
        return error_response('Track name "track" is required.')

    try:
        # Get audio features from Spotify
        track_details = get_track_details(track_name, artist_name or None)

        if not track_details:
            return error_response(
                f'Could not find "{track_name}" on Spotify.',
                status.HTTP_404_NOT_FOUND
            )

        # Use audio features for ML recommendation
        features = track_details['audio_features']
        result   = get_recommendations_by_features(features, n=n)

        if not result['success']:
            return error_response(result['message'])

        recommendations = enrich_recommendations(result['recommendations'])

        return success_response({
            'input_track':     track_details,
            'total_results':   len(recommendations),
            'recommendations': recommendations
        })

    except Exception as e:
        return error_response(
            f'Spotify recommendation failed: {str(e)}',
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ─── GET TRACK DETAILS FROM SPOTIFY ────
@api_view(['GET'])
def track_details(request):
    track_name  = request.GET.get('track', '').strip()
    artist_name = request.GET.get('artist', '').strip()

    if not track_name:
        return error_response('Track name "track" is required.')

    try:
        details = get_track_details(track_name, artist_name or None)

        if not details:
            return error_response(
                f'Track "{track_name}" not found on Spotify.',
                status.HTTP_404_NOT_FOUND
            )

        return success_response(details)

    except Exception as e:
        return error_response(
            f'Failed to fetch track details: {str(e)}',
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def recommend_by_mood(request):
    mood        = request.GET.get('mood', '').strip().lower()
    n           = int(request.GET.get('n', 10))
    use_spotify = request.GET.get('spotify', 'true').lower() == 'true'

    if not mood:
        return error_response('Mood parameter is required.')

    # Mood → audio feature map
    MOOD_FEATURES = {
        'happy': {
            'danceability':     0.8,
            'energy':           0.8,
            'valence':          0.9,
            'tempo':            0.7,
            'acousticness':     0.2,
            'speechiness':      0.1,
            'instrumentalness': 0.0,
            'liveness':         0.2,
            'loudness':         0.7,
        },
        'sad': {
            'danceability':     0.3,
            'energy':           0.3,
            'valence':          0.1,
            'tempo':            0.3,
            'acousticness':     0.7,
            'speechiness':      0.1,
            'instrumentalness': 0.2,
            'liveness':         0.1,
            'loudness':         0.3,
        },
        'energetic': {
            'danceability':     0.8,
            'energy':           0.95,
            'valence':          0.7,
            'tempo':            0.9,
            'acousticness':     0.1,
            'speechiness':      0.1,
            'instrumentalness': 0.0,
            'liveness':         0.3,
            'loudness':         0.9,
        },
        'chill': {
            'danceability':     0.5,
            'energy':           0.3,
            'valence':          0.5,
            'tempo':            0.3,
            'acousticness':     0.7,
            'speechiness':      0.05,
            'instrumentalness': 0.3,
            'liveness':         0.1,
            'loudness':         0.2,
        },
        'romantic': {
            'danceability':     0.5,
            'energy':           0.4,
            'valence':          0.7,
            'tempo':            0.4,
            'acousticness':     0.6,
            'speechiness':      0.05,
            'instrumentalness': 0.1,
            'liveness':         0.1,
            'loudness':         0.3,
        },
        'angry': {
            'danceability':     0.5,
            'energy':           0.95,
            'valence':          0.1,
            'tempo':            0.9,
            'acousticness':     0.05,
            'speechiness':      0.2,
            'instrumentalness': 0.0,
            'liveness':         0.3,
            'loudness':         0.95,
        },
        'focused': {
            'danceability':     0.3,
            'energy':           0.4,
            'valence':          0.5,
            'tempo':            0.4,
            'acousticness':     0.5,
            'speechiness':      0.03,
            'instrumentalness': 0.8,
            'liveness':         0.1,
            'loudness':         0.3,
        },
        'party': {
            'danceability':     0.95,
            'energy':           0.9,
            'valence':          0.8,
            'tempo':            0.8,
            'acousticness':     0.05,
            'speechiness':      0.2,
            'instrumentalness': 0.0,
            'liveness':         0.4,
            'loudness':         0.9,
        },
    }

    if mood not in MOOD_FEATURES:
        return error_response(
            f'Mood "{mood}" not supported. '
            f'Choose from: {", ".join(MOOD_FEATURES.keys())}'
        )

    try:
        features = MOOD_FEATURES[mood]
        result   = get_recommendations_by_features(features, n=n)

        if not result['success']:
            return error_response(result['message'])

        recommendations = result['recommendations']

        if use_spotify:
            recommendations = enrich_recommendations(recommendations)

        # Log to MongoDB
        try:
            db = get_db()
            db.mood_searches.insert_one({
                'mood':    mood,
                'results': len(recommendations)
            })
        except Exception:
            pass

        return success_response({
            'mood':            mood,
            'total_results':   len(recommendations),
            'recommendations': recommendations
        })

    except Exception as e:
        return error_response(
            f'Mood recommendation failed: {str(e)}',
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )        