import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber' 
import { OrbitControls, Environment, Stars, useGLTF, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from './firebase' 
import { Tree } from './Tree' 
import { Overlay } from './Overlay' 
import { MusicPlayer } from './MusicPlayer' 
import { NotificationProvider, useNotification } from './NotificationSystem'
import { pipeline, env } from '@xenova/transformers';

// --- CONFIGURATION ---
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = false; 

const TREE_POSITION = [0, -100, 0] 

// --- CUSTOM LOADER (Updated with Button) ---
function CustomLoader({ progress, fading, onStart }) {
  const isFinished = progress >= 100

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: '#050505',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, 
      transition: 'opacity 1s ease-out',
      opacity: fading ? 0 : 1,
      pointerEvents: 'none' // Container ignores clicks
    }}>
      <div style={{ 
        width: '120px', height: '120px', 
        backgroundImage: 'url(/tree-favicon.svg)', 
        backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain',
        marginBottom: '20px', opacity: 0.9
      }} />

      <h1 style={{
        color: '#ffffff', fontFamily: 'sans-serif', fontSize: '14px',           
        fontWeight: '600', letterSpacing: '0.3em', textTransform: 'uppercase', 
        margin: '0 0 25px 0', opacity: 0.8
      }}>
        Dec My Tree 2025
      </h1>

      {/* CONDITIONAL: Show Bar if loading, Show Button if finished */}
      {!isFinished ? (
        <>
          <div style={{ width: '200px', height: '2px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', background: '#FFD700', width: `${progress}%`, transition: 'width 0.1s linear'
            }} />
          </div>
          <div style={{ marginTop: '12px', color: '#666', fontFamily: 'monospace', fontSize: '12px' }}>
            {progress.toFixed(0)}%
          </div>
        </>
      ) : (
        <button 
          onClick={onStart}
          style={{
            marginTop: '10px',
            padding: '12px 35px',
            background: 'transparent',
            border: '1px solid #FFD700',
            color: '#FFD700',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            pointerEvents: 'auto', // Button MUST accept clicks
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#FFD700'
            e.target.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.color = '#FFD700'
          }}
        >
          Enter
        </button>
      )}
    </div>
  )
}

// --- HINT TIMER ---
function HintTimer({ isReady }) {
  const { addNotification } = useNotification()
  const [hasFired, setHasFired] = useState(false)
  const startTime = useRef(null) 

  useFrame(({ clock }) => {
    if (hasFired || !isReady) return
    if (startTime.current === null) startTime.current = clock.getElapsedTime()
    if (clock.getElapsedTime() - startTime.current > 13.5) {
      addNotification("Click an empty spot on the tree to hang an ornament", "hint", "intro_hint")
      setHasFired(true)
    }
  })
  return null
}

