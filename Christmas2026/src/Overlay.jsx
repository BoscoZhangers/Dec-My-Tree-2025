import React, { useState, useRef, useEffect } from 'react'

// Simple AI Moderation Mock
const checkContentSafety = async (text) => {
  // In a real app, fetch your AI API here. 
  // For now, we simulate a delay and a basic check.
  return new Promise((resolve) => {
    setTimeout(() => {
      const badWords = ['bad', 'hate']; // Add real logic
      const isSafe = !badWords.some(word => text.toLowerCase().includes(word));
      resolve(isSafe);
    }, 500);
  });
};

export function Overlay({ isOpen, onClose, onSubmit, initialPos }) {
  const [color, setColor] = useState("#ff0000")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // -- DRAWING LOGIC --
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, 150, 150) // White background
      ctx.lineCap = 'round'
      ctx.lineWidth = 4
    }
  }, [isOpen])

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.strokeStyle = color // Draw with selected color
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  // -- SUBMISSION LOGIC --
  const handleSubmit = async () => {
    if (message.length < 1) {
      alert("Message must be at least 1 character.")
      return
    }

    if (message.length > 50) {
        alert("Message cannot be longer than 50 characters.")
        return
    }

    setIsSubmitting(true)
    
    // 1. Run Moderation
    const isSafe = await checkContentSafety(message)
    if (!isSafe) {
      alert("Message failed moderation.")
      setIsSubmitting(false)
      return
    }

    // 2. Get Drawing Data
    const textureData = canvasRef.current.toDataURL()

    // 3. Submit
    onSubmit({ color, message, textureData })
    setIsSubmitting(false)
    resetForm()
  }

  const resetForm = () => {
    setMessage("")
    setColor("#ff0000")
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 2000000
    }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '15px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ margin: 0, textAlign: 'center' }}>Design Ornament</h3>
        
        {/* Color Picker */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem'}}>1. Base Color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{width: '100%', height: '40px'}} />
        </div>

        {/* Drawing Canvas */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem'}}>2. Draw Pattern</label>
          <canvas 
            ref={canvasRef}
            width={150} height={150}
            style={{ border: '1px solid #ccc', cursor: 'crosshair', margin: '0 auto', display: 'block' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Message Input */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem'}}>3. Secret Character (1 Max)</label>
          <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            maxLength={50} // Strict Limit
            style={{ width: '100%', padding: '8px', fontSize: '1.2rem', textAlign: 'center' }}
            placeholder="?"
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px' }}>Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            style={{ flex: 1, padding: '10px', background: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            {isSubmitting ? 'Verifying...' : 'Hang It!'}
          </button>
        </div>
      </div>
    </div>
  )
}