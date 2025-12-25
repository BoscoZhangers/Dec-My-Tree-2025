import React, { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

// --- CONSTANTS ---
const PALETTE = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', 
  '#0000FF', '#4B0082', '#9400D3', '#FFFFFF', 
  '#000000', '#FF69B4', '#00CED1'
]

// --- 1. THE INTERACTIVE SPHERE ---
function DrawingSphere({ canvasRef, color, tool, brushSize, setOrbitEnabled, clearTrigger }) {
  const meshRef = useRef()
  const textureRef = useRef()
  const [isDrawing, setIsDrawing] = useState(false)
  const lastUV = useRef(null)

  // --- LISTENER: CLEAR CANVAS ---
  useEffect(() => {
    if (clearTrigger > 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 512, 512)
      if (textureRef.current) textureRef.current.needsUpdate = true
    }
  }, [clearTrigger, canvasRef])

  // --- DRAWING LOGIC ---
  const draw = (uv) => {
    if (!canvasRef.current || !uv) return
    const ctx = canvasRef.current.getContext('2d')
    const width = canvasRef.current.width
    const height = canvasRef.current.height

    // --- THE INVERSION FIX ---
    // If the previous version was "completely inverted", we flip both axes here.
    const x = (1 - uv.x) * width
    const y = uv.y * height 

    const drawColor = tool === 'eraser' ? '#FFFFFF' : color
    
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = drawColor
    ctx.lineWidth = brushSize

    if (lastUV.current) {
      // Must calculate Last X/Y using the exact same logic
      const lastX = (1 - lastUV.current.x) * width
      const lastY = lastUV.current.y * height
      
      const dx = Math.abs(x - lastX)
      const dy = Math.abs(y - lastY)

      // --- SEAM PROTECTION ---
      // If we jump across the texture wrap line (e.g. Right edge to Left edge),
      // we STOP drawing to prevent a streak across the entire sphere.
      if (dx < 100 && dy < 100) {
        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else {
        // Just draw a dot if we jumped the seam
        ctx.beginPath()
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = drawColor
        ctx.fill()
      }
    } else {
      ctx.beginPath()
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = drawColor
      ctx.fill()
    }

    lastUV.current = uv
    if (textureRef.current) textureRef.current.needsUpdate = true
  }

  const fillBucket = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 512, 512)
    if (textureRef.current) textureRef.current.needsUpdate = true
  }

  // --- POINTER HANDLERS ---
  const handlePointerDown = (e) => {
    // We strictly use e.uv from the raycaster
    if (!e.uv) return

    e.stopPropagation() 
    setOrbitEnabled(false) 
    e.target.setPointerCapture(e.pointerId)

    if (tool === 'bucket') {
      fillBucket()
    } else {
      setIsDrawing(true)
      lastUV.current = null 
      draw(e.uv) 
    }
  }

  const handlePointerMove = (e) => {
    if (!isDrawing || !e.uv) return
    e.stopPropagation()
    draw(e.uv)
  }

  const handlePointerUp = (e) => {
    e.stopPropagation()
    setIsDrawing(false)
    lastUV.current = null
    e.target.releasePointerCapture(e.pointerId)
    setOrbitEnabled(true) 
  }

  return (
    <mesh 
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      rotation={[0, 0, 0]} 
      scale={[1, 1, 1]}   
    >
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial roughness={0.2} metalness={0.1} side={THREE.FrontSide}>
        <canvasTexture
          ref={textureRef}
          attach="map"
          args={[canvasRef.current]}
          // flipY must be false to align WebGL texture memory with HTML Canvas memory
          flipY={false} 
          minFilter={THREE.NearestFilter} 
          magFilter={THREE.NearestFilter}
        />
      </meshStandardMaterial>
    </mesh>
  )
}


