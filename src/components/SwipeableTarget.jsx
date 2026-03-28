import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * SwipeableTarget — A large number that responds to horizontal swipes.
 * Swipe LEFT to increase, RIGHT to decrease.
 * Number stays fixed in place — only the value and dashed target line change.
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
  const startXRef = useRef(0)
  const startValueRef = useRef(value)
  const containerRef = useRef(null)

  const handleStart = useCallback((clientX) => {
    setIsDragging(true)
    startXRef.current = clientX
    startValueRef.current = value
  }, [value])

  const handleMove = useCallback((clientX) => {
    if (!isDragging) return
    const deltaX = startXRef.current - clientX // left = increase
    const deltaValue = Math.round(deltaX * step)
    const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaValue))
    onChange(newValue)
  }, [isDragging, step, min, max, onChange])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
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
        display: 'inline-flex', alignItems: 'baseline', gap: '4px',
      }}>
        <span style={{
          fontSize: '28px', fontWeight: 800, color: '#4f645b',
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>
        <span style={{
          fontSize: '14px', fontWeight: 500, color: '#4f645b',
          opacity: 0.7,
        }}>{unit}</span>
      </div>
      {/* Swipe hint */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: '4px', marginTop: '4px',
        opacity: isDragging ? 0 : 0.4,
        transition: 'opacity 0.3s ease',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#787c77' }}>swipe</span>
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#787c77' }}>swipe to adjust</span>
      </div>
    </div>
  )
}
