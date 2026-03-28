import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import useWithings from '../hooks/useWithings'
import useSleepData from '../hooks/useSleepData'
import schedule, { formatTime } from '../data/schedule'

const quotes = [
  "Progress is not about perfection, but about showing up for yourself, one small bite at a time.",
  "Your body is listening. Every meal is a message of care.",
  "Growth happens in the quiet moments between what you were and what you're becoming.",
  "Nourishing yourself is not a chore — it's an act of self-respect.",
  "The scale tells one story. Your energy, sleep, and mood tell the rest.",
  "Small plates, steady gains. You're building something lasting.",
  "Every pound gained is a promise kept to your future self.",
  "You don't have to eat perfectly. You just have to eat intentionally.",
  "Rest days are growth days. Recovery is where strength is built.",
  "The hardest part is starting. You've already done that.",
  "Your appetite will grow as you do. Trust the process.",
  "Consistency isn't glamorous, but it's what separates progress from wishful thinking.",
  "Food is fuel, not a fight. Let it work for you.",
  "You are not behind. You are exactly where your body needs you to be.",
  "One good meal won't fix everything. But a hundred will change your life.",
  "Strength is built in the kitchen as much as the gym.",
  "There's no finish line — just a better version of you, every single day.",
  "Be patient with yourself. Roots grow before branches.",
  "Your body remembers kindness. Feed it well.",
  "Every bite is a brick in the foundation of your new self.",
]

function getDailyQuote() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return quotes[dayOfYear % quotes.length]
}

