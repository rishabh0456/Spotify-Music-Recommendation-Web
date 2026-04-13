# 🎵 Spotify AI Music Recommender

An industry-level music recommendation system powered by Machine Learning and Spotify's audio features.

## ✨ Features

- 🎯 **Smart Search**: Search 81,000+ tracks instantly
- 🧠 **AI Recommendations**: ML-powered similarity matching
- 😊 **Mood-Based Discovery**: 7 mood categories (happy, sad, energetic, chill, romantic, angry, peaceful)
- 🎵 **Instant Playback**: YouTube integration for music previews
- ⚡ **Lightning Fast**: Sub-30ms response times
- 🆓 **100% Free**: No subscriptions or limits

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (optional, for caching)

### Docker Setup (Recommended)
```bash
# Clone and setup
git clone <your-repo>
cd spotify-recommendation-project

# Add environment variables
cp spotify-recommender/.env.example spotify-recommender/.env
# Edit .env with your API keys

# Run everything
docker-compose up --build

# Access at http://localhost
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
- **scikit-learn** for ML algorithms
- **MongoDB** for caching
- **Spotify Web API** for track data

### Frontend
- **React 19** + Vite
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Lucide React** for icons

### ML Engine
- **Cosine Similarity** algorithm
- **81,000+ tracks** dataset
- **9 audio features** (danceability, energy, valence, etc.)
- **Genre-aware filtering** for cultural relevance

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | System health check |
| GET | `/api/search/?q=query` | Search tracks |
| GET | `/api/recommend/?track=name&artist=name` | Get recommendations |
| GET | `/api/recommend/mood/?mood=happy` | Mood-based recommendations |
| GET | `/api/track/?track=name&artist=name` | Spotify track details |

## 🎯 How It Works

1. **Search**: Find tracks from 81,000+ song database
2. **Analyze**: Extract 9 audio features (danceability, energy, valence, etc.)
3. **Match**: Use cosine similarity to find most similar tracks
4. **Filter**: Apply genre/region filtering for cultural relevance
5. **Enrich**: Add YouTube previews and metadata
6. **Play**: Instant playback with smooth transitions

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

# MongoDB (optional caching)
MONGO_URI=mongodb://localhost:27017/
```

## 📁 Project Structure

```
spotify-recommendation-project/
├── README.md                    # This file
├── docker-compose.yml          # Multi-container setup
└── spotify-recommender/        # Main application
    ├── manage.py               # Django CLI
    ├── requirements.txt        # Python deps
    ├── core/                   # Django settings
    ├── api/                    # REST API endpoints
    ├── ml/                     # ML recommendation engine
    └── frontend/               # React web app
```

## 🚢 Deployment

### Production with Docker
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

### Manual Deployment
- Backend: Gunicorn + Nginx
- Frontend: Static file serving
- Database: MongoDB Atlas or self-hosted

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