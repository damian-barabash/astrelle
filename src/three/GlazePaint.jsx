import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { potGeometry } from './potProfile.js'

const BASE = '#d9cdbd' // unglazed clay
const W = 1024
const H = 512

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function Vessel({ colorRef, resetSignal, shape, tool }) {
  const geom = useMemo(() => potGeometry(shape, 120), [shape])
  const painting = useRef(false)

  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return { canvas, ctx, texture }
  }, [])

  const fillBase = () => {
    ctx.fillStyle = BASE
    ctx.fillRect(0, 0, W, H)
    texture.needsUpdate = true
  }
  useEffect(fillBase, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    fillBase()
  }, [resetSignal, shape]) // eslint-disable-line react-hooks/exhaustive-deps

  const stampAt = (x, y) => {
    const { r, g, b } = hexToRgb(colorRef.current)
    const rad = 32
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad)
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`)
    grad.addColorStop(0.62, `rgba(${r},${g},${b},1)`)
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`) // same colour, fades out → no dark ring
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, rad, 0, Math.PI * 2)
    ctx.fill()
  }
  const stamp = (u, v) => {
    const x = u * W
    const y = (1 - v) * H
    stampAt(x, y)
    stampAt(x - W, y) // wrap the seam
    stampAt(x + W, y)
    texture.needsUpdate = true
  }

  const onDown = (e) => {
    if (tool !== 'brush') return
    e.stopPropagation()
    painting.current = true
    if (e.uv) stamp(e.uv.x, e.uv.y)
    e.target.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    if (tool === 'brush' && painting.current && e.uv) stamp(e.uv.x, e.uv.y)
  }
  const onUp = (e) => {
    painting.current = false
    e.target.releasePointerCapture?.(e.pointerId)
  }

  return (
    <mesh geometry={geom} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.5} metalness={0.06} />
    </mesh>
  )
}

export default function GlazePaint({ colorRef, resetSignal, shape, tool }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 4.2], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ cursor: tool === 'hand' ? 'grab' : 'crosshair' }}
    >
      <ambientLight intensity={0.78} />
      <directionalLight position={[3, 5, 4]} intensity={1.05} />
      <directionalLight position={[-3, 1, -2]} intensity={0.3} />
      <Suspense fallback={null}>
        <Vessel colorRef={colorRef} resetSignal={resetSignal} shape={shape} tool={tool} />
        <Environment preset="apartment" />
      </Suspense>
      <OrbitControls
        enabled={tool === 'hand'}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.8}
      />
    </Canvas>
  )
}
