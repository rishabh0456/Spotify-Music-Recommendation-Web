import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'

const PlayerContext = createContext(null)

// ── Load YouTube IFrame API once globally ─────────────────────
let ytAPIReady = false
let ytAPICallbacks = []

function loadYouTubeAPI() {
  if (ytAPIReady) return Promise.resolve()
  if (window.YT && window.YT.Player) {
    ytAPIReady = true
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    ytAPICallbacks.push(resolve)

    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'youtube-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)

      window.onYouTubeIframeAPIReady = () => {
        ytAPIReady = true
        ytAPICallbacks.forEach(cb => cb())
        ytAPICallbacks = []
      }
    }
  })
}

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying,    setIsPlaying]    = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [volume,       setVolume]       = useState(70)    // 0-100 for YouTube
  const [duration,     setDuration]     = useState(0)
  const [currentTime,  setCurrentTime]  = useState(0)
  const [playerType,   setPlayerType]   = useState(null)  // 'audio' | 'youtube'
  const [isReady,      setIsReady]      = useState(false)
  const [queue,        setQueue]        = useState([])     // track queue
  const [queueIndex,   setQueueIndex]   = useState(-1)

  const audioRef    = useRef(null)
  const ytPlayerRef = useRef(null)
  const timerRef    = useRef(null)
  const containerRef = useRef(null)  // for YT player DOM node

  // ── Cleanup helper ──────────────────────────────────────────
  const stopAll = useCallback(() => {
    // Stop progress timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    // Stop HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    // Stop YouTube player
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.stopVideo()
        ytPlayerRef.current.destroy()
      } catch (e) { /* ignore */ }
      ytPlayerRef.current = null
    }
    setIsReady(false)
  }, [])

  // ── YouTube progress ticker ─────────────────────────────────
  const startYTTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        const ct = ytPlayerRef.current.getCurrentTime() || 0
        const dur = ytPlayerRef.current.getDuration() || 0
        setCurrentTime(ct)
        setDuration(dur)
        if (dur > 0) {
          setProgress((ct / dur) * 100)
        }
      }
    }, 500)
  }, [])

  // ── Load a new track ────────────────────────────────────────
  useEffect(() => {
    if (!currentTrack) return

    stopAll()
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)

    if (currentTrack.preview_url) {
      // ── Spotify 30s audio preview ──
      setPlayerType('audio')
      const audio = new Audio(currentTrack.preview_url)
      audio.volume = volume / 100
      audioRef.current = audio

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration)
        setIsReady(true)
      })
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
        if (audio.duration > 0) {
          setProgress((audio.currentTime / audio.duration) * 100)
        }
      })
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setProgress(100)
        // Auto-play next in queue
        playNext()
      })

      audio.play().then(() => setIsPlaying(true)).catch(() => {})

    } else if (currentTrack.youtube_id) {
      // ── YouTube full song playback via IFrame API ──
      setPlayerType('youtube')

      loadYouTubeAPI().then(() => {
        // Create a hidden container if not existing
        let container = document.getElementById('yt-player-hidden')
        if (!container) {
          container = document.createElement('div')
          container.id = 'yt-player-hidden'
          container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;'
          document.body.appendChild(container)
        }

        // Clear previous content
        container.innerHTML = '<div id="yt-player-target"></div>'

        ytPlayerRef.current = new window.YT.Player('yt-player-target', {
          height: '1',
          width: '1',
          videoId: currentTrack.youtube_id,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(volume)
              setIsReady(true)
              setIsPlaying(true)
              // Slight delay to let duration populate
              setTimeout(() => {
                const dur = event.target.getDuration() || 0
                setDuration(dur)
              }, 1000)
              startYTTimer()
            },
            onStateChange: (event) => {
              const state = event.data
              if (state === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
                const dur = event.target.getDuration() || 0
                if (dur > 0) setDuration(dur)
              } else if (state === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
              } else if (state === window.YT.PlayerState.ENDED) {
                setIsPlaying(false)
                setProgress(100)
                playNext()
              }
            },
            onError: () => {
              console.warn('YouTube player error')
              setIsReady(false)
            }
          }
        })
      })
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack])

  // ── Toggle Play/Pause ───────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (playerType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {})
      }
      setIsPlaying(!isPlaying)

    } else if (playerType === 'youtube' && ytPlayerRef.current) {
      try {
        if (isPlaying) {
          ytPlayerRef.current.pauseVideo()
        } else {
          ytPlayerRef.current.playVideo()
        }
        setIsPlaying(!isPlaying)
      } catch (e) { /* ignore */ }
    }
  }, [playerType, isPlaying])

  // ── Seek ────────────────────────────────────────────────────
  const seek = useCallback((pct) => {
    if (playerType === 'audio' && audioRef.current) {
      audioRef.current.currentTime = (pct / 100) * audioRef.current.duration
      setProgress(pct)

    } else if (playerType === 'youtube' && ytPlayerRef.current) {
      try {
        const dur = ytPlayerRef.current.getDuration() || 0
        ytPlayerRef.current.seekTo((pct / 100) * dur, true)
        setProgress(pct)
      } catch (e) { /* ignore */ }
    }
  }, [playerType])

  // ── Volume ──────────────────────────────────────────────────
  const changeVolume = useCallback((val) => {
    // val is 0-100
    setVolume(val)
    if (playerType === 'audio' && audioRef.current) {
      audioRef.current.volume = val / 100
    } else if (playerType === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(val)
      } catch (e) { /* ignore */ }
    }
  }, [playerType])

  // ── Play a track ────────────────────────────────────────────
  const playTrack = useCallback((track, trackList = null) => {
    if (!track.preview_url && !track.youtube_id) return

    // If same track, just toggle play/pause
    if (currentTrack?.track_name === track.track_name &&
        currentTrack?.artists === track.artists) {
      togglePlay()
      return
    }

    // Set queue if provided
    if (trackList && trackList.length > 0) {
      setQueue(trackList)
      const idx = trackList.findIndex(
        t => t.track_name === track.track_name && t.artists === track.artists
      )
      setQueueIndex(idx >= 0 ? idx : 0)
    }

    setCurrentTrack({ ...track })
  }, [currentTrack, togglePlay])

  // ── Next / Previous ─────────────────────────────────────────
  const playNext = useCallback(() => {
    if (queue.length === 0) return
    const nextIdx = (queueIndex + 1) % queue.length
    setQueueIndex(nextIdx)
    setCurrentTrack({ ...queue[nextIdx] })
  }, [queue, queueIndex])

  const playPrev = useCallback(() => {
    if (queue.length === 0) return
    // If more than 3s into song, restart. Otherwise, go to previous.
    if (currentTime > 3) {
      seek(0)
      return
    }
    const prevIdx = queueIndex <= 0 ? queue.length - 1 : queueIndex - 1
    setQueueIndex(prevIdx)
    setCurrentTrack({ ...queue[prevIdx] })
  }, [queue, queueIndex, currentTime, seek])

  // ── Close player ────────────────────────────────────────────
  const closePlayer = useCallback(() => {
    stopAll()
    setCurrentTrack(null)
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    setPlayerType(null)
    setQueue([])
    setQueueIndex(-1)
  }, [stopAll])

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      volume,
      duration,
      currentTime,
      playerType,
      isReady,
      queue,
      queueIndex,
      playTrack,
      togglePlay,
      seek,
      changeVolume,
      closePlayer,
      playNext,
      playPrev,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)