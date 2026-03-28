import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getCurrentMealPeriod, formatTime } from '../data/schedule'
import { getHealthyMeals, getQuickMeals } from '../data/meals'

export default function FuelPage() {
  const { currentWeight, targetWeight, markEaten, unmarkEaten, isMealEaten } = useApp()
  const mealPeriod = getCurrentMealPeriod()

  // Get all healthy and quick meals for current meal type
  const mealType = mealPeriod.mealType === 'snack' || mealPeriod.mealType === 'latenight'
    ? 'dinner' : mealPeriod.mealType
  const healthyPool = useMemo(() => getHealthyMeals(mealType), [mealType])
  const quickPool = useMemo(() => getQuickMeals(mealType), [mealType])

  // Flashcard index for cycling
  const [healthyIndex, setHealthyIndex] = useState(() => {
    return new Date().getDay() % Math.max(1, healthyPool.length)
  })
  const [quickIndex, setQuickIndex] = useState(() => {
    return new Date().getDay() % Math.max(1, quickPool.length)
  })

  const healthyOption = healthyPool[healthyIndex % healthyPool.length]
  const quickOption = quickPool[quickIndex % quickPool.length]

  const eaten = isMealEaten(mealPeriod.mealType)
  const [justAte, setJustAte] = useState(false)
  const [expandedMeal, setExpandedMeal] = useState(null) // 'healthy' | 'quick' | null
  const [chosenMeal, setChosenMeal] = useState(null) // which side was tapped

  const handleChoose = (side) => {
    if (eaten) {
      unmarkEaten(mealPeriod.mealType)
      setChosenMeal(null)
    } else {
      markEaten(mealPeriod.mealType)
      setChosenMeal(side)
      setJustAte(true)
      setTimeout(() => setJustAte(false), 2000)
    }
  }

  const cycleHealthy = (e) => {
    e.stopPropagation()
    setHealthyIndex(i => (i + 1) % healthyPool.length)
    setExpandedMeal(null)
  }

  const cycleQuick = (e) => {
    e.stopPropagation()
    setQuickIndex(i => (i + 1) % quickPool.length)
    setExpandedMeal(null)
  }

  // Friendly meal period label
  const mealLabel = mealPeriod.mealType === 'latenight' ? 'a late-night snack'
    : mealPeriod.mealType === 'snack' ? 'a snack'
    : mealPeriod.label.toLowerCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ===== DECISION HEADLINE ===== */}
      <section style={{ textAlign: 'center' }}>
        <h2 style={{
          fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em',
          color: '#2f332f', margin: '0 0 8px',
        }}>Do you want to eat?</h2>
        <p style={{ color: '#5f5f5c', fontSize: '17px', lineHeight: 1.6 }}>
          It's time for {mealLabel}. Choose what feels right.
        </p>
      </section>

      {/* ===== FLASHCARD GRID ===== */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Option 1: Healthy */}
        {healthyOption && (
          <div
            onClick={() => setExpandedMeal(expandedMeal === 'healthy' ? null : 'healthy')}
            style={{
              display: 'flex', flexDirection: 'column', textAlign: 'left',
              background: '#ffffff', borderRadius: '2rem', padding: '16px',
              boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
              cursor: 'pointer', transition: 'all 0.3s ease',
              transform: expandedMeal === 'healthy' ? 'scale(1.02)' : 'scale(1)',
              outline: chosenMeal === 'healthy' ? '3px solid #4f645b' : 'none',
            }}
          >
            <div style={{
              width: '100%', aspectRatio: '1/1', borderRadius: '1rem',
              overflow: 'hidden', marginBottom: '14px', background: '#f3f4ef',
            }}>
              <img
                src={healthyOption.image}
                alt={healthyOption.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
            <div style={{ padding: '0 4px' }}>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '9999px',
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '6px',
                background: 'rgba(79, 100, 91, 0.1)', color: '#4f645b',
              }}>Healthy</span>
              <h3 style={{
                fontSize: '17px', fontWeight: 700, color: '#2f332f',
                lineHeight: 1.2, margin: '0 0 4px',
              }}>{healthyOption.name}</h3>
              <p style={{
                color: '#5f5f5c', fontSize: '12px', lineHeight: 1.5,
                margin: '0 0 10px',
              }}>{healthyOption.description}</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: '#787c77',
                }}>{healthyOption.prepTime}</span>
              </div>
            </div>

            {/* Expanded Steps */}
            {expandedMeal === 'healthy' && (
              <div style={{
                marginTop: '12px', paddingTop: '12px',
                borderTop: '1px solid rgba(175,179,173,0.15)',
              }}>
                {healthyOption.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      background: '#d1e8dd', color: '#42564e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, marginTop: '1px',
                    }}>{i + 1}</div>
                    <p style={{ color: '#5c605b', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>{step}</p>
                  </div>
                ))}
                <button
                  onClick={(e) => { e.stopPropagation(); handleChoose('healthy') }}
                  style={{
                    width: '100%', marginTop: '8px', padding: '12px', borderRadius: '9999px',
                    border: 'none', fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                    fontSize: '13px', cursor: 'pointer',
                    background: eaten && chosenMeal === 'healthy' ? '#d1e8dd' : '#4f645b',
                    color: eaten && chosenMeal === 'healthy' ? '#42564e' : '#e7fef3',
                  }}
                >
                  {eaten && chosenMeal === 'healthy' ? '✕ Unmark' : "I'll eat this"}
                </button>
              </div>
            )}

            {/* Cycle Arrow */}
            {healthyPool.length > 1 && (
              <button onClick={cycleHealthy} style={{
                alignSelf: 'center', marginTop: '8px', background: 'none', border: 'none',
                cursor: 'pointer', padding: '4px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#afb3ad' }}>swap_horiz</span>
              </button>
            )}
          </div>
        )}

        {/* Option 2: Quick */}
        {quickOption && (
          <div
            onClick={() => setExpandedMeal(expandedMeal === 'quick' ? null : 'quick')}
            style={{
              display: 'flex', flexDirection: 'column', textAlign: 'left',
              background: '#ffffff', borderRadius: '2rem', padding: '16px',
              boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
              cursor: 'pointer', transition: 'all 0.3s ease',
              transform: expandedMeal === 'quick' ? 'scale(1.02)' : 'scale(1)',
              outline: chosenMeal === 'quick' ? '3px solid #695d52' : 'none',
            }}
          >
            <div style={{
              width: '100%', aspectRatio: '1/1', borderRadius: '1rem',
              overflow: 'hidden', marginBottom: '14px', background: '#f3f4ef',
            }}>
              <img
                src={quickOption.image}
                alt={quickOption.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
            <div style={{ padding: '0 4px' }}>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '9999px',
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '6px',
                background: 'rgba(105, 93, 82, 0.1)', color: '#695d52',
              }}>Quick</span>
              <h3 style={{
                fontSize: '17px', fontWeight: 700, color: '#2f332f',
                lineHeight: 1.2, margin: '0 0 4px',
              }}>{quickOption.name}</h3>
              <p style={{
                color: '#5f5f5c', fontSize: '12px', lineHeight: 1.5,
                margin: '0 0 10px',
              }}>{quickOption.description}</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: '#787c77',
                }}>{quickOption.prepTime}</span>
              </div>
            </div>

            {/* Expanded Steps */}
            {expandedMeal === 'quick' && (
              <div style={{
                marginTop: '12px', paddingTop: '12px',
                borderTop: '1px solid rgba(175,179,173,0.15)',
              }}>
                {quickOption.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      background: '#fdebdc', color: '#62564b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, marginTop: '1px',
                    }}>{i + 1}</div>
                    <p style={{ color: '#5c605b', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>{step}</p>
                  </div>
                ))}
                <button
                  onClick={(e) => { e.stopPropagation(); handleChoose('quick') }}
                  style={{
                    width: '100%', marginTop: '8px', padding: '12px', borderRadius: '9999px',
                    border: 'none', fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                    fontSize: '13px', cursor: 'pointer',
                    background: eaten && chosenMeal === 'quick' ? '#fdebdc' : '#695d52',
                    color: eaten && chosenMeal === 'quick' ? '#62564b' : '#fff7f3',
                  }}
                >
                  {eaten && chosenMeal === 'quick' ? '✕ Unmark' : "I'll eat this"}
                </button>
              </div>
            )}

            {/* Cycle Arrow */}
            {quickPool.length > 1 && (
              <button onClick={cycleQuick} style={{
                alignSelf: 'center', marginTop: '8px', background: 'none', border: 'none',
                cursor: 'pointer', padding: '4px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#afb3ad' }}>swap_horiz</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* ===== ALREADY EATEN ===== */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => {
            if (eaten) { unmarkEaten(mealPeriod.mealType); setChosenMeal(null) }
            else { markEaten(mealPeriod.mealType); setJustAte(true); setTimeout(() => setJustAte(false), 2000) }
          }}
          style={{
            background: 'none', border: 'none', color: '#535351',
            fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px',
          }}
        >
          {eaten ? '✕ Unmark meal' : justAte ? '✓ Logged!' : "I've already eaten"}
        </button>
      </div>
    </div>
  )
}
