import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Billboard, Line, Text, Points } from '@react-three/drei'
import * as THREE from 'three'
import { Ornament } from './Ornament' 

// --- CONFIGURATION ---
const MIN_V_SPACING = 7
const MIN_H_SPACING = 7
const TREE_Y_OFFSET = -100

// --- SPARKLE EFFECT COMPONENT ---
function SparkleBurst({ active, position }) { // Added position prop
  const pointsRef = useRef()
  const count = 30 // Reduced count for individual character sparkles
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions.set([0, 0, 0], i * 3)
      velocities.set([(Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1], i * 3) // Reduced velocity
    }
    return { positions, velocities }
  }, [active])

  useFrame((state, delta) => {
    if (!active || !pointsRef.current) return
    const posArr = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      posArr[i * 3] += particles.velocities[i * 3] * 0.3 // Reduced speed
      posArr[i * 3 + 1] += particles.velocities[i * 3 + 1] * 0.3
      posArr[i * 3 + 2] += particles.velocities[i * 3 + 2] * 0.3
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.material.opacity -= delta * 0.8 // Fade out faster
  })

  if (!active || !position) return null // Only render if active and position is provided
  return (
    <Points ref={pointsRef} position={position}> {/* Use the passed position */}
      <pointsMaterial size={1.5} color="#FFD700" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles.positions} itemSize={3} />
      </bufferGeometry>
    </Points>
  )
}

// --- CELEBRATION COMPONENT ---
function CelebrationText({ visible }) {
  const line1 = "Merry Christmas".split('')
  const line2 = "2025!!".split('')
  
  // Combine into one flat array for the animation state logic
  const characters = [...line1, ...line2]
  const charRefs = useRef([])
  const [charStates, setCharStates] = useState(
    characters.map(() => ({ opacity: 0, showSparkle: false, sparkled: false }))
  )
  const timer = useRef(0)
  const totalDuration = 2.0 

  useEffect(() => {
    if (visible) {
      timer.current = 0
      setCharStates(characters.map(() => ({ opacity: 0, showSparkle: false, sparkled: false })))
    }
  }, [visible])

  useFrame((state, delta) => {
    if (!visible) return
    timer.current += delta

    setCharStates(prevStates => prevStates.map((charState, i) => {
      const charAppearanceTime = (totalDuration / characters.length) * i
      let { opacity, showSparkle, sparkled } = charState

      if (timer.current >= charAppearanceTime) {
        opacity = Math.min(1, opacity + delta * 6)
        if (opacity >= 0.8 && !sparkled) {
          showSparkle = true
          sparkled = true
        }
      }
      if (showSparkle && timer.current > charAppearanceTime + 0.1) showSparkle = false
      return { opacity, showSparkle, sparkled }
    }))
  })

  if (!visible) return null

  // Helper to render a row of characters
  const renderLine = (charArray, startIndex, yPos, letterSpacing) => (
    <group position={[0, yPos, 0]}>
      {charArray.map((char, i) => {
        const globalIndex = startIndex + i
        // Center the line by calculating the total width
        const xOffset = (i - charArray.length / 2) * letterSpacing
        
        return (
          <group key={globalIndex} position={[xOffset, 0, 0]}>
            <Text
              ref={el => charRefs.current[globalIndex] = el}
              fontSize={18}
              color="#FFD700"
              font="/GreatVibes-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              {char}
              <meshStandardMaterial 
                emissive="#FFD700" 
                emissiveIntensity={3} 
                toneMapped={false} 
                transparent 
                opacity={charStates[globalIndex].opacity} 
              />
            </Text>
            {charStates[globalIndex].showSparkle && charRefs.current[globalIndex] && (
              <SparkleBurst active={true} position={[0, 0, 0]} />
            )}
          </group>
        )
      })}
    </group>
  )

  return (
    <Billboard position={[0, 255, 0]} follow={true}>
      {/* Line 1: Merry Christmas (yPos: 10, letterSpacing: 7 for tighter cursive) */}
      {renderLine(line1, 0, 10, 7.5)}
      
      {/* Line 2: 2025!! (yPos: -10) */}
      {renderLine(line2, line1.length, -10, 9)}
    </Billboard>
  )
}


// --- HELPERS ---
function createGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128; canvas.height = 128
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

function NeonStar({ size = 7, position = [0, 225, 0] }) {
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
        <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.0} />
        <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.33} />
        <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.66} />
        <mesh position={[0,0,-0.05]} scale={[1.5, 1.5, 1.5]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={glowTexture} color="#FFFF00" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh><shapeGeometry args={[shape]} /><meshBasicMaterial color="#FFFF00" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <Line points={points} color="#FFFF00" lineWidth={5} closed transparent opacity={1} />
      </group>
    </Billboard>
  )
}

