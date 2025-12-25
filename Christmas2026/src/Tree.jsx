import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Billboard, Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Ornament } from './Ornament' 

// --- CONFIGURATION ---
const MIN_V_SPACING = 7
const MIN_H_SPACING = 7
const TREE_Y_OFFSET = -100

// --- CELEBRATION COMPONENT ---
function CelebrationText({ visible }) {
  if (!visible) return null

  return (
    <Billboard position={[0, 255, 0]} follow={true}>
      <Text
        fontSize={16}
        color="#FFD700"
        // Updated URL to a more reliable CDN link
        font="/GreatVibes-Regular.ttf" 
        anchorX="center"
        anchorY="middle"
        maxWidth={200}
        textAlign="center"
        lineHeight={1.2}
      >
        {"Merry Christmas\n2025!!"}
        <meshStandardMaterial 
          emissive="#FFD700" 
          emissiveIntensity={3} 
          toneMapped={false} 
        />
      </Text>
    </Billboard>
  )
}

// --- HELPERS ---
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

// --- LIGHTS & WIRE COMPONENT ---
function TreeLights() {
  const bulbCount = 45        
  const radiusBottom = 55     
  const height = 180        
  const yStart = 35           
  const turns = 6             
  const groupRef = useRef()

  const { curve } = useMemo(() => {
    const pts = []
    const steps = 200 
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const y = yStart + (t * height)
      const r = radiusBottom * (1 - t * 0.9) 
      const angle = t * Math.PI * 2 * turns
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      pts.push(new THREE.Vector3(x, y, z))
    }
    const c = new THREE.CatmullRomCurve3(pts)
    return { curve: c }
  }, [])

  const bulbPositions = useMemo(() => {
    const positions = []
    for(let i=0; i<bulbCount; i++) {
      const t = i / bulbCount
      const point = curve.getPointAt(t)
      positions.push({ pos: point, id: i })
    }
    return positions
  }, [curve, bulbCount])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.05
    groupRef.current.rotation.z = Math.cos(t * 0.3) * 0.02
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <tubeGeometry args={[curve, 128, 0.5, 8, false]} />
        <meshStandardMaterial color="#061a06" roughness={0.3} metalness={0.8} />
      </mesh>
      {bulbPositions.map((data, i) => (
        <LightBulb key={i} position={data.pos} index={i} />
      ))}
    </group>
  )
}

function LightBulb({ position, index }) {
  const meshRef = useRef()
  const meshRef2 = useRef()
  const glowRef = useRef()
  const bulbGroupRef = useRef()
  const glowTex = useMemo(() => createGlowTexture(), [])

  const colorsA = ['#FF6A00', '#FF8C00', '#FFA500'] 
  const colorsB = ['#CC7700', '#E69900', '#FFB300'] 
  const baseColorIndex = index % 3

  useFrame(({ clock }) => {
    if(!meshRef.current?.material || !meshRef2.current?.material || !glowRef.current?.material) return
    const time = clock.getElapsedTime()
    const twinkle = Math.sin(time * 2.5 + index * 0.8)
    const isPhaseOne = Math.floor(time * 1.1 + index * 0.1) % 2 === 0
    let activeColorStr = (index % 2 === 0) 
        ? (isPhaseOne ? colorsA[baseColorIndex] : colorsB[baseColorIndex])
        : (isPhaseOne ? colorsB[baseColorIndex] : colorsA[baseColorIndex])
    const activeColor = new THREE.Color(activeColorStr)

    const bulbs = [meshRef.current.material, meshRef2.current.material]
    bulbs.forEach(mat => {
      mat.color.copy(activeColor)
      mat.emissive.copy(activeColor)
      mat.emissiveIntensity = 1.0 + twinkle * 0.7
    })

    glowRef.current.material.color.copy(activeColor)
    glowRef.current.material.opacity = 0.2 + (twinkle * 0.1)
    if (bulbGroupRef.current) bulbGroupRef.current.rotation.x = Math.sin(time + index) * 0.1
  })

  return (
    <group position={position} ref={bulbGroupRef}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 8]} />
        <meshStandardMaterial color="#020202" roughness={1} />
      </mesh>
      <group position={[0, -1.8, 0]} scale={[1.4, 1.4, 1.4]}> 
         <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.35, 0.8, 1, 16]} />
            <meshStandardMaterial ref={meshRef} toneMapped={false} />
         </mesh>
         <mesh ref={meshRef2} position={[0, 0.1, 0]} scale={[1, 1.1, 1]}> 
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial toneMapped={false} />
         </mesh>
      </group>
      <Billboard position={[0, -2.5, 0]}>
         <mesh ref={glowRef}>
            <planeGeometry args={[14, 14]} /> 
            <meshBasicMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.4} />
         </mesh>
      </Billboard>
    </group>
  )
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
  
  // Celebration Logic
  const [showCelebration, setShowCelebration] = useState(false)
  const lastOrnLength = useRef(ornaments.length)

  useEffect(() => {
    // Only trigger if a new ornament was added, not on initial load
    if (ornaments.length > lastOrnLength.current) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 5000)
      return () => clearTimeout(timer)
    }
    lastOrnLength.current = ornaments.length
  }, [ornaments.length])

  const handlePointerDown = (e) => {
    e.stopPropagation()
    clickStart.current = { x: e.clientX, y: e.clientY, time: Date.now() }
  }

  const handlePointerUp = (e) => {
    e.stopPropagation()
    if (Date.now() - clickStart.current.time > 200) return 
    const dx = Math.abs(e.clientX - clickStart.current.x)
    const dy = Math.abs(e.clientY - clickStart.current.y)
    if (dx > 10 || dy > 10) return

    const hitName = e.object.name.toLowerCase()
    const matName = e.object.material.name ? e.object.material.name.toLowerCase() : ''
    
    if (hitName.includes('trunk') || hitName.includes('bark') || hitName.includes('stand') || 
        matName.includes('bark') || matName.includes('wood')) return

    const radius = Math.sqrt(e.point.x**2 + e.point.z**2)
    if (e.point.y < (TREE_Y_OFFSET + 40) && radius < 8) return

    for (let orn of ornaments) {
      const ornWorldY = orn.position[1] + TREE_Y_OFFSET
      const ornWorldX = orn.position[0]
      const ornWorldZ = orn.position[2]
      const distY = Math.abs(e.point.y - ornWorldY)
      const distXZ = Math.sqrt(Math.pow(e.point.x - ornWorldX, 2) + Math.pow(e.point.z - ornWorldZ, 2))
      if (distY < MIN_V_SPACING && distXZ < MIN_H_SPACING) return 
    }

    onTreeClick(e.point) 
    setActiveId(null)
  }

  return (
    <group dispose={null}>
      <NeonStar size={7} position={[0, 225, 0]} />
      
      {/* Celebration Text follows camera automatically via Billboard */}
      <CelebrationText visible={showCelebration} />
      
      <TreeLights />
      <primitive object={scene} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} />
      {ornaments.map((orn) => (
        <Ornament 
          key={orn.id} 
          position={orn.position} 
          color={orn.color} 
          message={orn.message} 
          textureData={orn.textureData} 
          isActive={activeId === orn.id} 
          onActivate={() => setActiveId(activeId === orn.id ? null : orn.id)} 
        />
      ))}
    </group>
  )
}

useGLTF.preload('/tree.glb')