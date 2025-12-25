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

// --- 1. THE INTERACTIVE SPHERE (No Changes) ---
function DrawingSphere({ canvasRef, color, tool, brushSize, setOrbitEnabled, clearTrigger }) {
  const meshRef = useRef()
  const textureRef = useRef()
  const [isDrawing, setIsDrawing] = useState(false)
  const lastUV = useRef(null)

  useEffect(() => {
    if (clearTrigger > 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 512, 512)
      if (textureRef.current) textureRef.current.needsUpdate = true
    }
  }, [clearTrigger, canvasRef])

  const draw = (uv) => {
    if (!canvasRef.current || !uv) return
    const ctx = canvasRef.current.getContext('2d')
    const width = canvasRef.current.width
    const height = canvasRef.current.height

    const x = (1 - uv.x) * width
    const y = uv.y * height 

    const drawColor = tool === 'eraser' ? '#FFFFFF' : color
    
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = drawColor
    ctx.lineWidth = brushSize

    if (lastUV.current) {
      const lastX = (1 - lastUV.current.x) * width
      const lastY = lastUV.current.y * height
      const dx = Math.abs(x - lastX)
      const dy = Math.abs(y - lastY)

      if (dx < 100 && dy < 100) {
        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else {
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

  const handlePointerDown = (e) => {
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
  
  // DETECT MOBILE
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 800)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // --- STYLES HELPER ---
  const toolButtonStyle = (isActive) => ({
    flex: 1, padding: '15px', cursor: 'pointer',
    background: isActive ? '#333' : '#1a1a1a',
    color: isActive ? 'white' : '#888',
    border: isActive ? '1px solid #555' : '1px solid #222',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem',
    textAlign: 'center', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'inherit',
    minWidth: '40px'
  })

  const labelStyle = {
    color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', 
    letterSpacing: '1px', display: 'block', marginBottom: '10px',
    fontFamily: 'inherit' 
  }

  const getPaletteItemStyle = (itemColor) => ({
    width: '100%', aspectRatio: '1/1', borderRadius: '50%', 
    background: itemColor, cursor: 'pointer', 
    border: color === itemColor ? '3px solid white' : '3px solid #333',
    transform: color === itemColor ? 'scale(1.15)' : 'scale(1)', 
    transition: 'transform 0.2s, border-color 0.2s'
  })

  if (!isOpen) return null

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
      fontFamily: SYSTEM_FONT
    }}>
      
      <style>{`
        .overlay-container {
          width: 900px;
          height: 600px;
          display: flex;
          flex-direction: row;
          background: #111;
          border: 1px solid #333;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8);
        }
        .left-panel {
          width: 300px;
          padding: 30px;
          background: #161616;
          border-right: 1px solid #333;
          display: flex;
          flex-direction: column;
          gap: 25px;
          overflow-y: auto;
          
          /* HIDE SCROLLBAR UI */
          scrollbar-width: none;  /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
        }
        /* HIDE SCROLLBAR UI (Chrome, Safari) */
        .left-panel::-webkit-scrollbar {
          display: none;
        }

        .right-panel {
          flex: 1;
          position: relative;
          background: radial-gradient(circle at center, #222, #000);
          touch-action: none; 
        }

        /* MOBILE OVERRIDES */
        @media (max-width: 800px) {
          .overlay-container {
            width: 95vw !important;
            height: 90vh !important;
            flex-direction: column-reverse !important; 
          }
          .left-panel {
            /* 90% Width and centered */
            width: 90% !important;
            align-self: center !important;
            border-radius: 20px 20px 0 0 !important;
            
            height: 50% !important;
            border-right: none !important;
            border-top: 1px solid #333;
            padding: 20px !important;
            gap: 15px !important;
          }
          .right-panel {
            height: 50% !important;
          }
        }
      `}</style>

      <div className="overlay-container">
        
        {/* LEFT PANEL (TOOLS) */}
        <div className="left-panel">
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontFamily: 'inherit' }}> Ornament Studio</h2>

          {/* TOOLS */}
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
                onClick={() => { if(window.confirm("Clear entire drawing?")) setClearTrigger(t => t + 1) }}
              >
                🗑️
              </button>
            </div>
          </div>

          {/* PALETTE */}
          <div>
            <label style={labelStyle}>Palette 🎨</label>
            <div style={{ 
              display: 'grid', 
              /* Desktop: 4 cols. Mobile: 6 cols. */
              gridTemplateColumns: isMobile ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)', 
              /* Desktop Gap: 15px (Reduced from 20). Mobile Gap: 10px */
              gap: isMobile ? '10px' : '15px',
              width: isMobile ? '100%' : '90%'
            }}>
              {PALETTE.map(hex => (
                <div key={hex} onClick={() => setColor(hex)} style={getPaletteItemStyle(hex)} />
              ))}
              {/* Custom Color Picker */}
              <div style={{ 
                width: '100%', aspectRatio: '1/1', position: 'relative', overflow: 'hidden', borderRadius: '50%', 
                background: 'conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red)',
                border: '3px solid #333', transform: 'scale(1)' 
              }}>
                <input 
                  type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', cursor: 'pointer', opacity: 0 }} 
                />
              </div>
            </div>
          </div>

          {/* MESSAGE */}
          <div style={{ marginTop: 'auto' }}>
            <label style={labelStyle}>Message</label>
            <input 
              value={message} onChange={(e) => setMessage(e.target.value)} maxLength={50}
              placeholder="Write a wish..."
              style={{ 
                width: '100%', padding: '12px', background: '#222', border: '1px solid #333', 
                color: 'white', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
              }}
            />
             <p style={{ color: '#555', fontSize: '0.7rem', marginTop: '10px', fontStyle: 'italic', lineHeight: '1.4' }}>
                ⚠️ Messages are monitored. Inappropriate or harmful content will be removed.
             </p>
          </div>

          {/* SUBMIT BUTTONS */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
             <button onClick={onClose} 
                style={{ flex: 1, background: '#333', color: '#ccc', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                CANCEL
             </button>
             <button onClick={handleSubmit} disabled={isSubmitting}
                style={{ flex: 2, background: 'white', color: 'black', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'HANGING...' : 'HANG IT'}
             </button>
          </div>
        </div>

        {/* RIGHT PANEL (3D) */}
        <div className="right-panel">
          <div style={{ position: 'absolute', top: 10, width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
            <span style={{ background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px', color: '#aaa', fontSize: '0.7rem', fontFamily: 'inherit' }}>
              Drag Sphere to Paint • Drag Background to Rotate
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
            
            <OrbitControls makeDefault minDistance={3} maxDistance={8} enabled={orbitEnabled} />
          </Canvas>
        </div>

      </div>
    </div>
  )
}