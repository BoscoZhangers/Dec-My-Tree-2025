import React, { useState, useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

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

      {(hovered || isActive) && (
        <Html 
            position={[0, 4, 0]} 
            zIndexRange={[100, 0]}
            center 
            style={{ pointerEvents: 'none' }}
        >
          {/* --- STYLES UPDATED HERE --- */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', // Slightly more opaque white
            padding: '6px 12px', 
            borderRadius: '8px',
            fontSize: '14px', // Slightly larger text
            fontWeight: '500',
            whiteSpace: 'nowrap',
            border: '1px solid #333', // Simple dark grey border always
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)', // Subtle shadow for depth
            userSelect: 'none', // Prevents accidental text highlighting (which turns yellow in some browsers)
            color: 'black' // Ensure text is black
          }}>
            {message}
          </div>
        </Html>
      )}
    </group>
  )
}