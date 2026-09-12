// 3D pipeline for Astrelle: make every .glb tiny enough to load fast on a phone.
//
//   raw model  →  weld + simplify (meshoptimizer)
//              →  textures: normal/roughness 512, base colour 1024, all WebP
//              →  EXT_meshopt_compression + KHR_mesh_quantization
//
// Meshopt (not Draco) on purpose: the decoder ships inside the bundle with
// three-stdlib (~22 KB), so nothing is fetched from a CDN at runtime. The site
// loads these with `useGLTF(url, false)` — the `false` turns Draco off, which
// otherwise points a DRACOLoader at gstatic.com.
//
// Run: npm run glb            (uses npx, no dependency added to the project)
// Sources live outside git; only the optimised files in public/assets/3d/ ship.
import { execFileSync } from 'node:child_process'
import { existsSync, statSync, mkdirSync, copyFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'media-src/3d') // raw models, kept out of git
const OUT_DIR = path.join(ROOT, 'public/assets/3d')
const CLI = ['--yes', '@gltf-transform/cli@4']

// [source, output name, target ratio of vertices to keep, simplification error]
const MODELS = [
  ['ceramic_plate_15cm.glb', 'ceramic_plate.glb', 0.08, 0.002],
  ['rabbit_mug.glb', 'rabbit_mug.glb', 0.3, 0.001],
]

const kb = (f) => `${(statSync(f).size / 1024).toFixed(1)} KB`
const run = (args) => execFileSync('npx', [...CLI, ...args], { stdio: ['ignore', 'ignore', 'inherit'] })

for (const [srcName, name, ratio, error] of MODELS) {
  const src = path.join(SRC_DIR, srcName)
  if (!existsSync(src)) {
    console.warn(`skip ${name}: ${src} not found`)
    continue
  }
  const tmp = path.join(os.tmpdir(), `astrelle-glb-${process.pid}-${name}`)
  mkdirSync(path.dirname(tmp), { recursive: true })
  const step = (i) => `${tmp}.${i}.glb`
  copyFileSync(src, step(0))

  run(['dedup', step(0), step(1)])
  run(['weld', step(1), step(2)])
  run(['simplify', step(2), step(3), '--ratio', String(ratio), '--error', String(error)])
  // shading maps carry low-frequency detail — half resolution is invisible here
  run(['resize', step(3), step(4), '--pattern', '*normal*', '--width', '512', '--height', '512'])
  run(['resize', step(4), step(5), '--pattern', '*orm*', '--width', '512', '--height', '512'])
  run(['resize', step(5), step(6), '--width', '1024', '--height', '1024'])
  run(['webp', step(6), step(7), '--quality', '82'])
  run(['prune', step(7), step(8)])
  run(['meshopt', step(8), step(9), '--level', 'high'])

  mkdirSync(OUT_DIR, { recursive: true })
  const out = path.join(OUT_DIR, name)
  copyFileSync(step(9), out)
  console.log(`glb → ${name}  ${kb(src)} → ${kb(out)}`)
  for (let i = 0; i <= 9; i++) rmSync(step(i), { force: true })
}
console.log('done.')
