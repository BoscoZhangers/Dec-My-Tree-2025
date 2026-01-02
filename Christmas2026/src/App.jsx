import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber' 
import { OrbitControls, Environment, Stars, useGLTF, Loader, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from './firebase' 
import { Tree } from './Tree' 
import { Overlay } from './Overlay' 
import { MusicPlayer } from './MusicPlayer' 
import { NotificationProvider, useNotification } from './NotificationSystem'

const TREE_POSITION = [0, -100, 0] 

// --- HINT TIMER ---
function HintTimer() {
  const { addNotification } = useNotification()
  const [hasFired, setHasFired] = useState(false)

  useFrame(({ clock }) => {
    if (hasFired) return
    if (clock.getElapsedTime() > 13.5) {
      addNotification("Click an empty spot on the tree to hang an ornament", "hint", "intro_hint")
      setHasFired(true)
    }
  })

  return null
}

// --- CAMERA ANIMATOR ---
function CameraAnimator({ controlsRef, onFinish, isReady }) {
  const { width } = useThree((state) => state.size)
  const isMobile = width < 600

  const targetPosition = useMemo(() => {
    return isMobile 
      ? new THREE.Vector3(100, 0, -340) 
      : new THREE.Vector3(80, 0, -240)
  }, [isMobile])

  const targetLookAt = new THREE.Vector3(0, -20, 0); 
  
  const startState = useRef({ 
    pos: new THREE.Vector3(), 
    target: new THREE.Vector3() 
  });
  
  const hasFinishedRef = useRef(false);
  const timeOffset = useRef(null);

  useFrame((state) => {
    if (!controlsRef.current || !isReady) return;

    if (timeOffset.current === null) {
        timeOffset.current = state.clock.getElapsedTime();
    }

    const localTime = state.clock.getElapsedTime() - timeOffset.current;
    const startTime = 8.0; 
    const duration = 5.0;

    if (localTime < startTime) {
      startState.current.pos.copy(state.camera.position);
      startState.current.target.copy(controlsRef.current.target);
      controlsRef.current.update();
      return; 
    }

    let progress = (localTime - startTime) / duration;

    if (progress >= 1) {
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        if (onFinish) onFinish(); 
      }
      return;
    }

    const ease = progress * progress * (3 - 2 * progress);
    
    state.camera.position.lerpVectors(startState.current.pos, targetPosition, ease);
    controlsRef.current.target.lerpVectors(startState.current.target, targetLookAt, ease);
    controlsRef.current.update();
  });

  return null;
}