// --- CAMERA ANIMATOR ---
function CameraAnimator({ controlsRef, onFinish, shouldStart }) { 
  const { width } = useThree((state) => state.size)
  const isMobile = width < 600

  const targetPosition = useMemo(() => {
    return isMobile 
      ? new THREE.Vector3(100, 0, -340) 
      : new THREE.Vector3(80, 0, -240)
  }, [isMobile])

  const targetLookAt = new THREE.Vector3(0, -20, 0); 
  const startState = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() });
  const hasFinishedRef = useRef(false);
  const timeOffset = useRef(null);

  useFrame((state) => {
    if (!controlsRef.current || !shouldStart) return;

    if (timeOffset.current === null) {
        timeOffset.current = state.clock.getElapsedTime();
        startState.current.pos.copy(state.camera.position);
        startState.current.target.copy(controlsRef.current.target);
    }

    const localTime = state.clock.getElapsedTime() - timeOffset.current;
    
    const duration = 5.0;

    let progress = localTime / duration;

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

function AdminPanel({ ornaments, onDelete }) {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true'
  if (!isAdmin) return null
  return (
    <div style={{ 
      position: 'absolute', 
      top: 20, 
      right: 20, 
      width: '300px', 
      maxHeight: '80vh', 
      overflowY: 'auto', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      zIndex: 1000, 
      border: '1px solid #444',
      
      // --- NEW SCROLLBAR STYLES ---
      scrollbarWidth: 'thin',             // Makes scrollbar thinner (Firefox/Chrome)
      scrollbarColor: '#666 transparent'  // Thumb color (grey) | Track color (transparent)
    }}>
      <h3 style={{ marginTop: 0 }}>🔧 Admin Moderation</h3>
      <p style={{ fontSize: '12px', marginTop: -15, color: '#aaa' }}>{ornaments.length} active ornaments </p>
      {ornaments.map((orn) => (
        <div key={orn.id} style={{ borderBottom: '1px solid #333', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ flex: 1, minWidth: 0, marginRight: '10px' }}>
            <div style={{ 
                fontWeight: 'bold', 
                fontSize: '14px',
                whiteSpace: 'pre-wrap',    
                wordWrap: 'break-word',    
                overflowWrap: 'break-word' 
            }}>
                {orn.message || "No message"}
            </div>
            
            <div style={{ fontSize: '10px', color: '#888' }}>ID: {orn.id.slice(0, 8)}...</div>
          </div>

          <button onClick={() => onDelete(orn.id)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}>Remove</button>
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
      positions[i * 3] = (Math.random() - 0.5) * 800; 
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
      points.current.geometry.attributes.position.array[i3 + 1] -= 0.7 + Math.random() * 0.3
      points.current.geometry.attributes.position.array[i3] += Math.sin(clock.elapsedTime + points.current.geometry.attributes.position.array[i3]) * 0.05
      
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

// --- SCENE CONTENT ---
function SceneContent() {
  const [ornaments, setOrnaments] = useState([]) 
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tempPos, setTempPos] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [isLocked, setIsLocked] = useState(true)
  const [snowing, setSnowing] = useState(false)

  const [introFinished, setIntroFinished] = useState(false) 

  const classifierRef = useRef(null); 
  const { addNotification } = useNotification(); 
  const controlsRef = useRef()
  
  // --- LOADING LOGIC ---
  const { progress: realProgress } = useProgress()
  const [visualProgress, setVisualProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const timeProgress = Math.min((elapsed / 2000) * 100, 100)
      const actualVisual = Math.min(timeProgress, realProgress)
      
      setVisualProgress(actualVisual)

      if (actualVisual >= 100) {
        clearInterval(interval)
        // REMOVED AUTOMATIC FADING
        // We now wait for the user to click "ENTER"
      }
    }, 16) 

    return () => clearInterval(interval)
  }, [realProgress]) 

  // New handler for the button click
  const handleStart = () => {
    setFading(true)
    setTimeout(() => {
      setLoaded(true)
    }, 1000)
  }

  const isReady = loaded 

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading AI Model...")
        classifierRef.current = await pipeline('text-classification', 'Xenova/toxic-bert');
        console.log("AI Model Ready")
      } catch (err) {
        console.error("Failed to load AI model", err);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "ornaments"), orderBy("createdAt", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrnaments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  const handleOrnamentSubmit = async (data) => {
    if (!data.message || data.message.trim().length === 0) return;

    if (classifierRef.current) {
        try {
            const results = await classifierRef.current(data.message);
            const topResult = results[0];
            
            if (topResult.label === 'toxic' && topResult.score > 0.7) {
                addNotification("Message flagged as inappropriate by AI. Please be friendly!", "error", "inappropriate");
                return; 
            }
        } catch (e) {
            console.warn("AI Check skipped due to error", e);
        }
    }

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
      addNotification("Ornament hung successfully!", "success", "successful_hang")
    } catch (e) { 
      console.error("Error adding document: ", e)
      addNotification("Error hanging ornament", "error", "unknown error")
    }
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
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        
        {isReady && <MusicPlayer />}
        {isReady && <AdminPanel ornaments={ornaments} onDelete={handleDelete} />}
        
        <Overlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleOrnamentSubmit} initialPos={tempPos} />

        <Canvas camera={{ position: [-180, 200, -250], fov: 70 }} onPointerMissed={() => setActiveId(null)}>
          <fog attach="fog" args={['#050505', 200, 900]} />
          <color attach="background" args={['#050505']} />
          
          <CameraAnimator controlsRef={controlsRef} onFinish={() => setIsLocked(false)} shouldStart={introFinished} />
          <HintTimer isReady={isReady} />

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
                onAnimationComplete={() => setIntroFinished(true)}
              />
            </group>
            <UnderTreePresents />
            <Ground />
            <BackgroundScenery />
          </Suspense>

          <OrbitControls ref={controlsRef} makeDefault enablePan={false} enabled={!isModalOpen && !isLocked} minDistance={80} maxDistance={400} maxPolarAngle={Math.PI / 2} minPolarAngle={0.6} />
        </Canvas>

        {/* LOADING SCREEN: Replaced direct props with state driven props */}
        {!loaded && (
            <CustomLoader 
                progress={visualProgress} 
                fading={fading} 
                onStart={handleStart} // Pass the click handler
            />
        )}
    </div>
  )
}

export default function App() {
  return (
    <NotificationProvider>
      <SceneContent />
    </NotificationProvider>
  )
}