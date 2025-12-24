import React, { useState } from 'react'
import { useGLTF } from '@react-three/drei'

// 1. FIX NAME: We export 'Model' because App.jsx is looking for <Model />
export function Tree(props) {
  const { scene } = useGLTF('/tree.glb')
  const [lastClick, setLastClick] = useState(null)

  return (
    // 2. We use a "Fragment" (<> ... </>) so we can return two separate things
    <>
      
      {/* THING 1: The Tree 
          We spread {...props} here so only the TREE moves to [0, -2, 0] 
      */}
      <group {...props} dispose={null}>
        <primitive 
          object={scene} 
          onClick={(e) => {
            // This stops the click from hitting things behind the tree
            e.stopPropagation() 
            // Save the exact World Coordinates of the click
            setLastClick(e.point)
          }}
        />
      </group>

      {/* THING 2: The Red Ball 
          It is OUTSIDE the tree group.
          This means it uses "World Space". If you click at Y=0, it goes to Y=0.
          It won't get shifted down by the tree's offset.
      */}
      {lastClick && (
        <mesh position={[lastClick.x, lastClick.y, lastClick.z]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color="red" emissive="red" emissiveIntensity={10} />
        </mesh>
      )}
      
    </>
  )
}

useGLTF.preload('/tree.glb')