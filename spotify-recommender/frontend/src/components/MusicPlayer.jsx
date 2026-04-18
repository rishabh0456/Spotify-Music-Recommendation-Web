import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Volume1,
  X, Music
} from 'lucide-react'
import { useState } from 'react'
import { usePlayer } from '../context/PlayerContext'

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    duration,
    currentTime,
    playerType,
    isReady,
    queue,
    togglePlay,
    seek,
    changeVolume,
    closePlayer,
    playNext,
    playPrev,
  } = usePlayer()

  const [prevVolume, setPrevVolume]  = useState(70)
  const [isDragging, setIsDragging] = useState(false)

  if (!currentTrack) return null

  // ── Format seconds → m:ss ─────────────────────────────────
  const formatTime = (sec) => {
    if (!sec || isNaN(sec) || sec < 0) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ── Progress bar click/drag handler ───────────────────────
  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    seek(pct)
  }

  const handleProgressDrag = (e) => {
    if (!isDragging) return
    handleProgressClick(e)
  }

  // ── Volume toggle mute ────────────────────────────────────
  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume)
      changeVolume(0)
    } else {
      changeVolume(prevVolume || 70)
    }
  }

  // ── Volume icon based on level ────────────────────────────
  const VolumeIcon = volume === 0 ? VolumeX : volume < 40 ? Volume1 : Volume2

  const isYouTube = playerType === 'youtube'

  return (
    <>
      {/* ── Main Player Bar ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#181818]/95 backdrop-blur-md border-t border-white/5 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">

        {/* ── Green seekable progress bar on top ───────────── */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 cursor-pointer group"
          onClick={handleProgressClick}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleProgressDrag}
        >
          <div
            className="h-full rounded-r-full transition-all duration-150 bg-green-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          {/* Hover dot */}
          <div
            className="absolute top-1/2 w-3 h-3 rounded-full bg-green-400 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `${Math.min(progress, 100)}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* ── Player content ─────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

          {/* ── Left: Album Art + Track Info ──────────────────── */}
          <div className="flex items-center gap-3 w-72 min-w-0 flex-shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#282828] flex-shrink-0 shadow-lg ring-1 ring-white/5 relative">
              {currentTrack.album_art ? (
                <img
                  src={currentTrack.album_art}
                  alt={currentTrack.track_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#282828] to-[#1a1a1a]">
                  <Music size={20} className="text-gray-600" />
                </div>
              )}
              {/* Tiny playing animation on thumbnail */}
              {isPlaying && (
                <div className="absolute bottom-0.5 left-0.5 flex gap-[2px] items-end">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="w-[2px] rounded-full bg-green-500"
                      style={{
                        height: `${3 + i * 2}px`,
                        animation: `equalizer 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold truncate ${isPlaying ? 'text-green-400' : 'text-white'}`}>
                {currentTrack.track_name}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {currentTrack.artists}
              </p>
            </div>
          </div>

          {/* ── Center: Playback Controls ─────────────────────── */}
          <div className="flex items-center justify-center gap-4 flex-1">

            {/* Prev */}
            <button
              onClick={playPrev}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              disabled={queue.length === 0}
              title="Previous"
            >
              <SkipBack size={18} className="fill-current" />
            </button>

            {/* Play / Pause — main button */}
            <button
              onClick={togglePlay}
              disabled={!isReady && playerType === 'youtube'}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                shadow-lg hover:scale-110 active:scale-95
                ${!isReady && playerType === 'youtube'
                  ? 'bg-gray-600 cursor-wait'
                  : 'bg-white hover:bg-gray-100'
                }
              `}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {!isReady && playerType === 'youtube' ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={18} className="text-black fill-black" />
              ) : (
                <Play size={18} className="text-black fill-black ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={playNext}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              disabled={queue.length === 0}
              title="Next"
            >
              <SkipForward size={18} className="fill-current" />
            </button>
          </div>

          {/* ── Time display ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1 text-gray-500 text-xs tabular-nums font-mono flex-shrink-0 min-w-[80px] justify-center">
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-700">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* ── Right: Source badge + Volume + Close ──────────── */}
          <div className="flex items-center gap-2 w-44 justify-end flex-shrink-0">
            {/* Source badge */}
            <span className="hidden lg:inline-block text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mr-1 bg-green-500/10 text-green-400 border border-green-500/20">
              {isYouTube ? 'YT' : 'Preview'}
            </span>

            {/* Volume button */}
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon size={16} />
            </button>

            {/* Volume slider */}
            <div className="relative group w-20 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={volume}
                onChange={e => changeVolume(parseInt(e.target.value))}
                className="w-full h-1 appearance-none bg-white/10 rounded-full cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:opacity-0
                  [&::-webkit-slider-thumb]:group-hover:opacity-100
                  [&::-webkit-slider-thumb]:transition-opacity
                "
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${volume}%, rgba(255,255,255,0.1) ${volume}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={closePlayer}
              className="text-gray-500 hover:text-white transition-colors flex-shrink-0 ml-1 hover:bg-white/5 rounded-full p-1"
              title="Close player"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Keyframe styles ─────────────────────────────────── */}
      <style>{`
        @keyframes equalizer {
          0% { height: 3px; }
          100% { height: 10px; }
        }
      `}</style>
    </>
  )
}