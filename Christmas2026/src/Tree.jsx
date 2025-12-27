import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Billboard, Line, Text, Points } from '@react-three/drei'
import * as THREE from 'three'
import { Ornament } from './Ornament' 

// --- CONFIGURATION ---
const MIN_V_SPACING = 7
const MIN_H_SPACING = 7
const TREE_Y_OFFSET = -100

// --- SPARKLE EFFECT ---
function SparkleBurst({ active, position }) {
  const pointsRef = useRef()
  const count = 30 
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions.set([0, 0, 0], i * 3)
      velocities.set([(Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1], i * 3)
    }
    return { positions, velocities }
  }, [])

  useFrame((state, delta) => {
    if (!active || !pointsRef.current) return
    const posArr = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      posArr[i * 3] += particles.velocities[i * 3] * 0.3 
      posArr[i * 3 + 1] += particles.velocities[i * 3 + 1] * 0.3
      posArr[i * 3 + 2] += particles.velocities[i * 3 + 2] * 0.3
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.material.opacity -= delta * 0.8 
  })

  if (!active || !position) return null 
  return (
    <Points ref={pointsRef} position={position}>
      <pointsMaterial size={1.5} color="#FFD700" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles.positions} itemSize={3} />
      </bufferGeometry>
    </Points>
  )
}

// --- CELEBRATION COMPONENT ---
function CelebrationText({ triggerRef }) {
  const line1 = "Merry Christmas".split('')
  const line2 = "2025!!".split('')
  const characters = [...line1, ...line2]
  const charRefs = useRef([])
  
  const timer = useRef(-1) 
  
  const [charStates, setCharStates] = useState(
    characters.map(() => ({ opacity: 0, showSparkle: false, sparkled: false }))
  )
  const totalDuration = 2.0 

  useEffect(() => {
    triggerRef.current = () => {
      timer.current = 0 
      setCharStates(characters.map(() => ({ opacity: 0, showSparkle: false, sparkled: false })))
    }
  }, [triggerRef, characters])

  useFrame((state, delta) => {
    if (timer.current === -1) return
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

      // Sparkle stays alive long enough to be seen (1.5s)
      if (showSparkle && timer.current > charAppearanceTime + 1.5) showSparkle = false
      
      if (timer.current > 8) {
        opacity = Math.max(0, opacity - delta * 2)
        if (opacity <= 0 && i === characters.length - 1) timer.current = -1
      }

      return { opacity, showSparkle, sparkled }
    }))
  })

  return (
    <Billboard position={[0, 255, 0]} follow={true}>
      {/* We pass the global start index to map correctly to charStates */}
      {renderLine(line1, 0, 10, charStates, charRefs)}
      {renderLine(line2, line1.length, -10, charStates, charRefs)}
    </Billboard>
  )
}

// --- KERNING HELPER ---
// This determines exactly how much space each letter needs
const getCharWidth = (char) => {
  const widths = {
    'M': 20, // Huge width to clear the swash
    'C': 14, // Wide capital
    'r': 6,  // Tighten these up
    'y': 6,
    's': 5,
    't': 5,
    'i': 4,  // Very narrow
    ' ': 8,  // Space
    '2': 9, '0': 9, '5': 9, '!': 5
  }
  return widths[char] || 7 // Default width for everything else (e, h, m, a)
}

