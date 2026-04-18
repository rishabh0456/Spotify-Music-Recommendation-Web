import pandas as pd
import numpy as np
import os

# Path to dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'dataset.csv')

# Audio features we use for recommendation
FEATURE_COLUMNS = [
    'danceability', 'energy', 'loudness', 'speechiness',
    'acousticness', 'instrumentalness', 'liveness',
    'valence', 'tempo'
]

# ── In-memory cache so load_data() reads CSV only once ──────────────────────
_cached_df = None


def load_data():
    """
    Load and clean the Spotify dataset.
    Caches the result in memory so the CSV is only read once.
    """
    global _cached_df
    if _cached_df is not None:
        return _cached_df

    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Dataset not found at {DATA_PATH}. "
            "Please download it from Kaggle and place it in ml/data/dataset.csv"
        )

    # Drop rows with missing values in key columns
    df = df.dropna(subset=FEATURE_COLUMNS + ['track_name', 'artists'])

    # Deduplicate — use track_name only (case-insensitive) because the same
    # song can appear multiple times with slightly different artist strings
    # (different separators, different artist ordering, etc.)
    df['_name_key'] = df['track_name'].str.lower().str.strip()
    df = df.drop_duplicates(subset=['_name_key'])
    df = df.drop(columns=['_name_key'])

    # Reset index after cleaning
    df = df.reset_index(drop=True)

    # Normalize loudness (it's in negative dB, bring to 0-1)
    df['loudness'] = (df['loudness'] - df['loudness'].min()) / \
                     (df['loudness'].max() - df['loudness'].min())

    # Normalize tempo to 0-1
    df['tempo'] = (df['tempo'] - df['tempo'].min()) / \
                  (df['tempo'].max() - df['tempo'].min())

    print(f"[OK] Dataset loaded: {len(df)} tracks ready.")
    _cached_df = df
    return df


def get_feature_matrix(df):
    """
    Extract and return only the audio feature columns as a NumPy matrix.
    """
    return df[FEATURE_COLUMNS].values


def search_tracks(df, query, offset=0, limit=10):
    """
    Search tracks by name or artist.
    Returns (total_count, results) with offset-based pagination.
    """
    query = query.lower().strip()
    mask = (
        df['track_name'].str.lower().str.contains(query, na=False) |
        df['artists'].str.lower().str.contains(query, na=False)
    )
    matched = df[mask]

    # Extra safety dedup — on track_name only
    matched = matched.copy()
    matched['_name_key'] = matched['track_name'].str.lower().str.strip()
    matched = matched.drop_duplicates(subset=['_name_key']).drop(columns=['_name_key'])

    total_count = len(matched)

    # Paginate
    page = matched.iloc[offset:offset + limit]

    columns = ['track_name', 'artists', 'track_genre',
               'energy', 'danceability', 'valence', 'popularity',
               'acousticness', 'speechiness', 'instrumentalness', 'tempo']
    available = [c for c in columns if c in page.columns]
    results = page[available].copy()

    # Rename for API consistency
    if 'track_genre' in results.columns:
        results = results.rename(columns={'track_genre': 'genre'})

    return total_count, results.to_dict(orient='records')