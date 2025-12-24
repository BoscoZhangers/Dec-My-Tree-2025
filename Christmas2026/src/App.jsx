import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber' // <--- This is the 3D Engine
import { OrbitControls, Environment } from '@react-three/drei'
import { Tree } from './Tree' 

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#202025' }}>
      
      {/* CRITICAL FIX: 
         The <Canvas> tag acts like a portal to the 3D world.
         If you put <Model /> outside of <Canvas>, the app CRASHES.
      */}
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        
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
        />
      </Canvas>
      
    </div>
  )
}