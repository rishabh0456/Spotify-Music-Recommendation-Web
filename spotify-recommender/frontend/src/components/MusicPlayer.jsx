import React from 'react'
import { Play, Pause, X, Volume2, Music, ExternalLink, Activity } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    duration,
    togglePlay,
    seek,
    changeVolume,
    closePlayer,
  } = usePlayer()

  if (!currentTrack) return null

  // Format seconds to mm:ss
  const formatTime = (sec) => {
    if (!sec) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const currentTime = (progress / 100) * duration

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#181818] border-t border-gray-800 px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* ── 1. Album Art + Info ─────────────────────────── */}
        <div className="flex items-center gap-3 w-72 min-w-0">
          <div className="w-14 h-14 rounded-md overflow-hidden bg-[#282828] flex-shrink-0 shadow-lg">
            {currentTrack.album_art ? (
              <img
                src={currentTrack.album_art}
                alt={currentTrack.track_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music size={24} className="text-gray-600" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate hover:underline cursor-pointer">
              {currentTrack.track_name}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {currentTrack.artists}
            </p>
            {/* Added: AI Mood Insight (The "Unique" Touch) */}
            <div className="flex items-center gap-1 mt-1 text-[10px] text-green-500 font-medium uppercase tracking-wider">
               <Activity size={10} />
               <span>High Energy Mix</span>
            </div>
          </div>
          
          {currentTrack.spotify_url && (
            <a 
              href={currentTrack.spotify_url}
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-[#1DB954] transition-colors p-1"
              title="Open in Spotify"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* ── 2. Center Controls + Progress ──────────────────────── */}
        <div className="flex-1 max-w-2xl flex flex-col items-center gap-2">
          {/* Main Play Button */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md"
          >
            {isPlaying
              ? <Pause size={18} className="text-black fill-black" />
              : <Play  size={18} className="text-black fill-black ml-1" />
            }
          </button>

          {/* Progress Bar Container */}
          <div className="w-full flex items-center gap-3">
            <span className="text-gray-500 text-[10px] w-10 text-right font-mono">
              {formatTime(currentTime)}
            </span>
            
            <div
              className="flex-1 bg-gray-700 rounded-full h-1.5 cursor-pointer group relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pct  = ((e.clientX - rect.left) / rect.width) * 100
                seek(pct)
              }}
            >
              {/* Progress Level */}
              <div
                className="bg-green-500 h-full rounded-full relative group-hover:bg-green-400 transition-colors"
                style={{ width: `${progress}%` }}
              >
                {/* Visual Handle (Dot) */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md border border-gray-300" />
              </div>
            </div>

            <span className="text-gray-500 text-[10px] w-10 font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ── 3. Volume + Utility ───────────────────────────── */}
        <div className="flex items-center gap-4 w-72 justify-end">
          <div className="flex items-center gap-2 group">
            <Volume2 size={18} className="text-gray-400 group-hover:text-white transition-colors" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={e => changeVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
            />
          </div>
          
          <button
            onClick={closePlayer}
            className="p-1 rounded-full hover:bg-gray-800 text-gray-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

      </div>

      {/* Floating Preview Badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter shadow-lg border border-[#181818]">
        30s AI Preview
      </div>
    </div>
  )
}