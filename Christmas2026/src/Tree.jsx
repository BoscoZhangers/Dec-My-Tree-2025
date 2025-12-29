import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Billboard, Line, Text, Points } from '@react-three/drei'
import * as THREE from 'three'
import { Ornament } from './Ornament' 

// --- TUNING CONTROLS ---
const TREE_BASE_Y = -100;     
const MIN_HEIGHT_CUTOFF = 25; 
const TRUNK_RADIUS = 5;       
const ORNAMENT_SPACING = 12;  

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
    <Points ref={pointsRef} position={position} raycast={() => null}>
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
      const charAppearanceTime = (2.0 / characters.length) * i
      let { opacity, showSparkle, sparkled } = charState

      if (timer.current > 6) {
        opacity = Math.max(0, opacity - delta * 2)
        if (opacity <= 0 && i === characters.length - 1) {
            timer.current = -1
        }
      } 
      else if (timer.current >= charAppearanceTime) {
        opacity = Math.min(1, opacity + delta * 6)
        if (opacity >= 0.8 && !sparkled) {
          showSparkle = true
          sparkled = true
        }
      }

      if (showSparkle && timer.current > charAppearanceTime + 1.5) {
        showSparkle = false
      }

      return { opacity, showSparkle, sparkled }
    }))
  })

  return (
    <Billboard position={[0, 255, 0]} follow={true}>
      {renderLine(line1, 0, 10, charStates, charRefs)}
      {renderLine(line2, line1.length, -10, charStates, charRefs)}
    </Billboard>
  )
}

const getCharWidth = (char) => {
  const widths = { 'M': 20, 'C': 14, 'r': 6, 'y': 6, 's': 5, 't': 5, 'i': 4, ' ': 8, '2': 9, '0': 9, '5': 9, '!': 5 }
  return widths[char] || 7 
}

const renderLine = (charArray, startIndex, yPos, charStates, charRefs) => {
  const totalWidth = charArray.reduce((acc, char) => acc + getCharWidth(char), 0)
  let currentX = -totalWidth / 2 

  return (
    <group position={[0, yPos, 0]}>
      {charArray.map((char, i) => {
        const globalIndex = startIndex + i
        const width = getCharWidth(char)
        const xPos = currentX + (width / 2)
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
              raycast={() => null} 
            >
              {char}
              <meshStandardMaterial 
                emissive="#FFD700" emissiveIntensity={3} toneMapped={false} transparent 
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
    <mesh ref={ref} position={[0, 0, -0.1]} raycast={() => null}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// --- NEON STAR ---
function NeonStar({ size = 7, triggerRef, onFlash }) { 
  const glowTexture = useMemo(() => createGlowTexture(), [])
  const starRef = useRef()
  const burstRef = useRef()
  const phaseRef = useRef('spiraling') 
  const [burstOpacity, setBurstOpacity] = useState(0)
  const shakeTime = useRef(0)
  const hasTriggeredFlash = useRef(false)
  const rotationAngle = useRef(0)

  const targetY = 225
  
  // CHANGED: Raised startY from -80 to 25. 
  // This places the start of the spiral just above the trunk (MIN_HEIGHT_CUTOFF is 20).
  const startY = 25 
  
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
        if (triggerRef.current) triggerRef.current()
        if (onFlash) onFlash() 
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
          <mesh ref={burstRef} scale={[50, 50, 1]} raycast={() => null}>
            <planeGeometry />
            <meshBasicMaterial map={glowTexture} transparent opacity={Math.min(1, burstOpacity)} color="#FFFFFF" blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </Billboard>
      )}
      <group scale={[size, size, size]}>
        <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.0} />
        <GlowRipple texture={glowTexture} color="#FFFF00" size={2} speed={0.5} offset={0.33} />
        {phaseRef.current === 'spiraling' && <SparkleBurst active={true} position={[0, 0, 0]} />}
        <mesh position={[0, 0, -0.05]} scale={[1.5, 1.5, 1.5]} raycast={() => null}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={glowTexture} color="#FFFF00" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh raycast={() => null}><shapeGeometry args={[shape]} /><meshBasicMaterial color="#FFFF00" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <Line points={points} color="#FFFF00" lineWidth={5} closed transparent opacity={1} />
      </group>
    </group>
  )
}

// --- TREE LIGHTS ---
const TreeLights = React.memo(() => {
  const bulbCount = 60; 
  const radiusBottom = 55; 
  const height = 172.5; 
  const yStart = 35; 
  const turns = 6

  const { curve } = useMemo(() => {
    const pts = []
    // Bottom flare
    for (let i = -10; i < 0; i++) {
        const t = i / 200; 
        const y = yStart + (t * height); 
        const angle = t * Math.PI * 2 * turns; 
        const r = radiusBottom * ((10 + i) / 10) 
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r))
    }
    
    // Main Spiral
    for (let i = 0; i <= 200; i++) {
      const t = i / 200; 
      const y = yStart + (t * height); 
      const r = radiusBottom * (1 - t * 0.82); 
      const angle = t * Math.PI * 2 * turns
      pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r))
    }
    
    // The Tuck
    const lastP = pts[pts.length - 1]
    pts.push(new THREE.Vector3(lastP.x * 0.8, lastP.y - 2, lastP.z * 0.8))
    
    return { curve: new THREE.CatmullRomCurve3(pts) }
  }, [radiusBottom, height, yStart, turns])

  return (
    <group>
      <mesh raycast={() => null}>
          <tubeGeometry args={[curve, 180, 0.5, 8, false]} />
          <meshStandardMaterial color="#061a06" roughness={0.3} metalness={0.8} />
      </mesh>
      {Array.from({ length: bulbCount }).map((_, i) => (
        <LightBulb 
          key={i} 
          position={curve.getPointAt(0.02 + (i / (bulbCount - 1)) * 0.98)} 
          index={i} 
          // CHANGED: Re-synced timing. 
          // Since star starts at y=25 and lights start at y=35, the distance is very short.
          // Lights now start turning on at 0.5s instead of 1.5s.
          activationTime={0.5 + (i / bulbCount) * 3.5}
        />
      ))}
    </group>
  )
})

