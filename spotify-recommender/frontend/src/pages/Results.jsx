import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Music2 } from 'lucide-react'
import TrackCard from '../components/TrackCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getRecommendations } from '../api'
import toast from 'react-hot-toast'

export default function Results() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { track, artist, prompt } = location.state || {}

  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)

  const fetchRecommendations = async () => {
    if (!track) {
      navigate('/')
      return
    }
    setLoading(true)
    setError(null)
    setRecommendations([])
    try {
      const data = await getRecommendations(track, artist, 10, prompt)
      setRecommendations(data.recommendations || [])
      if ((data.recommendations || []).length === 0) {
        toast.error('No recommendations found for this track.')
      } else {
        toast.success(`Found ${data.recommendations.length} recommendations!`)
      }
    } catch (err) {
      const msg = err.message || 'Failed to fetch recommendations.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [track, artist])

  const handleRecommend = (newTrack) => {
    navigate('/results', {
      state: {
        track:  newTrack.track_name,
        artist: newTrack.artists
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#121212] pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </button>

          {!loading && (
            <button
              onClick={fetchRecommendations}
              className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors ml-auto text-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          )}
        </div>

        {/* Title */}
        {track && (
          <div className="mb-10 border-l-4 border-green-500 pl-6">
            <p className="text-gray-500 text-xs mb-1 uppercase tracking-widest">
              Because you searched
            </p>
            <h1 className="text-white text-4xl font-black">{track}</h1>
            {artist && (
              <p className="text-green-400 text-base mt-1 font-medium">{artist}</p>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <LoadingSpinner message="Finding songs you'll love..." />
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-16">
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-12 h-12 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music2 size={24} className="text-red-400" />
              </div>
              <p className="text-red-400 font-semibold mb-2">Something went wrong</p>
              <p className="text-gray-500 text-sm mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={fetchRecommendations}
                  className="bg-white text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-transparent border border-gray-600 text-gray-400 font-bold px-6 py-2 rounded-full text-sm hover:border-gray-400 transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations grid */}
        {!loading && !error && recommendations.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">
                Recommended Tracks
                <span className="text-gray-500 text-sm font-normal ml-2">
                  {recommendations.length} songs found
                </span>
              </h2>
              <span className="text-gray-600 text-xs">
                Click any track for more like it
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map((track, i) => (
                <TrackCard
                  key={i}
                  track={track}
                  onRecommend={handleRecommend}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="text-center py-16">
            <Music2 size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No recommendations found.</p>
            <p className="text-gray-600 text-sm mb-6">Try searching for a different track.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-full transition-colors"
            >
              Search Again
            </button>
          </div>
        )}

      </div>
    </div>
  )
}