import React, { useState, useRef, useEffect } from 'react'

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    // 1. Setup Audio
    const audio = new Audio('/music.mp3')
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio

    // 2. Define the play function
    const attemptPlay = () => {
      audio.play()
        .then(() => {
          // If successful (browser allowed it), update state
          setIsPlaying(true)
          // Clean up the "waiting for click" listeners
          window.removeEventListener('click', attemptPlay)
          window.removeEventListener('keydown', attemptPlay)
        })
        .catch((error) => {
          // If blocked, we just stay silent and wait for the next click
          console.log("Browser blocked autoplay. Waiting for user interaction...")
        })
    }

    // 3. Try to play immediately (Works if user has already interacted with domain)
    attemptPlay()

    // 4. If that failed, try again on the very first click or keypress anywhere
    window.addEventListener('click', attemptPlay, { once: true })
    window.addEventListener('keydown', attemptPlay, { once: true })

    // Cleanup
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
    // Stop the click from propagating to the global listener
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
    <div 
      onClick={togglePlay}
      style={{
        position: 'fixed', 
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 30px)', 
        left: 'calc(env(safe-area-inset-left, 0px) + 30px)',
        zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)',
        border: '1px solid #333',
        borderRadius: '60px',
        padding: '20px 25px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'white',
        fontSize: '0.9rem',
        fontFamily: 'sans-serif',
        userSelect: 'none',
        touchAction: 'manipulation',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      }}
    >
      <span style={{ fontSize: '1.7rem' }}>
        {isPlaying ? '🔊' : '🔇'}
      </span>
      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        {isPlaying ? 'Mute' : 'Play Music'}
      </span>
      
      {isPlaying && (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '15px' }}>
          <div className="bar" style={{ width: '3px', background: '#00ff00', animation: 'bounce 0.5s infinite alternate' }} />
          <div className="bar" style={{ width: '3px', background: '#ff0000', animation: 'bounce 0.7s infinite alternate' }} />
          <div className="bar" style={{ width: '3px', background: '#00ff00', animation: 'bounce 0.4s infinite alternate' }} />
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0% { height: 3px; }
          100% { height: 15px; }
        }
      `}</style>
    </div>
  )
}