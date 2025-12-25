import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Billboard, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Ornament } from './Ornament' 

// --- SPACING CONFIGURATION ---
// Vertical: High value (30) prevents stacking on top of each other
const MIN_V_SPACING = 7
// Horizontal: Low value (12) allows them to be close side-by-side
const MIN_H_SPACING = 7

// The position of the tree as defined in App.jsx
const TREE_Y_OFFSET = -100

// --- HELPERS (Unchanged) ---
function createGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)') 
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

function GlowRipple({ texture, color, offset, speed = 0.8, size }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.getElapsedTime() * speed + offset) % 1
    const currentScale = size * (1 + t * 3)
    ref.current.scale.set(currentScale, currentScale, currentScale)
    ref.current.material.opacity = 0.8 * (1 - Math.pow(t, 2))
  })
  return (
    <mesh ref={ref} position={[0, 0, -0.1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function NeonStar({ size = 1, position = [0, 0, 0] }) {
  const glowTexture = useMemo(() => createGlowTexture(), [])
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
        <group>
            <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.0} />
            <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.33} />
            <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.66} />
        </group>
        <mesh position={[0,0,-0.05]} scale={[1.5, 1.5, 1.5]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={glowTexture} color="#FFFF00" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial color="#FFFF00" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <Line points={points} color="#FFFF00" lineWidth={5} closed transparent opacity={1} />
      </group>
    </Billboard>
  )
}

// --- MAIN TREE COMPONENT ---
export function Tree({ onTreeClick, ornaments = [], activeId, setActiveId }) {
  const { scene } = useGLTF('/tree.glb')
  
  const clickStart = useRef({ x: 0, y: 0, time: 0 })

  const handlePointerDown = (e) => {
    e.stopPropagation()
    clickStart.current = { 
      x: e.clientX, 
      y: e.clientY,
      time: Date.now() 
    }
  }

  const handlePointerUp = (e) => {
    e.stopPropagation()

    // 1. TIME CHECK
    if (Date.now() - clickStart.current.time > 200) return 

    // 2. DISTANCE CHECK (Drag prevention)
    const dx = Math.abs(e.clientX - clickStart.current.x)
    const dy = Math.abs(e.clientY - clickStart.current.y)
    if (dx > 10 || dy > 10) return

    // 3. TRUNK CHECK
    const hitName = e.object.name.toLowerCase()
    const matName = e.object.material.name ? e.object.material.name.toLowerCase() : ''
    
    // Name based check
    if (hitName.includes('trunk') || hitName.includes('bark') || hitName.includes('stand') || 
        matName.includes('bark') || matName.includes('wood')) {
       console.log("Blocked: Clicked on trunk mesh")
       return
    }

    // Geometry based check
    // e.point is in WORLD space. The tree center is at (0, -100, 0).
    const radius = Math.sqrt(e.point.x**2 + e.point.z**2)
    // Adjust Y check because tree starts at -100.
    if (e.point.y < (TREE_Y_OFFSET + 40) && radius < 8) {
       console.log("Blocked: Clicked too close to trunk center")
       return
    }

    // --- 4. CYLINDRICAL PROXIMITY CHECK ---
    // We compare e.point (World Click) vs ornaments (Local Space + Offset)
    for (let orn of ornaments) {
      // CONVERT ORNAMENT TO WORLD SPACE
      // Ornament is stored relative to [0, -100, 0], so we add that offset.
      const ornWorldY = orn.position[1] + TREE_Y_OFFSET
      const ornWorldX = orn.position[0]
      const ornWorldZ = orn.position[2]

      // 1. Vertical Distance (Y-Axis)
      const distY = Math.abs(e.point.y - ornWorldY)

      // 2. Horizontal Distance (XZ-Plane)
      const distXZ = Math.sqrt(
        Math.pow(e.point.x - ornWorldX, 2) + 
        Math.pow(e.point.z - ornWorldZ, 2)
      )

      // LOGIC: If it's too close Vertically AND too close Horizontally, block it.
      // This creates a "Cylinder" of protection around the ornament.
      if (distY < MIN_V_SPACING && distXZ < MIN_H_SPACING) {
        console.log("Blocked: Overlaps existing ornament")
        return 
      }
    }

    // 5. SUCCESS
    onTreeClick(e.point) 
    setActiveId(null)
  }

  return (
    <group dispose={null}>
      
      <NeonStar size={7} position={[0, 225, 0]} />

      <primitive 
        object={scene} 
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
      
      {ornaments.map((orn) => (
        <Ornament 
          key={orn.id}
          position={orn.position}
          color={orn.color}
          message={orn.message}
          textureData={orn.textureData}
          
          isActive={activeId === orn.id}
          onActivate={() => {
             setActiveId(activeId === orn.id ? null : orn.id)
          }}
        />
      ))}

    </group>
  )
}

useGLTF.preload('/tree.glb')