export default function ProgressPage() {
  const { currentWeight, targetWeight, setTargetWeight, weightLog, logWeight, streakDays, eatenMeals } = useApp()
  const withings = useWithings()
  const sleep = useSleepData()
  const [showWeightInput, setShowWeightInput] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [sliderValue, setSliderValue] = useState(targetWeight)

  // Sync slider with stored target
  useEffect(() => { setSliderValue(targetWeight) }, [targetWeight])

  // Auto-sync Withings data into app state
  useEffect(() => {
    if (withings.latest && withings.latest.weightLbs) {
      const latestWeight = withings.latest.weightLbs
      if (latestWeight !== currentWeight) {
        logWeight(latestWeight)
      }
    }
  }, [withings.latest])

  // Check for ?withings=connected in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('withings') === 'connected') {
      window.history.replaceState({}, '', '/progress')
    }
  }, [])

  const totalGained = currentWeight - 145
  const quote = getDailyQuote()

  // ===== LINE CHART DATA =====
  const chartSource = withings.measurements.length > 0
    ? withings.measurements.map(m => ({ date: m.date, weight: m.weightLbs }))
    : weightLog

  const recentLog = chartSource.slice(-14) // Show last 14 data points
  const weights = recentLog.map(e => e.weight)
  const minWeight = Math.min(...weights, targetWeight) - 3
  const maxWeight = Math.max(...weights, targetWeight) + 3
  const range = maxWeight - minWeight || 1

  // SVG dimensions
  const svgW = 600
  const svgH = 200
  const padX = 40
  const padY = 20
  const chartW = svgW - padX * 2
  const chartH = svgH - padY * 2

  const points = recentLog.map((entry, i) => {
    const x = padX + (i / Math.max(recentLog.length - 1, 1)) * chartW
    const y = padY + chartH - ((entry.weight - minWeight) / range) * chartH
    return { x, y, ...entry }
  })

  const linePath = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : ''

  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`
    : ''

  // Target weight line Y position
  const targetY = padY + chartH - ((targetWeight - minWeight) / range) * chartH

  const handleLogWeight = () => {
    const w = parseFloat(weightInput)
    if (w && w > 0 && w < 500) {
      logWeight(w)
      setWeightInput('')
      setShowWeightInput(false)
    }
  }

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value)
    setSliderValue(val)
  }

  const handleSliderCommit = () => {
    setTargetWeight(sliderValue)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* ===== EDITORIAL HEADER ===== */}
      <section>
        <p style={{ color: '#4f645b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Progress Overview</p>
        <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#2f332f', lineHeight: 1.15, margin: 0, letterSpacing: '-0.02em' }}>
          Nurturing your <span style={{ color: '#4f645b', fontStyle: 'italic' }}>steady growth</span>.
        </h2>
      </section>

      {/* ===== WITHINGS CONNECTION CARD ===== */}
      <section style={{
        background: withings.connected ? '#d1e8dd' : '#ffffff',
        padding: '24px', borderRadius: '1.5rem',
        boxShadow: '0 4px 16px rgba(47, 51, 47, 0.06)',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '16px',
          background: withings.connected ? '#4f645b' : '#edefe9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span className="material-symbols-outlined" style={{
            color: withings.connected ? '#e7fef3' : '#4f645b',
            fontSize: '24px',
            fontVariationSettings: withings.connected ? "'FILL' 1" : "'FILL' 0",
          }}>monitor_weight</span>
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: withings.connected ? '#2f433c' : '#2f332f', margin: '0 0 2px' }}>
            {withings.loading ? 'Checking...' : withings.connected ? 'Withings Connected' : 'Withings Scale'}
          </h4>
          <p style={{ fontSize: '13px', color: withings.connected ? '#42564e' : '#5f5f5c', margin: 0 }}>
            {withings.serverDown
              ? 'Start the API server: npm run api'
              : withings.connected
                ? withings.syncing ? 'Syncing...' : 'Auto-syncing your weight'
                : 'Connect your WiFi scale for automatic tracking'}
          </p>
        </div>
        {!withings.loading && !withings.serverDown && (
          <button
            onClick={withings.connected ? withings.disconnect : withings.connect}
            style={{
              padding: '10px 20px', borderRadius: '9999px', border: 'none',
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', transition: 'all 0.3s ease', flexShrink: 0,
              background: withings.connected ? 'rgba(47,67,60,0.15)' : '#4f645b',
              color: withings.connected ? '#2f433c' : '#e7fef3',
            }}
          >
            {withings.connected ? 'Disconnect' : 'Connect'}
          </button>
        )}
        {withings.connected && (
          <button
            onClick={withings.refresh}
            disabled={withings.syncing}
            style={{
              padding: '10px', borderRadius: '12px', border: 'none',
              background: 'rgba(47,67,60,0.1)', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{
              color: '#2f433c', fontSize: '20px',
              animation: withings.syncing ? 'spin 1s linear infinite' : 'none',
            }}>refresh</span>
          </button>
        )}
      </section>

      {/* ===== WEIGHT LINE CHART ===== */}
      <section style={{
        background: '#ffffff', padding: '32px', borderRadius: '2rem',
        boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <p style={{ color: '#5f5f5c', fontSize: '14px', fontWeight: 500, margin: '0 0 4px' }}>Current Weight</p>
            <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#2f332f', margin: 0 }}>
              {Number(currentWeight).toFixed(1)} <span style={{ fontSize: '18px', fontWeight: 400, color: '#535351' }}>lbs</span>
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#5f5f5c', fontSize: '14px', fontWeight: 500, margin: '0 0 4px' }}>Target</p>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#4f645b', margin: 0 }}>{sliderValue} lbs</h3>
          </div>
        </div>

        {/* SVG Line Chart */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto' }}>
            {/* Gradient fill under line */}
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f645b" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#4f645b" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#4f645b" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Target weight line */}
            {targetY >= padY && targetY <= padY + chartH && (
              <>
                <line x1={padX} y1={targetY} x2={svgW - padX} y2={targetY}
                  stroke="#4f645b" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
                <text x={svgW - padX + 4} y={targetY + 4}
                  fill="#4f645b" fontSize="10" fontWeight="600" fontFamily="Manrope">{sliderValue}</text>
              </>
            )}

            {/* Area fill */}
            {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

            {/* Line */}
            {linePath && <path d={linePath} fill="none" stroke="#4f645b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

            {/* Data points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={i === points.length - 1 ? 6 : 3.5}
                  fill={i === points.length - 1 ? '#4f645b' : '#a3bfb3'} stroke="#fff" strokeWidth="2" />
                {/* Show weight label on latest point */}
                {i === points.length - 1 && (
                  <text x={p.x} y={p.y - 14} textAnchor="middle"
                    fill="#4f645b" fontSize="12" fontWeight="700" fontFamily="Manrope">{Number(p.weight).toFixed(1)}</text>
                )}
              </g>
            ))}

            {/* Date labels */}
            {points.filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)).map((p, i) => (
              <text key={i} x={p.x} y={svgH - 2} textAnchor="middle"
                fill="#787c77" fontSize="9" fontWeight="600" fontFamily="Manrope" letterSpacing="0.05em">
                {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            ))}
          </svg>
        </div>

        {/* Target Weight Slider */}
        <div style={{ marginTop: '24px', padding: '20px', background: '#f3f4ef', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#5f5f5c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Target Weight</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#4f645b' }}>{sliderValue} lbs</span>
          </div>
          <input
            type="range"
            min="100" max="250" step="1"
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            style={{
              width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none',
              background: `linear-gradient(to right, #4f645b 0%, #4f645b ${((sliderValue - 100) / 150) * 100}%, #e0e4dd ${((sliderValue - 100) / 150) * 100}%, #e0e4dd 100%)`,
              borderRadius: '9999px', outline: 'none', cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', fontWeight: 600, color: '#787c77' }}>
            <span>100 lbs</span>
            <span>250 lbs</span>
          </div>
        </div>

        {/* Log Weight (manual fallback) */}
        {!withings.connected && (
          <div style={{ marginTop: '24px' }}>
            {showWeightInput ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="Enter weight..."
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleLogWeight()}
                  style={{
                    flex: 1, background: '#edefe9', border: 'none', borderRadius: '12px',
                    padding: '14px 16px', fontFamily: "'Manrope', sans-serif",
                    fontSize: '15px', color: '#2f332f', outline: 'none',
                  }}
                />
                <button onClick={handleLogWeight} style={{
                  background: '#4f645b', color: '#e7fef3', border: 'none', borderRadius: '12px',
                  padding: '14px 24px', fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                }}>Log</button>
                <button onClick={() => setShowWeightInput(false)} style={{
                  background: '#e6e9e3', color: '#2f332f', border: 'none', borderRadius: '12px',
                  padding: '14px 16px', fontFamily: "'Manrope', sans-serif", fontWeight: 700, cursor: 'pointer',
                }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setShowWeightInput(true)} style={{
                width: '100%', padding: '14px', borderRadius: '9999px', border: 'none',
                background: '#e6e9e3', color: '#2f332f', fontFamily: "'Manrope', sans-serif",
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              }}>
                Log Today's Weight
              </button>
            )}
          </div>
        )}
      </section>

      {/* ===== STATS CARDS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#f3f4ef', padding: '24px', borderRadius: '2rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '28px', display: 'block', marginBottom: '16px' }}>trending_up</span>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#2f332f', margin: '0 0 4px' }}>
            {totalGained >= 0 ? '+' : ''}{totalGained.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: 500 }}>lbs</span>
          </p>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#5f5f5c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Total Gained</p>
        </div>
        <div style={{ background: '#d1e8dd', padding: '24px', borderRadius: '2rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#42564e', fontSize: '28px', display: 'block', marginBottom: '16px' }}>calendar_today</span>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#42564e', margin: '0 0 4px' }}>
            {streakDays} <span style={{ fontSize: '14px', fontWeight: 500 }}>days</span>
          </p>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(66,86,78,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Consistent Routine</p>
        </div>
      </div>

      {/* ===== SLEEP QUALITY CARD ===== */}
      {sleep.latest && (
        <section style={{
          background: '#ffffff', padding: '32px', borderRadius: '2rem',
          boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#4f645b', fontVariationSettings: "'FILL' 1" }}>bedtime</span>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#4f645b', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Last Night's Sleep</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h3 style={{ fontSize: '40px', fontWeight: 700, color: '#2f332f', margin: 0 }}>
                  {sleep.latest.sleepScore || '—'}
                </h3>
                <span style={{
                  fontSize: '13px', fontWeight: 700,
                  color: sleep.getQuality(sleep.latest.sleepScore).color,
                  padding: '2px 10px', borderRadius: '9999px',
                  background: `${sleep.getQuality(sleep.latest.sleepScore).color}15`,
                }}>{sleep.getQuality(sleep.latest.sleepScore).label}</span>
              </div>
            </div>
            {sleep.averages?.last7 && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#787c77', margin: '0 0 4px' }}>7-Day Avg</p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#4f645b', margin: 0 }}>{sleep.averages.last7.score || '—'}</p>
                <p style={{ fontSize: '12px', color: '#787c77', margin: 0 }}>{sleep.averages.last7.hours || '—'}h avg</p>
              </div>
            )}
          </div>

          {/* Sleep breakdown bars */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#5f5f5c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>Sleep Stages</p>
            {[
              { label: 'Deep', hours: sleep.latest.deepHours, color: '#2f433c', max: 3 },
              { label: 'REM', hours: sleep.latest.remHours, color: '#4f645b', max: 3 },
              { label: 'Light', hours: sleep.latest.lightHours, color: '#a3bfb3', max: 5 },
            ].map(stage => (
              <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#5f5f5c', width: '40px' }}>{stage.label}</span>
                <div style={{ flex: 1, height: '10px', background: '#edefe9', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(((stage.hours || 0) / stage.max) * 100, 100)}%`,
                    height: '100%', background: stage.color, borderRadius: '5px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2f332f', width: '36px', textAlign: 'right' }}>
                  {stage.hours || '—'}h
                </span>
              </div>
            ))}
          </div>

          {/* Vitals row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            {sleep.latest.totalHours && (
              <div style={{ flex: 1, background: '#f3f4ef', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '20px', display: 'block', marginBottom: '6px' }}>schedule</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#2f332f', margin: '0 0 2px' }}>{sleep.latest.totalHours}h</p>
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#787c77', textTransform: 'uppercase', margin: 0 }}>Total</p>
              </div>
            )}
            {sleep.latest.hrAvg && (
              <div style={{ flex: 1, background: '#f3f4ef', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '20px', display: 'block', marginBottom: '6px' }}>favorite</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#2f332f', margin: '0 0 2px' }}>{sleep.latest.hrAvg}</p>
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#787c77', textTransform: 'uppercase', margin: 0 }}>Avg HR</p>
              </div>
            )}
            {sleep.latest.efficiency && (
              <div style={{ flex: 1, background: '#f3f4ef', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '20px', display: 'block', marginBottom: '6px' }}>speed</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#2f332f', margin: '0 0 2px' }}>{sleep.latest.efficiency}%</p>
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#787c77', textTransform: 'uppercase', margin: 0 }}>Efficiency</p>
              </div>
            )}
          </div>

          {/* Eat/Sleep correlation */}
          {(() => {
            const corr = sleep.getCorrelation(eatenMeals)
            if (!corr) return null
            const colors = {
              positive: { bg: '#d1e8dd', text: '#2d7a4f', icon: 'check_circle' },
              neutral: { bg: '#e6e9e3', text: '#5f5f5c', icon: 'info' },
              negative: { bg: '#fde8e4', text: '#a73b21', icon: 'warning' },
              warning: { bg: '#fff4d6', text: '#b8860b', icon: 'info' },
            }
            const c = colors[corr.type] || colors.neutral
            return (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 18px', borderRadius: '14px', background: c.bg,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: c.text, fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                <p style={{ fontSize: '13px', fontWeight: 600, color: c.text, margin: 0 }}>{corr.message}</p>
              </div>
            )
          })()}
        </section>
      )}

      {/* ===== DAILY FUELING SCHEDULE ===== */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#2f332f', margin: '0 0 4px' }}>Daily Fueling Schedule</h3>
            <p style={{ color: '#5f5f5c', fontSize: '14px', margin: 0 }}>Small, frequent nourishment to sustain your energy.</p>
          </div>
        </div>

        <div>
          {schedule.map((slot, index) => (
            <div key={slot.id} style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: index === 0 ? '#d1e8dd' : '#e0e4dd',
                  color: index === 0 ? '#42564e' : '#4f645b',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{slot.icon}</span>
                </div>
                {index < schedule.length - 1 && (
                  <div style={{ width: '2px', flex: 1, background: '#edefe9', borderRadius: '2px', minHeight: '48px' }} />
                )}
              </div>
              <div style={{ paddingTop: '4px', paddingBottom: '32px' }}>
                <p style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: index === 0 ? '#4f645b' : '#5f5f5c', margin: '0 0 4px' }}>
                  {formatTime(slot.time)}
                </p>
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#2f332f', margin: '0 0 8px' }}>{slot.label}</h4>
                <p style={{ color: '#5f5f5c', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{slot.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MOTIVATIONAL QUOTE ===== */}
      <section style={{
        background: '#f3f4ef', padding: '40px', borderRadius: '2.5rem', textAlign: 'center',
      }}>
        <span className="material-symbols-outlined" style={{ color: 'rgba(79,100,91,0.4)', fontSize: '32px', marginBottom: '16px', display: 'block' }}>format_quote</span>
        <p style={{ fontSize: '18px', fontWeight: 500, color: '#2f332f', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 24px' }}>
          "{quote}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ width: '32px', height: '1px', background: 'rgba(175,179,173,0.3)' }} />
          <p style={{ color: '#4f645b', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Your Gentle Guide</p>
          <div style={{ width: '32px', height: '1px', background: 'rgba(175,179,173,0.3)' }} />
        </div>
      </section>
    </div>
  )
}
