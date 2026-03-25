import { createContext, useContext, useState, useRef, useEffect } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying,    setIsPlaying]    = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [volume,       setVolume]        = useState(0.7)
  const [duration,     setDuration]      = useState(0)
  const [playerType,   setPlayerType]    = useState(null) // 'audio' | 'youtube'
  const audioRef  = useRef(null)

  // ── Load new track ──────────────────────────────────────
  useEffect(() => {
    if (!currentTrack) return

    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (currentTrack.preview_url) {
      // ── Spotify audio preview ──
      setPlayerType('audio')
      audioRef.current        = new Audio(currentTrack.preview_url)
      audioRef.current.volume = volume

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration)
      })
      audioRef.current.addEventListener('timeupdate', () => {
        const pct = (audioRef.current.currentTime /
                     audioRef.current.duration) * 100
        setProgress(pct || 0)
      })
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        setProgress(0)
      })
      audioRef.current.play()
      setIsPlaying(true)
      setProgress(0)

    } else if (currentTrack.youtube_id) {
    // YouTube — fake progress timer
    setPlayerType('youtube')
    setIsPlaying(true)
    setProgress(0)
    setDuration(210) // average song ~3.5 min
  
    // Start fake progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsPlaying(false)
          return 100
        }
        return prev + (100 / 210) // increment per second
      })
    }, 1000)
  
    return () => {
      clearInterval(interval)
      if (audioRef.current) audioRef.current.pause()
    }}
  }, [currentTrack])

  const togglePlay = () => {
    if (playerType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (playerType === 'youtube') {
      // YouTube iframe handles its own play/pause
      setIsPlaying(!isPlaying)
    }
  }

  const seek = (pct) => {
    if (playerType === 'audio' && audioRef.current) {
      audioRef.current.currentTime =
        (pct / 100) * audioRef.current.duration
      setProgress(pct)
    }
  }

  const changeVolume = (val) => {
    setVolume(val)
    if (audioRef.current) {
      audioRef.current.volume = val
    }
  }

  const playTrack = (track) => {
    if (!track.preview_url && !track.youtube_id) return
    if (currentTrack?.track_name === track.track_name) {
      togglePlay()
    } else {
      setCurrentTrack(track)
    }
  }

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setCurrentTrack(null)
    setIsPlaying(false)
    setProgress(0)
    setPlayerType(null)
  }

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      volume,
      duration,
      playerType,
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