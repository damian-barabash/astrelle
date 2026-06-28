import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, Environment, ContactShadows } from '@react-three/drei'

function Model() {
  const group = useRef()
  const { scene } = useGLTF('/assets/3d/bunny_mug.glb')
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.5
  })
  return (
    <group ref={group} scale={1.85}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

useGLTF.preload('/assets/3d/bunny_mug.glb')

export default function HeroMug() {
  return (
    <Canvas
      camera={{ position: [0, 0.25, 3.05], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      {/* Warm sky / soft clay-toned ground fill — gives the glaze a natural gradient */}
      <hemisphereLight args={['#fff6ec', '#e7d6c2', 0.55]} />
      <ambientLight intensity={0.22} />
      {/* Warm key, upper-front-right — brings out the cream glaze */}
      <directionalLight position={[3.5, 4.5, 3.5]} intensity={1.35} color="#fff1de" />
      {/* Cool soft fill, front-left — lifts the harsh dark speckle pits */}
      <directionalLight position={[-4, 1.5, 2]} intensity={0.5} color="#eef3f7" />
      {/* Back rim — pops the glossy glaze edge off the cream background */}
      <directionalLight position={[-1.5, 3, -4]} intensity={0.7} color="#fffaf3" />
      <Suspense fallback={null}>
        <Model />
        <Environment preset="apartment" environmentIntensity={0.55} />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.22} scale={11} blur={3.4} far={5} color="#5f7e48" />
      </Suspense>
    </Canvas>
  )
}
