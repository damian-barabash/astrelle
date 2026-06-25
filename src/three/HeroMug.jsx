import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, Environment, ContactShadows } from '@react-three/drei'

function Model() {
  const group = useRef()
  const { scene } = useGLTF('/assets/3d/id_1.glb')
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.5
  })
  return (
    <group ref={group} scale={2.5}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

useGLTF.preload('/assets/3d/id_1.glb')

export default function HeroMug() {
  return (
    <Canvas
      camera={{ position: [0, 0.25, 3.05], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <directionalLight position={[-4, 2, -2]} intensity={0.35} />
      <Suspense fallback={null}>
        <Model />
        <Environment preset="city" />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.26} scale={11} blur={3} far={5} color="#5f7e48" />
      </Suspense>
    </Canvas>
  )
}