const renderLine = (charArray, startIndex, yPos, charStates, charRefs) => {
  // 1. Calculate the total width of the word so we can center it
  const totalWidth = charArray.reduce((acc, char) => acc + getCharWidth(char), 0)
  
  // 2. Start drawing from the far left
  let currentX = -totalWidth / 2 

  return (
    <group position={[0, yPos, 0]}>
      {charArray.map((char, i) => {
        const globalIndex = startIndex + i
        const width = getCharWidth(char)
        
        // Position is current accumulator + half of this letter's width
        const xPos = currentX + (width / 2)
        
        // Move the accumulator forward for the NEXT letter
        currentX += width

        return (
          <group key={globalIndex} position={[xPos, 0, 0]}>
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
            {charStates[globalIndex].showSparkle && (
              <SparkleBurst active={true} position={[0, 0, 0]} />
            )}
          </group>
        )
      })}
    </group>
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

// --- NEON STAR (STABILIZED) ---
function NeonStar({ size = 7, triggerRef }) {
  const glowTexture = useMemo(() => createGlowTexture(), [])
  const starRef = useRef()
  const burstRef = useRef()
  
  const phaseRef = useRef('spiraling') 
  const [burstOpacity, setBurstOpacity] = useState(0)
  const shakeTime = useRef(0)
  const hasTriggeredFlash = useRef(false)
  const rotationAngle = useRef(0)

  const targetY = 225
  const startY = -80 
  const spiralTurns = 12 
  const radiusBase = 120 

  const { shape, points } = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 1)
    for (let i = 1; i < 10; i++) {
      const angle = (i * Math.PI) / 5
      const radius = i % 2 === 0 ? 1 : 0.5
      s.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius)
    }
    s.closePath()
    return { shape: s, points: s.getPoints().map(v => [v.x, v.y, 0]) }
  }, [])

  useFrame((state, delta) => {
    if (!starRef.current) return
    const t = state.clock.getElapsedTime()

    if (phaseRef.current === 'spiraling') {
      const duration = 4.0 
      const progress = Math.min(t / duration, 1)
      const currentY = startY + (targetY - startY) * progress
      const angle = progress * Math.PI * 2 * spiralTurns
      const currentRadius = radiusBase * (1 - progress) 
      starRef.current.position.set(Math.cos(angle) * currentRadius, currentY, Math.sin(angle) * currentRadius)
      rotationAngle.current += delta * 5
      starRef.current.rotation.z = rotationAngle.current
      if (progress >= 1) phaseRef.current = 'spinning'
    } 

    if (phaseRef.current === 'spinning') {
      starRef.current.position.set(0, targetY, 0)
      rotationAngle.current = (rotationAngle.current + delta * 40) % (Math.PI * 2)
      starRef.current.rotation.y = rotationAngle.current
      if (t > 5.4) phaseRef.current = 'settled'
    }

    if (phaseRef.current === 'settled') {
      starRef.current.position.set(0, targetY + Math.sin(t * 2) * 2, 0)
      state.camera.getWorldQuaternion(starRef.current.quaternion)
      
      if (!hasTriggeredFlash.current) {
        hasTriggeredFlash.current = true
        setBurstOpacity(1.5) 
        shakeTime.current = 0.4 
        // ACTIVATE TEXT INSTANTLY
        if (triggerRef.current) triggerRef.current()
      }
    }

    if (burstOpacity > 0) {
      setBurstOpacity(prev => Math.max(0, prev - delta * 2.0))
      if (burstRef.current) burstRef.current.scale.addScalar(delta * 80)
    }

    if (shakeTime.current > 0) {
      shakeTime.current -= delta
      const intensity = shakeTime.current * 5 
      state.camera.position.x += (Math.random() - 0.5) * intensity
      state.camera.position.y += (Math.random() - 0.5) * intensity
    }
  })

  return (
    <group ref={starRef}>
      {burstOpacity > 0 && (
        <Billboard position={[0, 0, -1]}>
          <mesh ref={burstRef} scale={[50, 50, 1]}>
            <planeGeometry />
            <meshBasicMaterial map={glowTexture} transparent opacity={Math.min(1, burstOpacity)} color="#FFFFFF" blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </Billboard>
      )}
      <group scale={[size, size, size]}>
        <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.0} />
        <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.33} />
        {phaseRef.current === 'spiraling' && <SparkleBurst active={true} position={[0, 0, 0]} />}
        <mesh position={[0, 0, -0.05]} scale={[1.5, 1.5, 1.5]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={glowTexture} color="#FFFF00" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh><shapeGeometry args={[shape]} /><meshBasicMaterial color="#FFFF00" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <Line points={points} color="#FFFF00" lineWidth={5} closed transparent opacity={1} />
      </group>
    </group>
  )
}

// --- TREE LIGHTS ---
const TreeLights = React.memo(() => {
  const bulbCount = 45; const radiusBottom = 55; const height = 172.5; const yStart = 35; const turns = 6
  const { curve } = useMemo(() => {
    const pts = []
    for (let i = -10; i < 0; i++) {
        const t = i / 200; const y = yStart + (t * height); const angle = t * Math.PI * 2 * turns; const r = radiusBottom * ((10 + i) / 10) 
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r))
    }
    for (let i = 0; i <= 200; i++) {
      const t = i / 200; const y = yStart + (t * height); const r = radiusBottom * (1 - t * 0.87); const angle = t * Math.PI * 2 * turns
      pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r))
    }
    const lastP = pts[pts.length - 1]
    pts.push(new THREE.Vector3(lastP.x * 0.8, lastP.y - 2, lastP.z * 0.8))
    return { curve: new THREE.CatmullRomCurve3(pts) }
  }, [radiusBottom, height, yStart, turns])

  return (
    <group>
      <mesh><tubeGeometry args={[curve, 180, 0.5, 8, false]} /><meshStandardMaterial color="#061a06" roughness={0.3} metalness={0.8} /></mesh>
      {Array.from({ length: bulbCount }).map((_, i) => (
        <LightBulb key={i} position={curve.getPointAt(0.05 + (i/bulbCount) * 0.92)} index={i} />
      ))}
    </group>
  )
})

