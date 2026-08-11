import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ParticleSceneProps {
  mobile?: boolean
  monolithActive?: boolean
}

export function ParticleScene({ mobile = false, monolithActive = false }: ParticleSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const emberCount = mobile ? 40 : 80
    const dustCount = mobile ? 15 : 30

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    const makePoints = (count: number, color: number, size: number, opacity: number) => {
      const positions = new Float32Array(count * 3)
      const velocities = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2
        positions[i * 3 + 2] = 0
        velocities[i * 3] = (Math.random() - 0.5) * 0.001
        velocities[i * 3 + 1] = 0.0004 + Math.random() * 0.0008
        velocities[i * 3 + 2] = 0
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const material = new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false })
      const points = new THREE.Points(geometry, material)
      return { points, velocities, geometry }
    }

    const embers = makePoints(emberCount, 0xff4800, 0.04, 0.6)
    const dust = makePoints(dustCount, 0xc8b8ff, 0.02, 0.3)
    scene.add(embers.points, dust.points)

    const dustAngles = new Float32Array(dustCount)
    for (let i = 0; i < dustCount; i++) dustAngles[i] = Math.random() * Math.PI * 2

    let raf = 0

    const animate = () => {
      const ePos = embers.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < emberCount; i++) {
        ePos.array[i * 3] += embers.velocities[i * 3]
        ePos.array[i * 3 + 1] += embers.velocities[i * 3 + 1]
        if (ePos.array[i * 3 + 1] > 1.1) {
          ePos.array[i * 3] = (Math.random() - 0.5) * 2
          ePos.array[i * 3 + 1] = -1.1
        }
      }
      ePos.needsUpdate = true

      const dPos = dust.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < dustCount; i++) {
        dustAngles[i] += 0.008
        const cx = monolithActive ? 0 : (Math.random() - 0.5) * 0.3
        const cy = -0.15
        const r = 0.12 + (i % 5) * 0.02
        dPos.array[i * 3] = cx + Math.cos(dustAngles[i] + i) * r
        dPos.array[i * 3 + 1] = cy + Math.sin(dustAngles[i] * 2 + i) * r * 0.5
      }
      dPos.needsUpdate = true

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      embers.geometry.dispose()
      ;(embers.points.material as THREE.Material).dispose()
      dust.geometry.dispose()
      ;(dust.points.material as THREE.Material).dispose()
      renderer.dispose()
    }
  }, [mobile, monolithActive])

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}
    />
  )
}