// --- STANDARD COMPONENTS ---
function AdminPanel({ ornaments, onDelete }) {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true'
  if (!isAdmin) return null
  return (
    <div style={{ position: 'absolute', top: 20, right: 20, width: '300px', maxHeight: '80vh', overflowY: 'auto', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px', borderRadius: '8px', zIndex: 1000, border: '1px solid #444' }}>
      <h3 style={{ marginTop: 0 }}>🎄 Admin Moderation</h3>
      <p style={{ fontSize: '12px', color: '#aaa' }}>{ornaments.length} ornaments active</p>
      {ornaments.map((orn) => (
        <div key={orn.id} style={{ borderBottom: '1px solid #333', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{orn.message || "No message"}</div>
            <div style={{ fontSize: '10px', color: '#888' }}>Color: <span style={{ color: orn.color }}>●</span> {orn.id.slice(0, 8)}...</div>
          </div>
          <button onClick={() => onDelete(orn.id)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Del</button>
        </div>
      ))}
    </div>
  )
}

function Moon() {
  return (
    <group position={[50, 400, -600]}>
      <mesh><sphereGeometry args={[30, 32, 32]} /><meshBasicMaterial color="#fffec4" /></mesh>
      <mesh scale={[1.2, 1.2, 1.2]}><sphereGeometry args={[30, 32, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.15} depthWrite={false} /></mesh>
    </group>
  )
}

function UnderTreePresents() {
  const { scene } = useGLTF('/presents.glb')
  const piles = useMemo(() => {
    return new Array(5).fill(0).map((_, i) => {
      const angle = (i / 5) * Math.PI * 2 + (Math.random() * 0.5)
      const radius = 25 + Math.random() * 10
      return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, rotationY: Math.random() * Math.PI * 2, scale: 15 + Math.random() * 5 }
    })
  }, [])
  return (
    <group position={TREE_POSITION}>
      {piles.map((pile, i) => (
        <primitive key={i} object={scene.clone()} position={[pile.x, 0, pile.z]} rotation={[0, pile.rotationY, 0]} scale={[pile.scale, pile.scale, pile.scale]} raycast={() => null} />
      ))}
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -102, 0]} receiveShadow>
      <circleGeometry args={[2000, 64]} />
      <meshStandardMaterial color="#cfdae3" roughness={0.8} metalness={0.1} />
    </mesh>
  )
}

function BackgroundScenery({ count = 150 }) {
  const items = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 350 + Math.random() * 650 

      temp.push({ 
        x: Math.cos(angle) * radius, 
        z: Math.sin(angle) * radius, 
        scale: 1 + Math.random() * 2, 
        type: Math.random() > 0.5 ? 'tree' : 'rock', 
        id: i,
        rotation: [Math.random(), Math.random(), Math.random()] 
      })
    }
    return temp
  }, [count])

  return (
    <group position={[0, -100, 0]}>
      {items.map((item) => (
        <group key={item.id} position={[item.x, 0, item.z]} scale={[item.scale, item.scale, item.scale]}>
          {item.type === 'tree' ? (
            <group>
               <mesh position={[0, 10, 0]}><cylinderGeometry args={[2, 2, 20]} /><meshStandardMaterial color="#4a3c31" /></mesh>
               <mesh position={[0, 30, 0]}><coneGeometry args={[15, 40, 4]} /><meshStandardMaterial color="#1a472a" roughness={0.8} /></mesh>
            </group>
          ) : (
            <mesh position={[0, 5, 0]} rotation={item.rotation}>
                <dodecahedronGeometry args={[10, 0]} />
                <meshStandardMaterial color="#888" roughness={0.9} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

function Snow({ count = 1000 }) {
  const points = useRef()
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
    const context = canvas.getContext('2d'); context.beginPath(); context.arc(32, 32, 30, 0, 2 * Math.PI); context.fillStyle = '#ffffff'; context.fill();
    return new THREE.CanvasTexture(canvas)
  }, [])
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // X and Z: Spread
      positions[i * 3] = (Math.random() - 0.5) * 800; 
      
      // FIX: INITIAL SPAWN RANGE = Total Recycle Distance (900)
      // This ensures that when the first flake hits bottom, the last flake is exactly at the top.
      // Range: 200 (Start) to 1100 (End). 
      positions[i * 3 + 1] = 200 + Math.random() * 900; 
      
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;
    }
    return positions
  }, [count])

  useFrame((state) => {
    const { clock } = state
    if (!points.current) return

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Speed
      points.current.geometry.attributes.position.array[i3 + 1] -= 0.7 + Math.random() * 0.3
      // Wobble
      points.current.geometry.attributes.position.array[i3] += Math.sin(clock.elapsedTime + points.current.geometry.attributes.position.array[i3]) * 0.05
      
      // FIX: RECYCLE LOGIC
      // If < -200, move to +700.
      // The distance (700 - -200) is 900, which matches our spawn range above.
      if (points.current.geometry.attributes.position.array[i3 + 1] < -200) {
        points.current.geometry.attributes.position.array[i3 + 1] = 700; 
        points.current.geometry.attributes.position.array[i3] = (Math.random() - 0.5) * 800; 
        points.current.geometry.attributes.position.array[i3 + 2] = (Math.random() - 0.5) * 800;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points} raycast={() => null} frustumCulled={false}> 
      <bufferGeometry><bufferAttribute attach="attributes-position" count={particlesPosition.length / 3} array={particlesPosition} itemSize={3} /></bufferGeometry>
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
  const [isLocked, setIsLocked] = useState(true)
  
  // STATE: Controls when snow STARTS falling (Mounts component)
  const [snowing, setSnowing] = useState(false)

  const { active } = useProgress()
  const isReady = !active

  const controlsRef = useRef()

  useEffect(() => {
    const q = query(collection(db, "ornaments"), orderBy("createdAt", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrnaments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

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
    } catch (e) { console.error("Error adding document: ", e) }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Delete this ornament?")) await deleteDoc(doc(db, "ornaments", id))
  }

  const handleTreeClick = (worldPoint) => {
    if (isLocked) return; 
    setActiveId(null)
    setTempPos({ x: worldPoint.x - TREE_POSITION[0], y: worldPoint.y - TREE_POSITION[1], z: worldPoint.z - TREE_POSITION[2] })
    setIsModalOpen(true)
  }

  return (
    <NotificationProvider>
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <MusicPlayer />
        <AdminPanel ornaments={ornaments} onDelete={handleDelete} />
        <Overlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleOrnamentSubmit} initialPos={tempPos} />

        <Canvas camera={{ position: [-180, 200, -250], fov: 70 }} onPointerMissed={() => setActiveId(null)}>
          <fog attach="fog" args={['#050505', 200, 900]} />
          <color attach="background" args={['#050505']} />
          
          <CameraAnimator controlsRef={controlsRef} onFinish={() => setIsLocked(false)} isReady={isReady} />
          
          <HintTimer />

          {/* TRIGGER: Snow starts falling immediately from Top when triggered */}
          {snowing && <Snow count={1000} />}
          
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
                startEnabled={isReady}
                onHalfWay={() => setSnowing(true)} 
              />
            </group>
            <UnderTreePresents />
            <Ground />
            <BackgroundScenery />
          </Suspense>

          <OrbitControls ref={controlsRef} makeDefault enablePan={false} enabled={!isModalOpen && !isLocked} minDistance={80} maxDistance={400} maxPolarAngle={Math.PI / 2} minPolarAngle={0.6} />
        </Canvas>

        <Loader 
          containerStyles={{ background: '#050505' }}
          innerStyles={{ width: '300px', background: '#333' }}
          barStyles={{ background: '#FFD700', height: '10px' }}
          dataStyles={{ fontSize: '14px', fontFamily: 'Arial', color: '#FFD700' }}
        />
      </div>
    </NotificationProvider>
  )
}