function LightBulb({ position, index }) {
  const meshRef = useRef(); const meshRef2 = useRef(); const glowRef = useRef(); const bulbGroupRef = useRef()
  const glowTex = useMemo(() => createGlowTexture(), [])
  const colorsA = ['#FF6A00', '#FF8C00', '#FFA500']; const colorsB = ['#CC7700', '#E69900', '#FFB300']
  useFrame(({ clock }) => {
    if(!meshRef.current?.material || !meshRef2.current?.material) return
    const time = clock.getElapsedTime(); const twinkle = Math.sin(time * 2.5 + index * 0.8)
    const activeColor = new THREE.Color((index % 2 === 0) ? colorsA[index % 3] : colorsB[index % 3])
    const bulbs = [meshRef.current.material, meshRef2.current.material]
    bulbs.forEach(mat => { mat.color.copy(activeColor); mat.emissive.copy(activeColor); mat.emissiveIntensity = 1.0 + twinkle * 0.7 })
    if (glowRef.current) { glowRef.current.material.color.copy(activeColor); glowRef.current.material.opacity = 0.2 + (twinkle * 0.1) }
    if (bulbGroupRef.current) { bulbGroupRef.current.rotation.x = Math.sin(time * 1.2 + index) * 0.25; bulbGroupRef.current.rotation.z = Math.cos(time * 1.1 + index) * 0.15 }
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

// --- MAIN TREE COMPONENT ---
export function Tree({ onTreeClick, ornaments = [], activeId, setActiveId }) {
  const { scene } = useGLTF('/tree.glb')
  const lastOrnLength = useRef(ornaments.length)
  const introFinished = useRef(false)
  const clickStartPos = useRef({ x: 0, y: 0 })
  const triggerRef = useRef(null)

  const TREE_POSITION = [0, -100, 0] 
  // Adjust this value based on your specific tree model's trunk height
  const TRUNK_THRESHOLD = 35 

  const memoTree = useMemo(() => (
    <primitive 
      object={scene} 
      onPointerDown={(e) => {
        e.stopPropagation()
        clickStartPos.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
      
        // 1. Drag Check
        const moveDist = Math.sqrt(
          Math.pow(e.clientX - clickStartPos.current.x, 2) + 
          Math.pow(e.clientY - clickStartPos.current.y, 2)
        );
        if (moveDist > 10) return;
      
        // 2. Coordinate Conversion (Calculated earlier to check Y threshold)
        const localHit = {
          x: e.point.x - TREE_POSITION[0],
          y: e.point.y - TREE_POSITION[1],
          z: e.point.z - TREE_POSITION[2]
        };

        // 3. Trunk Threshold Check (Blocking by Y Dimension)
        if (localHit.y < TRUNK_THRESHOLD) {
          console.log(`Placement blocked: Hit too low on trunk (${localHit.y.toFixed(2)})`);
          return;
        }
      
        // 4. Proximity Check
        const isTooClose = ornaments.some((orn) => {
          const distY = Math.abs(localHit.y - orn.position[1]);
          const distXZ = Math.sqrt(
            Math.pow(localHit.x - orn.position[0], 2) + 
            Math.pow(localHit.z - orn.position[2], 2)
          );
          return distY < MIN_V_SPACING && distXZ < MIN_H_SPACING;
        });
      
        if (isTooClose) return;
      
        onTreeClick(localHit);
        setActiveId(null);
      }} 
    />
  ), [scene, ornaments, onTreeClick, setActiveId])

  useEffect(() => {
    if (ornaments.length > lastOrnLength.current && introFinished.current) {
        if (triggerRef.current) triggerRef.current()
    }
    lastOrnLength.current = ornaments.length
  }, [ornaments.length])

  return (
    <group dispose={null}>
      <NeonStar triggerRef={triggerRef} onFlash={() => { introFinished.current = true }} />
      <CelebrationText triggerRef={triggerRef} />
      <TreeLights />
      {memoTree}
      
      {ornaments.map((orn) => (
        <Ornament 
          key={orn.id} 
          {...orn} 
          isActive={activeId === orn.id} 
          onActivate={() => setActiveId(activeId === orn.id ? null : orn.id)} 
        />
      ))}
    </group>
  )
}

useGLTF.preload('/tree.glb')