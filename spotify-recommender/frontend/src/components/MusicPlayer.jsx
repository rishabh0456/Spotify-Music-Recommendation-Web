import { Play, Pause, X, Volume2, Music, ExternalLink } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { usePlayer } from '../context/PlayerContext'

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    duration,
    playerType,
    togglePlay,
    seek,
    changeVolume,
    closePlayer,
  } = usePlayer()

  const iframeRef = useRef(null)

  if (!currentTrack) return null

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // NaN check to prevent UI crashes
  const safeDuration = duration || 0
  const currentTime = (progress / 100) * safeDuration

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#181818] border-t border-gray-800 shadow-2xl">

      {/* ── Hidden YouTube Audio Player ──────────────────── */}
      {playerType === 'youtube' && currentTrack.youtube_id && (
        <div
          style={{
            position:    'absolute',
            width:       '1px',
            height:      '1px',
            opacity:     0,
            pointerEvents: 'none',
            overflow:    'hidden',
          }}
        >
          <iframe
            ref={iframeRef}
            width="1"
            height="1"
            src={`https://www.youtube.com/embed/${currentTrack.youtube_id}?autoplay=1&controls=0&enablejsapi=1`}
            allow="autoplay"
            title="audio-player"
          />
        </div>
      )}

      {/* ── Main Player Bar ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

        {/* ── Left: Album Art + Track Info ─────────────────── */}
        <div className="flex items-center gap-3 w-64 min-w-0 flex-shrink-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#282828] flex-shrink-0 shadow">
            {currentTrack.album_art ? (
              <img
                src={currentTrack.album_art}
                alt={currentTrack.track_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music size={20} className="text-gray-600" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">
              {currentTrack.track_name}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {currentTrack.artists}
            </p>
          </div>
          {currentTrack.spotify_url && (
            /* FIX: Added missing opening <a tag */
            <a 
              href={currentTrack.spotify_url}
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:text-green-500 transition-colors flex-shrink-0"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* ── Center: Play Controls + Progress ─────────────── */}
        <div className="flex-1 flex flex-col items-center gap-2">

          {/* Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 bg-white hover:bg-gray-200 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow"
          >
            {isPlaying
              ? <Pause size={16} className="text-black fill-black" />
              : <Play  size={16} className="text-black fill-black ml-0.5" />
            }
          </button>

          {/* Progress Bar + Time — only for audio */}
          {playerType === 'audio' && (
            <div className="w-full flex items-center gap-2">
              <span className="text-gray-500 text-xs w-8 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 bg-gray-700 rounded-full h-1 cursor-pointer group relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  seek(((e.clientX - rect.left) / rect.width) * 100)
                }}
              >
                <div
                  className="bg-green-500 group-hover:bg-green-400 h-1 rounded-full transition-all relative"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                </div>
              </div>
              <span className="text-gray-500 text-xs w-8 tabular-nums">
                {formatTime(safeDuration)}
              </span>
            </div>
          )}

          {/* YouTube mode — simple progress bar (No Seek for YouTube embed) */}
          {playerType === 'youtube' && (
            <div className="w-full flex items-center gap-2">
              <span className="text-gray-600 text-xs">0:00</span>
              <div className="flex-1 bg-gray-800 rounded-full h-1">
                <div
                  className="bg-red-500 h-1 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-gray-600 text-xs">∞</span>
            </div>
          )}
        </div>

        {/* ── Right: Volume + Close ─────────────────────────── */}
        <div className="flex items-center gap-3 w-44 justify-end flex-shrink-0">
          <Volume2 size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={e => changeVolume(parseFloat(e.target.value))}
            className="w-20 accent-green-500 cursor-pointer"
          />
          <button
            onClick={closePlayer}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0 ml-1"
          >
            <X size={18} />
          </button>
        </div>

      </div>

      {/* Source badge */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2">
        <span className="text-gray-700 text-[10px] uppercase tracking-wider">
          {playerType === 'youtube' ? '▶ YouTube Audio' : '♪ 30s Preview'}
        </span>
      </div>

    </div>
  )
}