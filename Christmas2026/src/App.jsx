import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber' // <--- This is the 3D Engine
import { OrbitControls, Environment } from '@react-three/drei'
import { Tree } from './Tree' 

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#202025' }}>
      
      {}
      <Canvas camera={{ position: [100000, 0, 8], fov: 70 }}>
        
        {/* Lights and Environment */}
        <ambientLight intensity={0.5} />
        <Environment preset="park" />

        <Suspense fallback={null}>
          {}
          <Tree position={[0, -125, 0]} />
        </Suspense>

        <OrbitControls 
          makeDefault
          minDistance={75}
          maxDistance={300}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.5}
          minPolarAngle={0.3}
        />
      </Canvas>
      
    </div>
  )
}