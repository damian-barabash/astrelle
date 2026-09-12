import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, ContactShadows } from '@react-three/drei'
import { StudioEnv } from './HeroMug.jsx'

// One of Stasia's plates — the goat drawing is the studio's own.
// meshopt-compressed (173 KB); `false` keeps drei from wiring up a Draco decoder.
const SRC = '/assets/3d/ceramic_plate.glb'

function Model() {
  const spin = useRef()
  const { scene } = useGLTF(SRC, false)
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.3
  })
  // outer group tilts the plate towards the camera, inner one spins it in its own plane
  return (
    <group rotation={[1.02, 0, 0.08]}>
      <group ref={spin} scale={6.7}>
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
    </group>
  )
}

export default function CeramicPlate({ className = '' }) {
  const box = useRef(null)
  const [live, setLive] = useState(false)

  // the canvas (and the model) only starts once the card is actually on screen —
  // on a phone this section sits far below the fold
  useEffect(() => {
    const el = box.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setLive(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLive(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className={`plate ${className}`} ref={box} aria-hidden="true">
      {live && (
        <Canvas camera={{ position: [0, 0, 2.7], fov: 30 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
          <hemisphereLight args={['#fff6ec', '#e7d6c2', 0.5]} />
          <ambientLight intensity={0.25} />
          <directionalLight position={[2.5, 4, 3]} intensity={1.25} color="#fff1de" />
          <directionalLight position={[-3, 1.5, 2]} intensity={0.45} color="#eef3f7" />
          <Suspense fallback={null}>
            <Model />
            <StudioEnv intensity={0.5} />
            <ContactShadows position={[0, -0.72, 0]} opacity={0.18} scale={4} blur={3} far={2} color="#5f7e48" />
          </Suspense>
        </Canvas>
      )}
    </div>
  )
}
