import { useEffect, useRef } from 'react'

/**
 * Confetti canvas animation.
 * Renders confetti particles that fall and fade over ~3 seconds.
 * 
 * Usage: <Confetti trigger={true} />
 */
export default function Confetti({ trigger }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!trigger) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#4f645b', '#d1e8dd', '#ff9900', '#e7fef3', '#a73b21', '#43574f', '#f3f4ef', '#FFD700']
    const particles = []

    // Create 80 particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1, // Start above screen
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      })
    }

    let frame = 0
    const maxFrames = 180 // ~3 seconds at 60fps

    const animate = () => {
      if (frame >= maxFrames) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05 // gravity
        p.rotation += p.rotationSpeed
        p.opacity = Math.max(0, 1 - frame / maxFrames)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      frame++
      requestAnimationFrame(animate)
    }

    animate()
  }, [trigger])

  if (!trigger) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
