import { useState } from 'react'
import { useApp } from '../context/AppContext'
import schedule, { formatTime } from '../data/schedule'

export default function ProgressPage() {
  const { currentWeight, weightLog, logWeight, streakDays } = useApp()
  const [showWeightInput, setShowWeightInput] = useState(false)
  const [weightInput, setWeightInput] = useState('')

  const totalGained = currentWeight - 145
  const progressPercent = Math.min(100, Math.round(((currentWeight - 145) / (175 - 145)) * 100))

  // Chart data from weight log (last 7 entries)
  const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const recentLog = weightLog.slice(-7)
  const chartData = []
  for (let i = 0; i < 7; i++) {
    if (i < recentLog.length) {
      const entry = recentLog[i]
      const date = new Date(entry.date)
      chartData.push({
        label: monthLabels[date.getMonth()],
        weight: entry.weight,
        height: Math.max(15, ((entry.weight - 140) / (180 - 140)) * 100),
        isLatest: i === recentLog.length - 1,
      })
    } else {
      chartData.push({ label: '', weight: 0, height: 12, empty: true })
    }
  }

  const handleLogWeight = () => {
    const w = parseFloat(weightInput)
    if (w && w > 0 && w < 500) {
      logWeight(w)
      setWeightInput('')
      setShowWeightInput(false)
    }
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

      {/* ===== WEIGHT CHART CARD ===== */}
      <section style={{
        background: '#ffffff', padding: '32px', borderRadius: '2rem',
        boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <p style={{ color: '#5f5f5c', fontSize: '14px', fontWeight: 500, margin: '0 0 4px' }}>Current Weight</p>
            <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#2f332f', margin: 0 }}>
              {currentWeight} <span style={{ fontSize: '18px', fontWeight: 400, color: '#535351' }}>lbs</span>
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#5f5f5c', fontSize: '14px', fontWeight: 500, margin: '0 0 4px' }}>Target</p>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#4f645b', margin: 0 }}>175.0 lbs</h3>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '8px', position: 'relative', marginBottom: '8px' }}>
          <div style={{
            position: 'absolute', top: 0, width: '100%', borderTop: '1px dashed rgba(175,179,173,0.3)',
            fontSize: '10px', color: '#787c77', letterSpacing: '0.1em', paddingTop: '4px',
          }}>
            GOAL: 175 LBS
          </div>
          {chartData.map((bar, i) => (
            <div
              key={i}
              style={{
                flex: 1, borderRadius: '8px 8px 0 0',
                height: `${bar.height}%`,
                background: bar.empty ? '#edefe9' : bar.isLatest ? '#4f645b' : 'rgba(79, 100, 91, 0.2)',
                boxShadow: bar.isLatest ? '0 4px 12px rgba(79,100,91,0.2)' : 'none',
                transition: 'all 0.7s ease',
                opacity: bar.empty ? 0.3 : 1,
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#787c77', letterSpacing: '0.08em', padding: '0 4px' }}>
          {chartData.map((bar, i) => (
            <span key={i} style={{ flex: 1, textAlign: 'center', color: bar.isLatest ? '#4f645b' : undefined }}>
              {bar.isLatest ? 'TODAY' : bar.label}
            </span>
          ))}
        </div>

        {/* Log Weight */}
        <div style={{ marginTop: '24px' }}>
          {showWeightInput ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
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
      </section>

      {/* ===== STATS CARDS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#f3f4ef', padding: '24px', borderRadius: '2rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '28px', display: 'block', marginBottom: '16px' }}>trending_up</span>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#2f332f', margin: '0 0 4px' }}>
            +{totalGained.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: 500 }}>lbs</span>
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
          "Progress is not about perfection, but about showing up for yourself, one small bite at a time."
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
