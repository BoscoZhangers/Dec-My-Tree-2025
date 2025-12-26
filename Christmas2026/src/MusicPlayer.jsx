import React, { useState, useRef, useEffect } from 'react'

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/music.mp3') 
      audioRef.current.loop = true
      audioRef.current.volume = 0.4
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(error => {
        console.error("Playback failed:", error)
        alert("Audio error: Check that music.mp3 is in the public folder!")
      })
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div 
      onClick={togglePlay}
      style={{
        /* --- MOBILE POSITIONING FIXES --- */
        position: 'fixed', 
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 30px)', 
        left: 'calc(env(safe-area-inset-left, 0px) + 20px)',
        zIndex: 9999,
        
        /* --- RESTORED ORIGINAL STYLING --- */
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)',
        border: '1px solid #333',
        borderRadius: '50px',
        padding: '10px 15px',
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
      <span style={{ fontSize: '1.2rem' }}>
        {isPlaying ? '🔊' : '🔇'}
      </span>
      <span style={{ fontWeight: 'bold' }}>
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