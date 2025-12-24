import React, { useState, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Billboard, Line } from '@react-three/drei'
import * as THREE from 'three'

// --- 1. TEXTURE GENERATOR (Soft Gradient) ---
function createGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
  
  // White center -> Transparent edge
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)') 
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)') // Soft falloff
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

// --- 2. SINGLE RIPPLE COMPONENT ---
// Represents one ring of light moving outwards
function GlowRipple({ texture, color, offset, speed = 0.8, size }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return

    // 1. Calculate continuous loop from 0 to 1
    // Adding 'offset' ensures this ripple is at a different stage than the others
    const t = (clock.getElapsedTime() * speed + offset) % 1

    // 2. Scale: Start at 1x size, grow to 4x size
    const currentScale = size * (1 + t * 3)
    ref.current.scale.set(currentScale, currentScale, currentScale)

    // 3. Opacity: Start visible, fade to 0 as it expands
    // (1 - t) makes it linear. Math.pow helps smooth the fade.
    ref.current.material.opacity = 0.8 * (1 - Math.pow(t, 2))
  })

  return (
    <mesh ref={ref} position={[0, 0, -0.1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        map={texture} 
        color={color} 
        transparent 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// --- 3. MAIN STAR COMPONENT ---
function NeonStar({ size = 1, position = [0, 0, 0] }) {
  // Use the soft texture for the ripples
  const glowTexture = useMemo(() => createGlowTexture(), [])
  
  // Shape logic for the star border
  const { shape, points } = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 1)
    for (let i = 1; i < 10; i++) {
      const angle = (i * Math.PI) / 5
      const radius = i % 2 === 0 ? 1 : 0.5
      s.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius)
    }
    s.closePath()
    const p = s.getPoints().map(v => [v.x, v.y, 0])
    return { shape: s, points: p }
  }, [])

  return (
    <Billboard position={position}>
      <group scale={[size, size, size]}>
        
        {/* --- RADIATING ATMOSPHERE --- */}
        {/* We spawn 3 ripples with different offsets (0.0, 0.33, 0.66) 
            so there is always one expanding while another starts. */}
        <group>
            <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.0} />
            <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.33} />
            <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.66} />
        </group>

        {/* --- STATIC CORE GLOW --- */}
        {/* A permanent glow in the center so it's never dark */}
        <mesh position={[0,0,-0.05]} scale={[1.5, 1.5, 1.5]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial 
                map={glowTexture} 
                color="#FFFF00" 
                transparent 
                opacity={0.5}
                blending={THREE.AdditiveBlending} 
                depthWrite={false}
            />
        </mesh>

        {/* --- STAR SHAPE (Fill & Border) --- */}
        {/* Semi-transparent fill */}
        <mesh>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial 
            color="#FFFF00" 
            transparent 
            opacity={0.1} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Bright Neon Border */}
        <Line points={points} color="#FFFF00" lineWidth={5} closed transparent opacity={1} />

      </group>
    </Billboard>
  )
}

export function Tree(props) {
  const { scene } = useGLTF('/tree.glb')
  const [lastClick, setLastClick] = useState(null)

  return (
    <group {...props} dispose={null}>
      
      <NeonStar size={7} position={[0, 225, 0]} />

      <primitive 
        object={scene} 
        onClick={(e) => {
          e.stopPropagation() 
          console.log("Clicked at:", e.point)
          setLastClick(e.point)
        }}
      />
      
      {lastClick && (
        <mesh position={[lastClick.x, lastClick.y, lastClick.z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  )
}

useGLTF.preload('/tree.glb')