import concurrent.futures
from api.youtube import get_youtube_id


def get_spotify_client():
    return None


def get_track_details(track_name, artist_name=None):
    return None


def enrich_single_track(track):
    """
    YouTube se sab kuch lega:
    - youtube_id for playback
    - YouTube thumbnail for album art
    No Spotify, no 403, no timeout!
    """
    try:
        yt_id = get_youtube_id(
            track['track_name'],
            track['artists']
        )
        track['youtube_id'] = yt_id

        # YouTube thumbnail as album art — instant, free!
        if yt_id:
            track['album_art'] = f"https://img.youtube.com/vi/{yt_id}/mqdefault.jpg"
        else:
            track['album_art'] = None

    except Exception:
        track['youtube_id'] = None
        track['album_art']  = None

    # Remove Spotify fields
    track['preview_url'] = None
    track['spotify_url'] = None
    track['album']       = None

    return track


def enrich_recommendations(recommendations):
    """
    Parallel YouTube enrichment — fast and reliable
    """
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        enriched = list(executor.map(enrich_single_track, recommendations))
    return enriched