function LightBulb({ position, index, activationTime }) {
  const meshRef = useRef(); 
  const meshRef2 = useRef(); 
  const glowRef = useRef(); 
  const bulbGroupRef = useRef()
  
  const glowTex = useMemo(() => createGlowTexture(), [])

  const whiteColors = ['#FFFFFF', '#FFFACD', '#FAFAD2', '#FFF8DC', '#FFFFF0']; 
  const darkColor = new THREE.Color('#111111'); 

  const activeColor = useMemo(() => {
    const hex = whiteColors[index % whiteColors.length];
    return new THREE.Color(hex);
  }, [index])

  useFrame(({ clock }) => {
    if(!meshRef.current?.material || !meshRef2.current?.material) return
    const time = clock.getElapsedTime(); 

    // --- ACTIVATION LOGIC ---
    let wakeUp = (time - activationTime) * 2.0; 
    wakeUp = THREE.MathUtils.clamp(wakeUp, 0, 1);

    const twinkle = Math.sin(time * 2.5 + index * 0.8)
    const currentColor = darkColor.clone().lerp(activeColor, wakeUp);
    
    const bulbs = [meshRef.current.material, meshRef2.current.material]
    
    bulbs.forEach(mat => { 
        mat.color.copy(currentColor); 
        mat.emissive.copy(currentColor); 
        mat.emissiveIntensity = (2.5 + twinkle * 1.0) * wakeUp; 
    })
    
    if (glowRef.current) { 
        glowRef.current.material.color.copy(currentColor); 
        glowRef.current.material.opacity = (0.4 + (twinkle * 0.1)) * wakeUp; 
    }
    
    if (bulbGroupRef.current) { 
        bulbGroupRef.current.rotation.x = Math.sin(time * 1.5 + index) * 0.35; 
        bulbGroupRef.current.rotation.z = Math.cos(time * 1.4 + index) * 0.25 
    }
  })

  return (
    <group position={position} ref={bulbGroupRef}>
      <mesh position={[0, 0, 0]} raycast={() => null}>
          <cylinderGeometry args={[0.5, 0.5, 1.2, 8]} />
          <meshStandardMaterial color="#020202" />
      </mesh>
      
      <group position={[0, -1.8, 0]} scale={[1.4, 1.4, 1.4]}>
        <mesh ref={meshRef} position={[0, 0.8, 0]} raycast={() => null}>
            <cylinderGeometry args={[0.35, 0.8, 1, 16]} />
            <meshStandardMaterial toneMapped={false} />
        </mesh>
        
        <mesh ref={meshRef2} position={[0, 0.1, 0]} scale={[1, 1.1, 1]} raycast={() => null}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial toneMapped={false} />
        </mesh>
      </group>

      <Billboard position={[0, -2.5, 0]}>
          <mesh ref={glowRef} raycast={() => null}>
              <planeGeometry args={[14, 14]} />
              <meshBasicMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.4} />
          </mesh>
      </Billboard>
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

  const memoTree = useMemo(() => (
    <primitive 
      object={scene} 
      onPointerDown={(e) => {
        e.stopPropagation()
        clickStartPos.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        const moveDist = Math.sqrt(
          Math.pow(e.clientX - clickStartPos.current.x, 2) + 
          Math.pow(e.clientY - clickStartPos.current.y, 2)
        );
        if (moveDist > 10) return;

        const localVec = { 
            x: e.point.x, 
            y: e.point.y - TREE_BASE_Y, 
            z: e.point.z 
        };
        const distFromCenter = Math.sqrt(localVec.x ** 2 + localVec.z ** 2);

        if (localVec.y < MIN_HEIGHT_CUTOFF) return; 
        if (distFromCenter < TRUNK_RADIUS) return; 

        const isTooClose = ornaments.some((orn) => {
          const dx = localVec.x - orn.position[0];
          const dy = localVec.y - orn.position[1];
          const dz = localVec.z - orn.position[2];
          return Math.sqrt(dx*dx + dy*dy + dz*dz) < ORNAMENT_SPACING;
        });
      
        if (isTooClose) return;
        onTreeClick(e.point);
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