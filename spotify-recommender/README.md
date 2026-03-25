# 🎵 Spotify AI Music Recommender

An industry-level music recommendation system powered by Machine Learning.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Django REST Framework
- **ML Engine**: Cosine Similarity (81k+ tracks)
- **Database**: MongoDB
- **API**: Spotify Web API
- **Deployment**: Docker + Nginx

## Quick Start (Docker)

1. Clone the repo
2. Add your Spotify API keys to `.env`
3. Place `dataset.csv` in `ml/data/`
4. Run:
```bash
docker-compose up --build
```
5. Open `http://localhost`

## Local Development

**Backend:**
```bash
venv\Scripts\activate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health/ | Health check |
| GET | /api/search/?q= | Search tracks |
| GET | /api/recommend/?track=&artist= | Get recommendations |
| GET | /api/track/?track= | Get track details |