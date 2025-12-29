import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber' 
import { OrbitControls, Environment, Stars, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
// --- FIREBASE IMPORTS ---
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from './firebase' 
// ------------------------
import { Tree } from './Tree' 
import { Overlay } from './Overlay' 
import { MusicPlayer } from './MusicPlayer' 

// --- CONFIGURATION ---
const TREE_POSITION = [0, -100, 0] 

// --- ADMIN PANEL ---
function AdminPanel({ ornaments, onDelete }) {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true'

  if (!isAdmin) return null

  return (
    <div style={{
      position: 'absolute', top: 20, right: 20, width: '300px', maxHeight: '80vh',
      overflowY: 'auto', background: 'rgba(0,0,0,0.8)', color: 'white',
      padding: '20px', borderRadius: '8px', zIndex: 1000, border: '1px solid #444'
    }}>
      <h3 style={{ marginTop: 0 }}>🎄 Admin Moderation</h3>
      <p style={{ fontSize: '12px', color: '#aaa' }}>{ornaments.length} ornaments active</p>
      
      {ornaments.map((orn) => (
        <div key={orn.id} style={{ 
          borderBottom: '1px solid #333', padding: '10px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{orn.message || "No message"}</div>
            <div style={{ fontSize: '10px', color: '#888' }}>
              Color: <span style={{ color: orn.color }}>●</span> {orn.id.slice(0, 8)}...
            </div>
          </div>
          <button 
            onClick={() => onDelete(orn.id)}
            style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Del
          </button>
        </div>
      ))}
    </div>
  )
}

// --- MOON COMPONENT ---
function Moon() {
  return (
    <group position={[50, 400, -600]}>
      <mesh>
        <sphereGeometry args={[30, 32, 32]} />
        <meshBasicMaterial color="#fffec4" /> 
      </mesh>
      <mesh scale={[1.2, 1.2, 1.2]}>
         <sphereGeometry args={[30, 32, 32]} />
         <meshBasicMaterial color="#ffffff" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  )
}

// --- PRESENTS COMPONENT ---
function UnderTreePresents() {
  const { scene } = useGLTF('/presents.glb')
  const piles = useMemo(() => {
    return new Array(5).fill(0).map((_, i) => {
      const angle = (i / 5) * Math.PI * 2 + (Math.random() * 0.5)
      const radius = 25 + Math.random() * 10
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const rotationY = Math.random() * Math.PI * 2
      const scale = 15 + Math.random() * 5 
      return { x, z, rotationY, scale }
    })
  }, [])

  return (
    <group position={TREE_POSITION}>
      {piles.map((pile, i) => (
        <primitive 
          key={i} object={scene.clone()} 
          position={[pile.x, 0, pile.z]} 
          rotation={[0, pile.rotationY, 0]}
          scale={[pile.scale, pile.scale, pile.scale]}
          raycast={() => null} // FIX: Ignore clicks
        />
      ))}
    </group>
  )
}

// --- BACKGROUND COMPONENTS ---
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -102, 0]} receiveShadow>
      <circleGeometry args={[1000, 64]} />
      <meshStandardMaterial color="#cfdae3" roughness={0.8} metalness={0.1} />
    </mesh>
  )
}