// --- 2. MAIN OVERLAY ---
export function Overlay({ isOpen, onClose, onSubmit }) {
  const [color, setColor] = useState("#FF0000")
  const [tool, setTool] = useState('bucket') 
  const [brushSize, setBrushSize] = useState(15)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orbitEnabled, setOrbitEnabled] = useState(true)
  const [clearTrigger, setClearTrigger] = useState(0)

  const canvasRef = useRef(null)
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    if (isOpen && !canvasRef.current) {
        canvasRef.current = document.createElement('canvas')
    }
    
    if (isOpen && canvasRef.current) {
      canvasRef.current.width = 512
      canvasRef.current.height = 512
      const ctx = canvasRef.current.getContext('2d')
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 512, 512)
      setCanvasReady(true)
    }
  }, [isOpen])

  const selectTool = (t) => {
    setTool(t)
    if (t === 'pen') setBrushSize(4)
    if (t === 'brush') setBrushSize(20)
    if (t === 'eraser') setBrushSize(30)
  }

  const handleSubmit = () => {
    if (message.length < 1 || message.length > 50) {
      alert("Message must be 1-50 chars")
      return
    }
    setIsSubmitting(true)
    const textureData = canvasRef.current.toDataURL()
    onSubmit({ color: '#FFFFFF', message, textureData }) 
    setIsSubmitting(false)
    setMessage("")
  }

  const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

  const overlayStyle = {
    position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
    fontFamily: SYSTEM_FONT 
  }

  const containerStyle = {
    width: '900px', height: '600px', background: '#111', 
    border: '1px solid #333', borderRadius: '20px', display: 'flex', overflow: 'hidden',
    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)'
  }

  const toolButtonStyle = (isActive) => ({
    flex: 1, padding: '15px', cursor: 'pointer',
    background: isActive ? '#333' : '#1a1a1a',
    color: isActive ? 'white' : '#888',
    border: isActive ? '1px solid #555' : '1px solid #222',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem',
    textAlign: 'center', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'inherit' 
  })

  const labelStyle = {
    color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', 
    letterSpacing: '1px', display: 'block', marginBottom: '10px',
    fontFamily: 'inherit' 
  }

  // Helper for Palette Item Style
  const getPaletteItemStyle = (itemColor) => ({
    width: '100%', 
    aspectRatio: '1/1', 
    borderRadius: '50%', 
    background: itemColor,
    cursor: 'pointer', 
    border: color === itemColor ? '3px solid white' : '3px solid #333',
    transform: color === itemColor ? 'scale(1.15)' : 'scale(1)', 
    transition: 'transform 0.2s, border-color 0.2s'
  })

  if (!isOpen) return null

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        
        {/* LEFT PANEL */}
        <div style={{ width: '300px', padding: '30px', background: '#161616', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontFamily: 'inherit' }}> Ornament Studio</h2>

          {/* 1. TOOLS */}
          <div>
            <label style={labelStyle}>Tools</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '8px' }}>
              <button title="Brush" style={toolButtonStyle(tool === 'brush')} onClick={() => selectTool('brush')}>🖌️</button>
              <button title="Pen" style={toolButtonStyle(tool === 'pen')} onClick={() => selectTool('pen')}>✏️</button>
              <button title="Bucket" style={toolButtonStyle(tool === 'bucket')} onClick={() => selectTool('bucket')}>🪣</button>
              <button title="Eraser" style={toolButtonStyle(tool === 'eraser')} onClick={() => selectTool('eraser')}>⌫</button>
              <button 
                title="Clear All" 
                style={{ ...toolButtonStyle(false), color: '#ff4d4d', borderColor: '#442222' }} 
                onClick={() => {
                  if(window.confirm("Clear entire drawing?")) setClearTrigger(t => t + 1)
                }}
              >
                🗑️
              </button>
            </div>
          </div>

          {/* 2. PALETTE */}
          <div>
            <label style={labelStyle}>Palette 🎨</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '15px', 
              width: '85%'
            }}>
              {PALETTE.map(hex => (
                <div 
                  key={hex}
                  onClick={() => setColor(hex)}
                  style={getPaletteItemStyle(hex)} 
                />
              ))}

              <div style={{ 
                width: '100%', aspectRatio: '1/1', 
                position: 'relative', overflow: 'hidden', borderRadius: '50%', 
                background: 'conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red)',
                border: '3px solid #333',
                transform: 'scale(1)', 
                transition: 'transform 0.2s'
              }}>
                <input 
                  type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  style={{ 
                    position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', 
                    cursor: 'pointer', border: 'none', opacity: 0 
                  }} 
                />
              </div>
            </div>
          </div>

          {/* 3. MESSAGE & WARNING */}
          <div style={{ marginTop: '30px' }}>
            <label style={labelStyle}>Message</label>
            <input 
              value={message} onChange={(e) => setMessage(e.target.value)} maxLength={50}
              placeholder="Write a wish..."
              style={{ 
                width: '92%', padding: '12px', background: '#222', border: '1px solid #333', 
                color: 'white', borderRadius: '8px', outline: 'none',
                fontFamily: 'inherit' 
              }}
            />
            <p style={{ color: '#555', fontSize: '0.7rem', marginTop: '10px', fontStyle: 'italic', lineHeight: '1.4' }}>
              ⚠️ Messages are monitored. Inappropriate or harmful content will be removed.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(circle at center, #222, #000)' }}>
          <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
            <span style={{ background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px', color: '#aaa', fontSize: '0.8rem', fontFamily: 'inherit' }}>
              Drag sphere to Paint • Drag background to Rotate
            </span>
          </div>

          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Environment preset="city" />

            <Suspense fallback={null}>
              {canvasReady && (
                <DrawingSphere 
                  canvasRef={canvasRef} 
                  color={color} 
                  tool={tool} 
                  brushSize={brushSize} 
                  setOrbitEnabled={setOrbitEnabled}
                  clearTrigger={clearTrigger}
                />
              )}
            </Suspense>
            
            <OrbitControls 
              makeDefault 
              minDistance={3} 
              maxDistance={8} 
              enabled={orbitEnabled} 
            />
          </Canvas>

          <div style={{ position: 'absolute', bottom: 30, right: 30, display: 'flex', gap: '15px' }}>
            <button onClick={onClose} 
                style={{ background: 'transparent', color: '#888', border: 'none', 
                         cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}>CANCEL</button>
            <button 
              onClick={handleSubmit} disabled={isSubmitting}
              style={{ 
                background: 'white', color: 'black', border: 'none', borderRadius: '50px', 
                padding: '12px 30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                fontFamily: 'inherit'
              }}
            >
              {isSubmitting ? 'HANGING...' : 'HANG IT'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}