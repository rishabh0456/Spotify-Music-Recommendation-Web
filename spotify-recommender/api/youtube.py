import requests
from django.conf import settings
from api.db import get_db

def get_youtube_id(track_name, artist_name):
    # 1. MongoDB Cache Check (Sabse fast)
    try:
        db = get_db()
        cached = db.youtube_cache.find_one({
            'track': track_name.lower(),
            'artist': artist_name.lower()
        })
        if cached:
            return cached['youtube_id']
    except Exception:
        pass
        
    # 2. FAST Direct HTTP API Call (Bina heavy library ke)
    try:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'id',
            'q': f"{track_name} {artist_name} official audio",
            'type': 'video',
            'maxResults': 1,
            'key': settings.YOUTUBE_API_KEY
        }
        
        # Sirf 5 second ka wait, hang hone ka chance hi khatam
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        
        if 'items' in data and len(data['items']) > 0:
            yt_id = data['items'][0]['id']['videoId']
            
            # 3. Future ke liye MongoDB mein save kar lo
            try:
                db.youtube_cache.insert_one({
                    'track': track_name.lower(),
                    'artist': artist_name.lower(),
                    'youtube_id': yt_id
                })
            except Exception:
                pass
                
            return yt_id
            
    except Exception as e:
        print(f"❌ YouTube Fetch Error: {e}")
        
    return None