import { createContext, useContext, useState, useRef, useEffect } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying,    setIsPlaying]    = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [volume,       setVolume]        = useState(0.7)
  const [duration,     setDuration]      = useState(0)
  const audioRef = useRef(null)

  // ── Load new track ──────────────────────────────────────
  useEffect(() => {
    if (!currentTrack?.preview_url) return

    if (audioRef.current) {
      audioRef.current.pause()
    }

    audioRef.current         = new Audio(currentTrack.preview_url)
    audioRef.current.volume  = volume

    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current.duration)
    })

    audioRef.current.addEventListener('timeupdate', () => {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(pct || 0)
    })

    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false)
      setProgress(0)
    })

    audioRef.current.play()
    setIsPlaying(true)
    setProgress(0)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [currentTrack])

  // ── Play / Pause ────────────────────────────────────────
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // ── Seek ────────────────────────────────────────────────
  const seek = (pct) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = (pct / 100) * audioRef.current.duration
    setProgress(pct)
  }

  // ── Volume ──────────────────────────────────────────────
  const changeVolume = (val) => {
    setVolume(val)
    if (audioRef.current) {
      audioRef.current.volume = val
    }
  }

  // ── Play a track ────────────────────────────────────────
  const playTrack = (track) => {
    if (!track.preview_url) return
    if (currentTrack?.track_name === track.track_name) {
      togglePlay()
    } else {
      setCurrentTrack(track)
    }
  }

  // ── Close player ────────────────────────────────────────
  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setCurrentTrack(null)
    setIsPlaying(false)
    setProgress(0)
  }

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      volume,
      duration,
      playTrack,
      togglePlay,
      seek,
      changeVolume,
      closePlayer,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)