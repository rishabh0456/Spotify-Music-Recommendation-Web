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

def load_data():
    """
    Load and clean the Spotify dataset.
    Returns a cleaned DataFrame ready for ML.
    """
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Dataset not found at {DATA_PATH}. "
            "Please download it from Kaggle and place it in ml/data/dataset.csv"
        )

    # Drop rows with missing values in key columns
    df = df.dropna(subset=FEATURE_COLUMNS + ['track_name', 'artists'])

    # Drop duplicate tracks
    df = df.drop_duplicates(subset=['track_name', 'artists'])

    # Reset index after cleaning
    df = df.reset_index(drop=True)

    # Normalize loudness (it's in negative dB, bring to 0-1)
    df['loudness'] = (df['loudness'] - df['loudness'].min()) / \
                     (df['loudness'].max() - df['loudness'].min())

    # Normalize tempo to 0-1
    df['tempo'] = (df['tempo'] - df['tempo'].min()) / \
                  (df['tempo'].max() - df['tempo'].min())

    print(f"✅ Dataset loaded: {len(df)} tracks ready.")
    return df


def get_feature_matrix(df):
    """
    Extract and return only the audio feature columns as a NumPy matrix.
    """
    return df[FEATURE_COLUMNS].values


def search_tracks(df, query):
    """
    Search tracks by name or artist.
    Returns top 10 matching results.
    """
    query = query.lower().strip()
    mask = (
        df['track_name'].str.lower().str.contains(query, na=False) |
        df['artists'].str.lower().str.contains(query, na=False)
    )
    results = df[mask][['track_name', 'artists', 'track_genre']].head(10)
    return results.to_dict(orient='records')