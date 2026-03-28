import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * SwipeableTarget — A large number that responds to horizontal swipes.
 * Swipe LEFT to increase, RIGHT to decrease.
 * Spring animation on change, subtle color shift based on value.
 *
 * Props:
 *   value: current number
 *   onChange: (newValue) => void
 *   onCommit: () => void (called when swipe ends)
 *   min: minimum value (default 100)
 *   max: maximum value (default 300)
 *   step: change per pixel dragged (default 0.15)
 *   unit: label (default 'lbs')
 */
export default function SwipeableTarget({
  value,
  onChange,
  onCommit,
  min = 100,
  max = 300,
  step = 0.15,
  unit = 'lbs',
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [springOffset, setSpringOffset] = useState(0)
  const startXRef = useRef(0)
  const startValueRef = useRef(value)
  const containerRef = useRef(null)

  // Warmth: map value range to a hue (cool sage → warm gold)
  const range = max - min
  const ratio = Math.max(0, Math.min(1, (value - min) / range))
  // Subtle background: from cool sage (#e7f0eb) to warm cream (#f5efe6)
  const bgR = Math.round(231 + ratio * (245 - 231))
  const bgG = Math.round(240 + ratio * (239 - 240))
  const bgB = Math.round(235 + ratio * (230 - 235))
  const bgColor = `rgb(${bgR}, ${bgG}, ${bgB})`

  // Text color: sage → warm
  const textColor = ratio > 0.6 ? '#8b6914' : '#4f645b'

  const handleStart = useCallback((clientX) => {
    setIsDragging(true)
    startXRef.current = clientX
    startValueRef.current = value
  }, [value])

  const handleMove = useCallback((clientX) => {
    if (!isDragging) return
    const deltaX = startXRef.current - clientX // Inverted: left = increase
    const deltaValue = Math.round(deltaX * step)
    const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaValue))
    onChange(newValue)
    setSpringOffset(deltaX * 0.03) // Subtle spring offset
  }, [isDragging, step, min, max, onChange])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setSpringOffset(0)
    onCommit?.()
  }, [onCommit])

  // Mouse events
  const onMouseDown = (e) => { e.preventDefault(); handleStart(e.clientX) }

  useEffect(() => {
    if (!isDragging) return
    const onMouseMove = (e) => handleMove(e.clientX)
    const onMouseUp = () => handleEnd()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging, handleMove, handleEnd])

  // Touch events
  const onTouchStart = (e) => handleStart(e.touches[0].clientX)
  const onTouchMove = (e) => { e.preventDefault(); handleMove(e.touches[0].clientX) }
  const onTouchEnd = () => handleEnd()

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        textAlign: 'right',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      <p style={{
        color: '#5f5f5c', fontSize: '14px', fontWeight: 500,
        margin: '0 0 4px',
      }}>Target</p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        background: bgColor,
        padding: '8px 16px', borderRadius: '16px',
        transition: isDragging ? 'none' : 'background 0.4s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: `translateX(${springOffset}px) scale(${isDragging ? 1.05 : 1})`,
      }}>
        <span style={{
          fontSize: '28px', fontWeight: 800, color: textColor,
          transition: isDragging ? 'none' : 'color 0.4s ease',
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>
        <span style={{
          fontSize: '14px', fontWeight: 500, color: textColor,
          opacity: 0.7,
        }}>{unit}</span>
      </div>
      {/* Swipe hint */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: '4px', marginTop: '6px',
        opacity: isDragging ? 0 : 0.5,
        transition: 'opacity 0.3s ease',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#787c77' }}>swipe</span>
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#787c77' }}>swipe to adjust</span>
      </div>
    </div>
  )
}