// --- LIGHTS COMPONENT ---
function TreeLights() {
  const bulbCount = 45; 
  const radiusBottom = 55; 
  const height = 172.5; 
  const yStart = 35; 
  const turns = 6

  const { curve } = useMemo(() => {
    const pts = []
    
    // 1. GRADUAL TUCK BOTTOM
    for (let i = -10; i < 0; i++) {
        const t = i / 200
        const y = yStart + (t * height)
        const angle = t * Math.PI * 2 * turns
        const r = radiusBottom * ((10 + i) / 10) 
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r))
    }

    // 2. MAIN SPIRAL
    for (let i = 0; i <= 200; i++) {
      const t = i / 200
      const y = yStart + (t * height)
      // 0.87 is the "sweet spot" - tight but remains on the outer branches
      const r = radiusBottom * (1 - t * 0.87) 
      const angle = t * Math.PI * 2 * turns
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      pts.push(new THREE.Vector3(x, y, z))
    }

    // 3. SUBTLE TOP HOOK
    const lastP = pts[pts.length - 1]
    pts.push(new THREE.Vector3(lastP.x * 0.8, lastP.y - 2, lastP.z * 0.8))

    return { curve: new THREE.CatmullRomCurve3(pts) }
  }, [radiusBottom, height, yStart, turns])

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 180, 0.5, 8, false]} />
        <meshStandardMaterial color="#061a06" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Distribute bulbs - ending slightly before the 'hook' point */}
      {Array.from({ length: bulbCount }).map((_, i) => (
        <LightBulb key={i} position={curve.getPointAt(0.05 + (i/bulbCount) * 0.92)} index={i} />
      ))}
    </group>
  )
}

function LightBulb({ position, index }) {
  const meshRef = useRef(); const meshRef2 = useRef(); const glowRef = useRef(); const bulbGroupRef = useRef()
  const glowTex = useMemo(() => createGlowTexture(), [])
  const colorsA = ['#FF6A00', '#FF8C00', '#FFA500']; const colorsB = ['#CC7700', '#E69900', '#FFB300']
  
  useFrame(({ clock }) => {
    if(!meshRef.current?.material || !meshRef2.current?.material) return
    const time = clock.getElapsedTime()
    const twinkle = Math.sin(time * 2.5 + index * 0.8)
    const activeColor = new THREE.Color((index % 2 === 0) ? colorsA[index % 3] : colorsB[index % 3])
    
    const bulbs = [meshRef.current.material, meshRef2.current.material]
    bulbs.forEach(mat => { 
      mat.color.copy(activeColor); mat.emissive.copy(activeColor); mat.emissiveIntensity = 1.0 + twinkle * 0.7 
    })

    if (glowRef.current) { 
      glowRef.current.material.color.copy(activeColor); glowRef.current.material.opacity = 0.2 + (twinkle * 0.1) 
    }

    if (bulbGroupRef.current) {
        bulbGroupRef.current.rotation.x = Math.sin(time * 1.2 + index) * 0.25
        bulbGroupRef.current.rotation.z = Math.cos(time * 1.1 + index) * 0.15
    }
  })

  return (
    <group position={position} ref={bulbGroupRef}>
      <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 1.2, 8]} /><meshStandardMaterial color="#020202" /></mesh>
      <group position={[0, -1.8, 0]} scale={[1.4, 1.4, 1.4]}>
        <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.35, 0.8, 1, 16]} /><meshStandardMaterial ref={meshRef} toneMapped={false} /></mesh>
        <mesh ref={meshRef2} position={[0, 0.1, 0]} scale={[1, 1.1, 1]}><sphereGeometry args={[0.8, 16, 16]} /><meshStandardMaterial toneMapped={false} /></mesh>
      </group>
      <Billboard position={[0, -2.5, 0]}><mesh ref={glowRef}><planeGeometry args={[14, 14]} /><meshBasicMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.4} /></mesh></Billboard>
    </group>
  )
}

export function Tree({ onTreeClick, ornaments = [], activeId, setActiveId }) {
  const { scene } = useGLTF('/tree.glb')
  const clickStart = useRef({ x: 0, y: 0, time: 0 })
  const [showCelebration, setShowCelebration] = useState(false)
  const lastOrnLength = useRef(ornaments.length)

  useEffect(() => {
    if (ornaments.length > lastOrnLength.current) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 6000)
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
    const dx = Math.abs(e.clientX - clickStart.current.x), dy = Math.abs(e.clientY - clickStart.current.y)
    if (dx > 10 || dy > 10) return

    const hitName = e.object.name.toLowerCase(), matName = e.object.material.name ? e.object.material.name.toLowerCase() : ''
    if (hitName.includes('trunk') || hitName.includes('bark') || matName.includes('wood')) return
    
    for (let orn of ornaments) {
      const ornWorldY = orn.position[1] + TREE_Y_OFFSET
      const distY = Math.abs(e.point.y - ornWorldY)
      const distXZ = Math.sqrt(Math.pow(e.point.x - orn.position[0], 2) + Math.pow(e.point.z - orn.position[2], 2))
      if (distY < MIN_V_SPACING && distXZ < MIN_H_SPACING) return 
    }

    onTreeClick(e.point) 
    setActiveId(null)
  }

  return (
    <group dispose={null}>
      <NeonStar />
      <CelebrationText visible={showCelebration} />
      <TreeLights />
      <primitive object={scene} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} />
      {ornaments.map((orn) => (
        <Ornament 
          key={orn.id} position={orn.position} color={orn.color} message={orn.message} textureData={orn.textureData} 
          isActive={activeId === orn.id} onActivate={() => setActiveId(activeId === orn.id ? null : orn.id)} 
        />
      ))}
    </group>
  )
}

useGLTF.preload('/tree.glb')