function BackgroundScenery({ count = 40 }) {
  const items = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 300 + Math.random() * 300
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const scale = 1 + Math.random() * 2
      const type = Math.random() > 0.5 ? 'tree' : 'rock'
      temp.push({ x, z, scale, type, id: i })
    }
    return temp
  }, [count])

  return (
    <group position={[0, -100, 0]}>
      {items.map((item) => (
        <group key={item.id} position={[item.x, 0, item.z]} scale={[item.scale, item.scale, item.scale]}>
          {item.type === 'tree' ? (
            <group>
               <mesh position={[0, 10, 0]}>
                 <cylinderGeometry args={[2, 2, 20]} />
                 <meshStandardMaterial color="#4a3c31" />
               </mesh>
               <mesh position={[0, 30, 0]}>
                 <coneGeometry args={[15, 40, 4]} />
                 <meshStandardMaterial color="#1a472a" roughness={0.8} />
               </mesh>
            </group>
          ) : (
            <mesh position={[0, 5, 0]} rotation={[Math.random(), Math.random(), Math.random()]}>
              <dodecahedronGeometry args={[10, 0]} />
              <meshStandardMaterial color="#888" roughness={0.9} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

// --- SNOW COMPONENTS ---
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

function Snow({ count = 2000 }) {
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
      points.current.geometry.attributes.position.array[i3] += 
        Math.sin(clock.elapsedTime + points.current.geometry.attributes.position.array[i3]) * 0.05
      if (points.current.geometry.attributes.position.array[i3 + 1] < -300) {
        points.current.geometry.attributes.position.array[i3 + 1] = 300
        points.current.geometry.attributes.position.array[i3] = (Math.random() - 0.5) * 800 
        points.current.geometry.attributes.position.array[i3 + 2] = (Math.random() - 0.5) * 800 
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points} raycast={() => null}> {/* FIX: Ignore clicks */}
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesPosition.length / 3} array={particlesPosition} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial map={texture} size={4} color="#ffffff" transparent alphaTest={0.5} opacity={0.9} sizeAttenuation={true} depthWrite={false} />
    </points>
  )
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [ornaments, setOrnaments] = useState([]) 
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tempPos, setTempPos] = useState(null)
  const [activeId, setActiveId] = useState(null)

  // --- FIREBASE SYNC ---
  useEffect(() => {
    const q = query(collection(db, "ornaments"), orderBy("createdAt", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setOrnaments(liveData)
    })
    return () => unsubscribe()
  }, [])

  // --- FIREBASE WRITE ---
  const handleOrnamentSubmit = async (data) => {
    try {
      await addDoc(collection(db, "ornaments"), {
        position: [tempPos.x, tempPos.y, tempPos.z],
        color: data.color,
        message: data.message,
        textureData: data.textureData || null,
        createdAt: Date.now()
      })
      setIsModalOpen(false)
      setTempPos(null)
    } catch (e) {
      console.error("Error adding document: ", e)
    }
  }

  // --- FIREBASE DELETE (Admin) ---
  const handleDelete = async (id) => {
    if (window.confirm("Delete this ornament?")) {
      await deleteDoc(doc(db, "ornaments", id))
    }
  }

  const handleTreeClick = (worldPoint) => {
    setActiveId(null)
    const localPoint = {
        x: worldPoint.x - TREE_POSITION[0],
        y: worldPoint.y - TREE_POSITION[1],
        z: worldPoint.z - TREE_POSITION[2]
    }
    setTempPos(localPoint)
    setIsModalOpen(true)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      
      <MusicPlayer />
      
      <AdminPanel ornaments={ornaments} onDelete={handleDelete} />

      <Overlay 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleOrnamentSubmit}
        initialPos={tempPos}
      />

      <Canvas 
        camera={{ position: [180, 200, 250], fov: 70 }}
        onPointerMissed={() => setActiveId(null)}
      >
        <fog attach="fog" args={['#050505', 200, 900]} />
        <color attach="background" args={['#050505']} />
        
        <Snow count={2000} />
        <Stars radius={900} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Moon />

        <ambientLight intensity={0.5} />
        <Environment preset="park" />

        <Suspense fallback={null}>
          <group position={TREE_POSITION}> 
            <Tree 
              onTreeClick={handleTreeClick} 
              ornaments={ornaments}
              activeId={activeId}
              setActiveId={setActiveId}
            />
          </group>

          <UnderTreePresents />
          <Ground />
          <BackgroundScenery />

        </Suspense>

        <OrbitControls 
          makeDefault
          enablePan={false}
          enabled={!isModalOpen}
          minDistance={80} 
          maxDistance={400} 
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={0.3}         
        />
      </Canvas>
    </div>
  )
}