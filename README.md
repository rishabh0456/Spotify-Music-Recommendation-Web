# 🎵 Spotify AI Music Recommender

An industry-level music recommendation system powered by Machine Learning, Google Gemini AI (NLP), and Spotify's audio features.

## ✨ Features

- 🎯 **Smart Search**: Search 81,000+ tracks instantly
- 🤖 **Gemini AI Natural Language Filtering**: Users can input natural language prompts (e.g., "sad songs for late night") to intelligently re-rank recommendations dynamically using Google's generative models out-of-the-box. Includes resilient multi-model fallback routines.
- 🧠 **ML-powered Recommendations**: Content-based filtering powered by scikit-learn's cosine similarity mapped against native acoustic matrices.
- 🌍 **Strict Genre & Region Isolation**: Enforces explicit global mappings for intelligent tracking matching, isolating completely distinct dialects/cultures against "recommendation leakages".
- 😊 **Mood-Based Discovery**: 8 preset mood categories mapped directly to explicit backend acoustic values (happy, sad, energetic, chill, romantic, angry, focused, party).
- 🎵 **Instant Playback**: YouTube/Spotify API backend integration for comprehensive media discovery.
- ⚡ **Lightning Fast**: Sub-30ms response times backed via MongoDB logging.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (Optional but Recommended)
- MongoDB (optional, for caching, if not using Docker)

### Docker Setup (Recommended)
```bash
# Clone and setup
git clone <your-repo>
cd spotify-recommendation-project

# Add environment variables
cp spotify-recommender/.env.example spotify-recommender/.env
# Edit .env with your API keys (Django, Spotify, YouTube, Gemini, Mongo)

# Run everything
docker-compose up --build

# Access Frontend at http://localhost:80
```

### Local Development

**Backend Setup:**
```bash
cd spotify-recommender
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend Setup (New Terminal):**
```bash
cd spotify-recommender/frontend
npm install
npm run dev
```

**Access:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`

## 🛠️ Tech Stack

### Backend
- **Django 4.2** + Django REST Framework
- **Google Gemini SDK** (`google-genai`) for conversational NLP filtering
- **scikit-learn** & **pandas** for ML algorithms
- **MongoDB** for seamless anonymous query caching & usage analysis
- **Spotify Web API** for high-resolution track assets
- **YouTube API** for track previews

### Frontend
- **React 19** + Vite
- **Tailwind CSS** for premium modern styling
- **Axios** for API orchestration
- **Lucide React** for dynamic icons

### ML & AI Engine
- **Cosine Similarity** algorithm assessing exact intrinsic track parameters
- **Multi-Model LLM Backbones:** `gemini-3-flash-preview`, `gemini-2.0-flash`, `gemini-1.5-flash` natively orchestrated in sequential fallbacks for parsing resilience.
- **9 Audio Features** (danceability, energy, valence, acousticness, etc.)
- **Strict Genre-aware filtering** mapping exact regional variants correctly for precise cultural relevance.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | System health check |
| GET | `/api/search/?q=query&prompt=...` | Search tracks (w/ optional AI intent filtering) |
| GET | `/api/recommend/?track=name&artist=name&prompt=...` | Get recommendations (w/ AI intent prompt) |
| GET | `/api/recommend/mood/?mood=happy` | Mood-based preset recommendations |
| GET | `/api/track/?track=name&artist=name` | Spotify/YouTube track details |

## 🎯 How It Works

1. **Search**: Find tracks from 81,000+ song dataset efficiently linked via pandas chunking.
2. **Analyze**: Extract 9 audio features (danceability, energy, valence, etc.).
3. **Match**: Use cosine similarity to find highly cohesive tracks inside strict local region-clusters.
4. **Filter**: Apply region filtering for internal cultural relevance safely preventing false-positives.
5. **AI Ranking**: Inject the local cluster directly into Google Gemini via backend prompts alongside user NLP requests (ex: "More instrumental"). Overrides standard clustering natively!
6. **Enrich**: Reach out dynamically to Spotify/YouTube for cover art & audio/video previews natively.
7. **Play**: Instant playback on an elegant frontend UI.

## 🔧 Environment Setup

Create `.env` file in `spotify-recommender/` directory:

```env
# Django
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True

# Spotify API (for track details)
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret

# YouTube API (for previews)
YOUTUBE_API_KEY=your-api-key

# Gemini AI (for NLP filtering)
GEMINI_API_KEY=your-gemini-key

# MongoDB (Usage logging)
MONGO_URI=mongodb://mongodb:27017/
MONGO_DB_NAME=spotify_recommender
```

## 📁 Project Structure

```
spotify-recommendation-project/
├── README.md                    # This file (Root)
├── docker-compose.yml           # Multi-container setup
└── spotify-recommender/         # Main application
    ├── api/                     # REST API endpoints & AI Orchestration (gemini_ai.py / spotify.py / youtube.py)
    ├── core/                    # Django settings & core configurations
    ├── ml/                      # ML recommendation engine & dataset ingestion
    ├── frontend/                # React web app powered by Vite
    ├── manage.py                # Django CLI
    └── requirements.txt         # Python dependencies
```

## 🚢 Deployment

### Production with Docker
```bash
# Build and deploy
docker-compose up -d --build
```

### Manual Deployment
- Backend: Gunicorn / Daphne target
- Frontend: Web Server Static serving `dist/`
- Database: MongoDB running globally mapped to `27017`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

**Rishabh Jha**

---

**⭐ Star this repo if you found it helpful!**

*Discover your next favorite song with AI-powered recommendations.*