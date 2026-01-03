import React, { useState, useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// --- 1. NEW HELPER COMPONENT ---
// This handles the scaling math so the main component stays clean
function HoverOutline() {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    
    // 1. Measure distance from Camera to this Ornament
    const distance = state.camera.position.distanceTo(ref.current.getWorldPosition(new THREE.Vector3()))
    
    // 2. Calculate Scale
    // Formula: Base Scale (1.05) + (Distance * Thickness Factor)
    // As you get further away, 'distance' goes up, making the border physically larger
    // so it looks the same size on your screen.
    const scale = 1.05 + (distance * 0.003) 
    
    ref.current.scale.set(scale, scale, scale)
  })

  return (
    <mesh ref={ref}>
      {/* Same geometry size as the parent (3), we scale the mesh instead */}
      <sphereGeometry args={[3, 32, 32]} />
      <meshBasicMaterial color="#00BFFF" side={THREE.BackSide} />
    </mesh>
  )
}


// --- 2. MAIN COMPONENT ---
export function Ornament({ position, color, textureData, message, isActive, onActivate }) {
  const [hovered, setHovered] = useState(false)
  
  const texture = useMemo(() => {
    if (textureData) {
      const tex = new THREE.TextureLoader().load(textureData)
      tex.flipY = false 
      return tex
    }
    return null
  }, [textureData])

  return (
    <group position={position}>
      
      {/* MAIN SPHERE */}
      <mesh 
        onClick={(e) => { 
            e.stopPropagation(); 
            onActivate() 
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          map={texture}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* DYNAMIC OUTLINE (Only renders when hovered) */}
      {hovered && <HoverOutline />}

      {/* MESSAGE BUBBLE */}
      {(hovered || isActive) && (
        <Html 
            position={[0, 4, 0]} 
            zIndexRange={[100, 0]}
            center 
            style={{ pointerEvents: 'none' }}
        >
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            padding: '6px 12px', 
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            border: '1px solid #333', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            userSelect: 'none',
            color: 'black'
          }}>
            {message}
          </div>
        </Html>
      )}
    </group>
  )
}