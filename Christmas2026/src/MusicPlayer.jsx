import React, { useState, useRef, useEffect } from 'react'

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio('/music.mp3')
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio

    const attemptPlay = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true)
          window.removeEventListener('click', attemptPlay)
          window.removeEventListener('keydown', attemptPlay)
        })
        .catch(() => {
          console.log("Browser blocked autoplay. Waiting for user interaction...")
        })
    }

    attemptPlay()
    window.addEventListener('click', attemptPlay, { once: true })
    window.addEventListener('keydown', attemptPlay, { once: true })

    return () => {
      window.removeEventListener('click', attemptPlay)
      window.removeEventListener('keydown', attemptPlay)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const togglePlay = (e) => {
    e.stopPropagation() 
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <>
      <style>{`
        /* --- 1. MOBILE DEFAULT STYLES --- */
        .music-player-btn {
          position: fixed;
          z-index: 9999;
          
          /* Safe area logic for iPhones */
          bottom: calc(env(safe-area-inset-bottom, 20px) + 20px);
          left: calc(env(safe-area-inset-left, 20px) + 20px);
          
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(5px);
          border: 1px solid #333;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-family: sans-serif;
          user-select: none;
          touch-action: manipulation;
          
          /* Small Mobile Sizes */
          border-radius: 30px;
          padding: 12px 20px; 
          transition: transform 0.1s ease;
        }

        .music-player-btn:active {
          transform: scale(0.95);
        }

        .music-icon {
          font-size: 1.2rem;
        }

        .music-text {
          font-size: 0.9rem; 
          font-weight: bold;
        }

        /* --- 2. DESKTOP OVERRIDES --- */
        @media (min-width: 600px) {
          .music-player-btn {
            bottom: 30px;
            left: 30px;
            border-radius: 50px;
            padding: 20px 33px; 
            gap: 12px;
          }

          .music-icon {
            font-size: 1.4rem; 
          }

          .music-text {
            font-size: 1.0rem; /* Restored your large text */
          }
        }

        /* Animation */
        @keyframes bounce {
          0% { height: 3px; }
          100% { height: 15px; }
        }
      `}</style>

      <div 
        className="music-player-btn"
        onClick={togglePlay}
      >
        <span className="music-icon">
          {isPlaying ? '🔊' : '🔇'}
        </span>
        <span className="music-text">
          {isPlaying ? 'Mute' : 'Play Music'}
        </span>
        
        {isPlaying && (
          <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '15px' }}>
            <div style={{ width: '3px', background: '#00ff00', animation: 'bounce 0.5s infinite alternate' }} />
            <div style={{ width: '3px', background: '#ff0000', animation: 'bounce 0.7s infinite alternate' }} />
            <div style={{ width: '3px', background: '#00ff00', animation: 'bounce 0.4s infinite alternate' }} />
          </div>
        )}
      </div>
    </>
  )
}