import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber' 
import { OrbitControls, Environment, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Tree } from './Tree' 

// --- 1. HELPER: Generate a round texture on the fly ---
// We draw a white circle on a small canvas so we don't need an image file.
function createCircleTexture() {
  const canvas = document.createElement('canvas')
  // 64x64 is plenty of detail for tiny particles
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')

  // Draw a solid white circle in the center
  context.beginPath()
  context.arc(32, 32, 30, 0, 2 * Math.PI) // x, y, radius
  context.fillStyle = '#ffffff'
  context.fill()

  return new THREE.CanvasTexture(canvas)
}


// --- CUSTOM SNOW COMPONENT ---
function Snow({ count = 3000 }) {
  const points = useRef()

  // Generate the round texture once
  const texture = useMemo(() => createCircleTexture(), [])

  // 1. Generate Random Positions once
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Spread them out widely
      positions[i * 3] = (Math.random() - 0.5) * 800 
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600 
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800 
    }
    return positions
  }, [count])

  // 2. Animate the Snow Falling
  useFrame((state) => {
    const { clock } = state
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Gravity
      points.current.geometry.attributes.position.array[i3 + 1] -= 0.5 + Math.random() * 0.1
      // Wind sway
      points.current.geometry.attributes.position.array[i3] += Math.sin(clock.elapsedTime + points.current.geometry.attributes.position.array[i3]) * 0.05

      // Reset loop (move bottom flakes to top)
      // Adjusted heights for a wider spread
      if (points.current.geometry.attributes.position.array[i3 + 1] < -300) {
        points.current.geometry.attributes.position.array[i3 + 1] = 300
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        // Apply the round texture
        map={texture}
        // Increased size (4) because circles look smaller than squares
        size={4} 
        color="#ffffff" 
        transparent={true}
        // Important: alphaTest helps with sorting transparent textures cleanly 
        alphaTest={0.5} 
        opacity={0.9} 
        sizeAttenuation={true} 
        depthWrite={false} 
      />
    </points>
  )
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      
      <Canvas camera={{ position: [180, -50, 8], fov: 70 }}>
        
        <color attach="background" args={['#050505']} />

        {/* Added more snow for a thicker effect */}
        <Snow count={1000} />

        <Stars 
          radius={300} 
          depth={50}   
          count={5000} 
          factor={4}   
          saturation={0} 
          fade         
          speed={1}    
        />

        <ambientLight intensity={0.5} />
        <Environment preset="park" />

        <Suspense fallback={null}>
          <Tree position={[0, -125, 0]} />
        </Suspense>

        <OrbitControls 
          makeDefault
          enablePan={false}
          minDistance={75}
          maxDistance={300}
          maxPolarAngle={Math.PI / 2 + 0.3}
          minPolarAngle={0.3}
        />
      </Canvas>
      
    </div>
  )
}