import { Play, Pause, ExternalLink, Music } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export default function TrackCard({ track, onRecommend, isInput = false }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer()

  const isCurrentTrack = currentTrack?.track_name === track.track_name
  const isThisPlaying  = isCurrentTrack && isPlaying

  // YAHAN FIX KIYA HAI: ab dono check honge (preview_url ya youtube_id)
  const canPlay = track.preview_url || track.youtube_id

  const handlePlay = (e) => {
    e.stopPropagation()
    if (!canPlay) return // Agar dono nahi hain tabhi rukega
    playTrack(track)
  }

  return (
    <div
      className={`group relative bg-[#181818] hover:bg-[#282828] rounded-xl p-4 transition-all duration-300 cursor-pointer
        ${isInput        ? 'border border-green-500 border-opacity-50' : ''}
        ${isCurrentTrack ? 'ring-1 ring-green-500 ring-opacity-50'     : ''}
      `}
    >
      {/* Album Art */}
      <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-[#282828]">
        {track.album_art ? (
          <img
            src={track.album_art}
            alt={track.track_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={40} className="text-gray-600" />
          </div>
        )}

        {/* Play overlay - YAHAN FIX KIYA HAI */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
          <button
            onClick={handlePlay}
            className={`
              bg-green-500 hover:bg-green-400 rounded-full p-3
              transform transition-all shadow-xl
              ${isThisPlaying
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
              }
              ${!canPlay ? 'opacity-30 cursor-not-allowed' : ''}
            `}
            title={canPlay ? 'Play preview' : 'No preview available'}
          >
            {isThisPlaying
              ? <Pause size={18} className="text-black fill-black" />
              : <Play  size={18} className="text-black fill-black" />
            }
          </button>
        </div>

        {/* Now playing indicator */}
        {isCurrentTrack && (
          <div className="absolute bottom-2 left-2 flex gap-0.5 items-end">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-0.5 bg-green-500 rounded-full animate-pulse"
                style={{
                  height:           `${6 + i * 3}px`,
                  animationDelay:   `${i * 0.15}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        )}

        {isInput && (
          <div className="absolute top-2 left-2 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg">
            Seed Song
          </div>
        )}
      </div>

      {/* Track Info */}
      <div onClick={() => onRecommend && onRecommend(track)}>
        <h3 className={`font-bold text-sm truncate mb-0.5 ${isCurrentTrack ? 'text-green-400' : 'text-white'}`}>
          {track.track_name}
        </h3>
        <p className="text-gray-400 text-xs truncate mb-3">
          {track.artists}
        </p>

        {/* Audio feature bars */}
        <div className="space-y-2 mb-3">
          {track.energy !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-[10px] w-8 uppercase">Energy</span>
              <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${track.energy * 100}%` }}
                />
              </div>
            </div>
          )}
          {track.danceability !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-[10px] w-8 uppercase">Vibe</span>
              <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${track.danceability * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Similarity score */}
        {track.similarity !== undefined && (
          <div className="flex items-center justify-between mb-2 bg-green-500 bg-opacity-5 p-1.5 rounded-lg border border-green-500 border-opacity-10">
            <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">AI Match</span>
            <span className="text-green-500 text-xs font-bold font-mono">
              {track.similarity}%
            </span>
          </div>
        )}

        {/* Genre tag */}
        {track.genre && track.genre !== 'Unknown' && (
          <span className="inline-block bg-white bg-opacity-5 border border-white border-opacity-10 text-gray-400 text-[10px] px-2 py-0.5 rounded-md">
            {track.genre}
          </span>
        )}
      </div>

      {/* Spotify external link */}
      {track.spotify_url && (
        <a 
          href={track.spotify_url}
          target="_blank"
          rel="noreferrer"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#1DB954] transition-all bg-[#181818] p-1.5 rounded-full shadow-lg"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  )
}