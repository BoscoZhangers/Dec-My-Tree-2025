import React, { useMemo, useRef } from 'react' // Removed useState
import { useFrame } from '@react-three/fiber'
import { useGLTF, Billboard, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Ornament } from './Ornament' 

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
  
  // REMOVED LOCAL STATE (Lifted to App.jsx)

  return (
    <group dispose={null}>
      
      <NeonStar size={7} position={[0, 225, 0]} />

      <primitive 
        object={scene} 
        onClick={(e) => {
          e.stopPropagation() 
          onTreeClick(e.point) 
          setActiveId(null)
        }}
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