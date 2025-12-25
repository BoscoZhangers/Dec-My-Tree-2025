import React, { Suspense, useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber' 
import { OrbitControls, Environment, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Tree } from './Tree' 
import { Overlay } from './Overlay' // Ensure you created this file


const TREE_POSITION = [0, -100, 0]



// --- 1. SNOW HELPERS ---
function createCircleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64

  const context = canvas.getContext('2d')
  context.beginPath()
  context.arc(32, 32, 30, 0, 2 * Math.PI) 
  context.fillStyle = '#ffffff'
  context.fill()

  return new THREE.CanvasTexture(canvas)
}



function Snow({ count = 500 }) {
  const points = useRef()
  const texture = useMemo(() => createCircleTexture(), [])

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800 
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600 
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800 
    }
    return positions
  }, [count])

  useFrame((state) => {
    const { clock } = state
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      points.current.geometry.attributes.position.array[i3 + 1] -= 0.5 + Math.random() * 0.1
      points.current.geometry.attributes.position.array[i3] += Math.sin(clock.elapsedTime + points.current.geometry.attributes.position.array[i3]) * 0.05
      if (points.current.geometry.attributes.position.array[i3 + 1] < -300) {
        points.current.geometry.attributes.position.array[i3 + 1] = 300
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesPosition.length / 3} array={particlesPosition} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial map={texture} size={4} color="#ffffff" transparent alphaTest={0.5} opacity={0.9} sizeAttenuation={true} depthWrite={false} />
    </points>
  )
}



export default function App() {
  // --- STATE ---
  const [ornaments, setOrnaments] = useState([]) 
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tempPos, setTempPos] = useState(null)

  // --- HANDLERS ---
  const handleTreeClick = (worldPoint) => {

    const localPoint = {
      x: worldPoint.x - TREE_POSITION[0],
      y: worldPoint.y - TREE_POSITION[1],
      z: worldPoint.z - TREE_POSITION[2]
    }
  
    setTempPos(localPoint)
    setIsModalOpen(true)
  }

  const handleOrnamentSubmit = (data) => {
    const newOrnament = {
      id: Date.now(),
      position: [tempPos.x, tempPos.y, tempPos.z],
      color: data.color,
      message: data.message,
      textureData: data.textureData
    }
    setOrnaments((prev) => [...prev, newOrnament])
    setIsModalOpen(false)
    setTempPos(null)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      
      {/* 1. UI OVERLAY */}
      <Overlay 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleOrnamentSubmit}
        initialPos={tempPos}
      />

      {/* 2. 3D SCENE */}
      <Canvas camera={{ position: [180, -50, 8], fov: 70 }}>
        
        {/* Visuals */}
        <color attach="background" args={['#050505']} />
        <Snow count={2000} />
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <Environment preset="park" />

        {/* Logic */}
        <Suspense fallback={null}>
          
          {/* NEW CODE: We wrap the Tree in a group and move the group DOWN */}
          {/* [x, y, z] -> -100 on the Y axis moves it down */}
          <group position={TREE_POSITION}> 
            <Tree 
              onTreeClick={handleTreeClick} 
              ornaments={ornaments}
            />
          </group>

        </Suspense>

        {/* Controls */}
        <OrbitControls 
          makeDefault
          enablePan={false}
          enabled={!isModalOpen} // Disable when drawing
          
          // --- ZOOM RESTRICTIONS  ---
          minDistance={100}   // Close up
          maxDistance={400}  // Far away

          // --- ROTATION RESTRICTIONS ---
          maxPolarAngle={Math.PI / 2} // Don't go underground
          minPolarAngle={0.3}
        />
      </Canvas>
      
    </div>
  )
}