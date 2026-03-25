import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from django.conf import settings


def get_spotify_client():
    """
    Returns an authenticated Spotify client.
    Uses Client Credentials flow — no user login needed.
    """
    try:
        auth_manager = SpotifyClientCredentials(
            client_id=settings.SPOTIFY_CLIENT_ID,
            client_secret=settings.SPOTIFY_CLIENT_SECRET,
        )
        return spotipy.Spotify(auth_manager=auth_manager)
    except Exception:
        return None


def get_track_details(track_name, artist_name=None):
    """
    Search Spotify for a track and return its details
    including album art, preview URL, and audio features.
    """
    sp = get_spotify_client()
    if not sp:
        return None

    try:
        query = f"track:{track_name}"
        if artist_name:
            query += f" artist:{artist_name}"

        results = sp.search(q=query, type='track', limit=1)
        tracks = results.get('tracks', {}).get('items', [])

        if not tracks:
            return None

        track = tracks[0]
        track_id = track['id']

        # Get audio features from Spotify
        features = sp.audio_features([track_id])[0] or {}

        return {
            'spotify_id':   track_id,
            'track_name':   track['name'],
            'artists':      ', '.join([a['name'] for a in track['artists']]),
            'album':        track['album']['name'],
            'album_art':    track['album']['images'][0]['url']
                            if track['album']['images'] else None,
            'preview_url':  track.get('preview_url'),
            'spotify_url':  track['external_urls']['spotify'],
            'popularity':   track['popularity'],
            'duration_ms':  track['duration_ms'],
            'audio_features': {
                'danceability':     features.get('danceability', 0),
                'energy':           features.get('energy', 0),
                'loudness':         features.get('loudness', 0),
                'speechiness':      features.get('speechiness', 0),
                'acousticness':     features.get('acousticness', 0),
                'instrumentalness': features.get('instrumentalness', 0),
                'liveness':         features.get('liveness', 0),
                'valence':          features.get('valence', 0),
                'tempo':            features.get('tempo', 0),
            }
        }

    except Exception:
        return None


def enrich_recommendations(recommendations):
    """
    Add Spotify data (album art, preview URL) to
    a list of recommended tracks from our ML engine.
    """
    sp = get_spotify_client()
    if not sp:
        return recommendations

    enriched = []
    for track in recommendations:
        try:
            query = f"track:{track['track_name']} artist:{track['artists']}"
            results = sp.search(q=query, type='track', limit=1)
            items = results.get('tracks', {}).get('items', [])

            if items:
                t = items[0]
                track['album_art']   = t['album']['images'][0]['url'] \
                                       if t['album']['images'] else None
                track['preview_url'] = t.get('preview_url')
                track['spotify_url'] = t['external_urls']['spotify']
                track['album']       = t['album']['name']
            else:
                track['album_art']   = None
                track['preview_url'] = None
                track['spotify_url'] = None
                track['album']       = None

        except Exception:
            track['album_art']   = None
            track['preview_url'] = None
            track['spotify_url'] = None
            track['album']       = None

        enriched.append(track)

    return enriched