import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music2, Sparkles, Zap, Bot } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import MoodSelector from '../components/MoodSelector'
import TrackCard from '../components/TrackCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { searchTracks, getRecommendationsByMood } from '../api'
import toast from 'react-hot-toast'

export default function Home() {
  const [results, setResults]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [moodLoading, setMoodLoading] = useState(false)
  const [searched, setSearched]       = useState(false)
  const [activeMode, setActiveMode]   = useState(null)
  const [aiPrompt, setAiPrompt]       = useState('')
  const [showPrompt, setShowPrompt]   = useState(false)
  const navigate = useNavigate()

  // ── Search handler ────────────────────────────────────────
  const handleSearch = async (query) => {
    setLoading(true)
    setSearched(true)
    setActiveMode('search')
    try {
      const data = await searchTracks(query)
      setResults(data.results || [])
      if ((data.results || []).length === 0) {
        toast.error(`No tracks found for "${query}"`)
      }
    } catch (err) {
      toast.error(err.message || 'Search failed. Is Django running?')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // ── Mood handler ──────────────────────────────────────────
  const handleMoodSelect = async (mood) => {
    setMoodLoading(true)
    setSearched(true)
    setActiveMode('mood')
    try {
      const data = await getRecommendationsByMood(mood, 10)
      setResults(data.recommendations || [])
      toast.success(`🎵 ${mood.charAt(0).toUpperCase() + mood.slice(1)} vibes loaded!`)
    } catch (err) {
      toast.error(err.message || 'Mood recommendations failed.')
      setResults([])
    } finally {
      setMoodLoading(false)
    }
  }

  // ── Click track → go to results page ─────────────────────
  const handleRecommend = (track) => {
    navigate('/results', {
      state: {
        track:  track.track_name,
        artist: track.artists,
        prompt: aiPrompt || null,
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#121212]">

      {/* ── Hero Section ─────────────────────────────────── */}
      <div className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500 opacity-5 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 text-green-400 text-sm px-4 py-2 rounded-full mb-6">
          <Sparkles size={14} />
          AI-Powered Music Recommendations
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
          Discover Your
          <span className="text-green-500"> Next </span>
          Favourite Song
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10">
          Search a song or pick your mood — our ML engine finds the perfect tracks for you
        </p>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* ── AI Prompt Box ─────────────────────────────── */}
        <div className="mt-4 max-w-2xl mx-auto">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center gap-2 text-gray-500 hover:text-green-400 text-sm mx-auto transition-colors"
          >
            <Bot size={14} />
            {showPrompt ? 'Hide AI prompt' : 'Add AI prompt (optional)'}
          </button>

          {showPrompt && (
            <div className="mt-3 relative">
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Tell the AI what you want... e.g. 'chill and romantic songs for late night'"
                rows={2}
                className="w-full bg-white bg-opacity-5 border border-gray-700 focus:border-green-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
              />
              <span className="absolute bottom-2 right-3 text-gray-600 text-xs">
                {aiPrompt.length}/100
              </span>
            </div>
          )}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {['81,000+ tracks', 'Cosine Similarity ML', 'Spotify Enriched', 'Region Aware'].map(f => (
            <span key={f} className="flex items-center gap-1 text-gray-500 text-xs">
              <Zap size={10} className="text-green-500" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── Mood Selector ─────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pb-10">
        <MoodSelector
          onMoodSelect={handleMoodSelect}
          loading={moodLoading}
        />
      </div>

      {/* ── Divider ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-gray-800" />
      </div>

      {/* ── Results Section ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10 pb-20">

        {(loading || moodLoading) && (
          <LoadingSpinner message={
            activeMode === 'mood'
              ? 'Finding songs for your mood...'
              : 'Searching tracks...'
          } />
        )}

        {!loading && !moodLoading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <Music2 size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tracks found. Try a different search or mood.</p>
          </div>
        )}

        {!loading && !moodLoading && results.length > 0 && (
          <>
            <h2 className="text-white text-xl font-bold mb-6">
              {activeMode === 'mood' ? '🎭 Mood Recommendations' : '🔍 Search Results'}
              <span className="text-gray-500 text-sm font-normal ml-2">
                — click a track to get more like it
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((track, i) => (
                <TrackCard
                  key={i}
                  track={track}
                  onRecommend={handleRecommend}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}