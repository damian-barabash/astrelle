import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

const H = 36 // height segments
const R = 56 // radial segments
const TOP = 1.15
const BOT = -1.15
const RMIN = 0.16
const RMAX = 1.05

function baseProfile() {
  // a gentle thrown-vessel silhouette
  const p = new Float32Array(H + 1)
  for (let i = 0; i <= H; i++) {
    const t = i / H // 0 bottom → 1 top
    p[i] = 0.55 + 0.32 * Math.sin(t * Math.PI * 0.92) - 0.12 * t
  }
  return p
}

function Pot({ resetSignal, glazed }) {
  const meshRef = useRef()
  const matRef = useRef()
  const discRef = useRef()
  const profile = useRef(baseProfile())
  const drag = useRef({ active: false, lastX: 0 })
  const RAW = new THREE.Color('#c08a5e')
  const GLAZE = new THREE.Color('#84a867')

  // build an indexed geometry once; we only rewrite the position buffer
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const verts = (H + 1) * (R + 1) + 1 // wall grid + bottom center
    const positions = new Float32Array(verts * 3)
    const indices = []
    // wall faces
    for (let i = 0; i < H; i++) {
      for (let j = 0; j < R; j++) {
        const a = i * (R + 1) + j
        const b = a + (R + 1)
        indices.push(a, b, a + 1, a + 1, b, b + 1)
      }
    }
    // bottom cap (fan to center vertex)
    const center = (H + 1) * (R + 1)
    for (let j = 0; j < R; j++) {
      indices.push(center, j + 1, j)
    }
    // parametric UVs so throwing-mark texture reveals the spin
    const uvs = new Float32Array(verts * 2)
    for (let i = 0; i <= H; i++) {
      for (let j = 0; j <= R; j++) {
        const k = i * (R + 1) + j
        uvs[k * 2] = j / R
        uvs[k * 2 + 1] = i / H
      }
    }
    const ci = (H + 1) * (R + 1)
    uvs[ci * 2] = 0.5
    uvs[ci * 2 + 1] = 0
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    g.setIndex(indices)
    return g
  }, [])

  // faint vertical throwing marks → the spin becomes visible on the surface
  const streak = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 128
    const x = c.getContext('2d')
    x.fillStyle = '#ffffff'
    x.fillRect(0, 0, 512, 128)
    x.strokeStyle = '#6f5f4a'
    for (let i = 0; i < 60; i++) {
      const px = Math.random() * 512
      x.globalAlpha = 0.05 + Math.random() * 0.12
      x.lineWidth = 0.5 + Math.random() * 1.6
      x.beginPath()
      x.moveTo(px, 0)
      x.lineTo(px + (Math.random() * 6 - 3), 128)
      x.stroke()
    }
    const tx = new THREE.CanvasTexture(c)
    tx.wrapS = THREE.RepeatWrapping
    tx.wrapT = THREE.RepeatWrapping
    tx.repeat.set(2, 1)
    return tx
  }, [])

  const rebuild = () => {
    const pos = geom.attributes.position.array
    const p = profile.current
    for (let i = 0; i <= H; i++) {
      const y = BOT + (TOP - BOT) * (i / H)
      const rad = p[i]
      for (let j = 0; j <= R; j++) {
        const ang = (j / R) * Math.PI * 2
        const o = (i * (R + 1) + j) * 3
        pos[o] = Math.cos(ang) * rad
        pos[o + 1] = y
        pos[o + 2] = Math.sin(ang) * rad
      }
    }
    const c = (H + 1) * (R + 1) * 3
    pos[c] = 0
    pos[c + 1] = BOT
    pos[c + 2] = 0
    geom.attributes.position.needsUpdate = true
    geom.computeVertexNormals()
  }

  useMemo(rebuild, [geom])

  useEffect(() => {
    profile.current = baseProfile()
    rebuild()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.9
    if (discRef.current) discRef.current.rotation.y += dt * 0.9
    if (matRef.current) {
      matRef.current.color.lerp(glazed ? GLAZE : RAW, 0.08)
      matRef.current.roughness += ((glazed ? 0.32 : 0.82) - matRef.current.roughness) * 0.08
      matRef.current.metalness += ((glazed ? 0.18 : 0.04) - matRef.current.metalness) * 0.08
    }
  })

  const onDown = (e) => {
    e.stopPropagation()
    drag.current.active = true
    drag.current.lastX = e.clientX
    e.target.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.lastX
    drag.current.lastX = e.clientX
    // height index from the local intersection point
    const t = THREE.MathUtils.clamp((e.point.y - BOT) / (TOP - BOT), 0, 1)
    const idx = Math.round(t * H)
    const sigma = H * 0.07
    const p = profile.current
    for (let k = 0; k <= H; k++) {
      const w = Math.exp(-((k - idx) ** 2) / (2 * sigma * sigma))
      p[k] = THREE.MathUtils.clamp(p[k] + dx * 0.006 * w, RMIN, RMAX)
    }
    rebuild()
  }
  const onUp = (e) => {
    drag.current.active = false
    e.target.releasePointerCapture?.(e.pointerId)
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geom}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <meshStandardMaterial ref={matRef} map={streak} color="#c08a5e" roughness={0.82} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>
      {/* spinning potter's wheel — spokes make the rotation visible */}
      <group ref={discRef}>
        <mesh position={[0, -1.34, 0]}>
          <cylinderGeometry args={[1.55, 1.6, 0.18, 56]} />
          <meshStandardMaterial color="#6b5641" roughness={0.7} metalness={0.1} />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 1.05, -1.24, Math.sin(a) * 1.05]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.62, 0.05, 0.09]} />
              <meshStandardMaterial color="#52412f" roughness={0.8} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export default function ClaySculpt({ resetSignal, glazed }) {
  return (
    <Canvas
      camera={{ position: [0, 0.7, 5.0], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', cursor: 'grab' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} />
      <directionalLight position={[-3, 1, -2]} intensity={0.3} />
      <Suspense fallback={null}>
        <Pot resetSignal={resetSignal} glazed={glazed} />
        <Environment preset="apartment" />
      </Suspense>
    </Canvas>
  )
}
