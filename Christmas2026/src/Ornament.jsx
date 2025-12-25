import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export function Ornament({ position, color, textureData, message }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  // Load the drawing as a texture if it exists
  const texture = React.useMemo(() => {
    if (textureData) {
      const tex = new THREE.TextureLoader().load(textureData)
      tex.flipY = false // Fix orientation for UV mapping
      return tex
    }
    return null
  }, [textureData])

  return (
    <group position={position}>
      <mesh 
        onClick={(e) => { e.stopPropagation(); setClicked(!clicked) }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Replace args with your GLB scale if needed */}
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          map={texture}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* The Message Popup (Billboard ensures it faces camera) */}
      {(hovered || clicked) && (
        <Html position={[0, 4, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            padding: '5px 10px', 
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            border: '1px solid black'
          }}>
            {message}
          </div>
        </Html>
      )}
    </group>
  )
}