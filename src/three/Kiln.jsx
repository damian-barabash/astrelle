import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { potGeometry } from './potProfile.js'

// raw clay → bisque → glaze, driven by `heat` (0..1) lifted to the parent.
const RAW = new THREE.Color('#b7b1a3')
const BISQUE = new THREE.Color('#c08a5e')
const GLAZE = new THREE.Color('#84a867')

function Vessel({ heatRef }) {
  const geom = useMemo(() => potGeometry(96), [])
  const mat = useRef()
  const mesh = useRef()
  const light = useRef()
  useFrame(() => {
    const h = heatRef.current
    const c = mat.current.color
    if (h < 0.5) c.copy(RAW).lerp(BISQUE, h / 0.5)
    else c.copy(BISQUE).lerp(GLAZE, (h - 0.5) / 0.5)
    mat.current.roughness = 0.92 - 0.55 * Math.max(0, (h - 0.5) / 0.5)
    mat.current.metalness = 0.04 + 0.12 * Math.max(0, (h - 0.5) / 0.5)
    if (mesh.current) mesh.current.rotation.y += 0.004
    if (light.current) light.current.intensity = 0.2 + h * 2.6
  })
  return (
    <group>
      <mesh ref={mesh} geometry={geom}>
        <meshStandardMaterial ref={mat} side={THREE.DoubleSide} roughness={0.92} metalness={0.04} />
      </mesh>
      <pointLight ref={light} position={[0, -0.2, 1.2]} color="#ff7a2f" distance={6} />
    </group>
  )
}

function Embers({ heatRef }) {
  const ref = useRef()
  const N = 70
  const { pos, seed } = useMemo(() => {
    const pos = new Float32Array(N * 3)
    const seed = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.sin(i * 12.9) ) * 1.1
      pos[i * 3 + 1] = -1.2 + (i / N) * 2.6
      pos[i * 3 + 2] = (Math.cos(i * 7.7)) * 1.1
      seed[i] = (i % 10) / 10
    }
    return { pos, seed }
  }, [])
  useFrame((_, dt) => {
    if (!ref.current) return
    const h = heatRef.current
    const arr = ref.current.geometry.attributes.position.array
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += dt * (0.3 + h * 1.4) * (0.4 + seed[i])
      if (arr[i * 3 + 1] > 1.5) arr[i * 3 + 1] = -1.2
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.material.opacity = h * 0.9
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={N} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ff8a3d" transparent opacity={0} depthWrite={false} />
    </points>
  )
}

export default function Kiln({ heatRef }) {
  return (
    <Canvas camera={{ position: [0, 0.2, 4.2], fov: 32 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} />
      <Suspense fallback={null}>
        <Vessel heatRef={heatRef} />
        <Embers heatRef={heatRef} />
        <Environment preset="apartment" />
      </Suspense>
    </Canvas>
  )
}
