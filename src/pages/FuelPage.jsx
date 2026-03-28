import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getCurrentMealPeriod, formatTime } from '../data/schedule'
import { getHealthyMeals, getQuickMeals } from '../data/meals'

const encouragements = [
  'Stay Gentle',
  'You Are Enough',
  'One Bite at a Time',
  'Small Steps Matter',
  'Be Kind to Yourself',
]

function getEncouragement() {
  const day = new Date().getDay()
  return encouragements[day % encouragements.length]
}

export default function FuelPage() {
  const { currentWeight, markEaten, isMealEaten } = useApp()
  const mealPeriod = getCurrentMealPeriod()
  const encouragement = getEncouragement()

  const healthyOption = useMemo(() => {
    const type = mealPeriod.mealType === 'snack' ? 'lunch' : mealPeriod.mealType
    const meals = getHealthyMeals(type)
    const dayIndex = new Date().getDay()
    return meals[dayIndex % meals.length]
  }, [mealPeriod.mealType])

  const quickOption = useMemo(() => {
    const type = mealPeriod.mealType === 'snack' ? 'lunch' : mealPeriod.mealType
    const meals = getQuickMeals(type)
    const dayIndex = new Date().getDay()
    return meals[dayIndex % meals.length]
  }, [mealPeriod.mealType])

  const eaten = isMealEaten(mealPeriod.mealType)
  const [justAte, setJustAte] = useState(false)
  const progressPercent = Math.min(100, Math.round(((currentWeight - 145) / (175 - 145)) * 100))
  const [expandedMeal, setExpandedMeal] = useState(null)

  const handleEaten = () => {
    markEaten(mealPeriod.mealType)
    setJustAte(true)
    setTimeout(() => setJustAte(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* ===== WELCOME ===== */}
      <section>
        <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#2f332f', margin: 0 }}>{encouragement}</h2>
        <p style={{ color: '#5f5f5c', fontSize: '18px', lineHeight: 1.6, marginTop: '8px' }}>
          You are doing enough. Let's find something simple to nourish you today.
        </p>
      </section>

      {/* ===== CURRENT MEAL SPOTLIGHT ===== */}
      <section style={{
        background: '#ffffff', borderRadius: '2rem', padding: '32px',
        boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ color: '#4f645b', fontVariationSettings: "'FILL' 1" }}>{mealPeriod.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#5f5f5c' }}>Current Meal</span>
        </div>
        <h3 style={{ fontSize: '30px', fontWeight: 700, color: '#4f645b', margin: '0 0 4px' }}>{mealPeriod.label}</h3>
        <p style={{ color: '#535351', fontSize: '15px', fontWeight: 500 }}>
          {formatTime(mealPeriod.time)} • {mealPeriod.mealType === 'snack' ? 'Quick Energy' : 'Energy Focus'}
        </p>

        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Healthy Option */}
          {healthyOption && (
            <div
              onClick={() => setExpandedMeal(expandedMeal === healthyOption.id ? null : healthyOption.id)}
              style={{
                padding: '24px', borderRadius: '16px', background: '#f3f4ef',
                cursor: 'pointer', transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: '#4f645b', fontWeight: 700, fontSize: '13px', display: 'block', marginBottom: '4px' }}>Option 1: Healthy</span>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#2f332f', margin: '0 0 4px' }}>{healthyOption.name}</h4>
                  <p style={{ color: '#5f5f5c', fontSize: '14px', margin: 0 }}>{healthyOption.description}</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#43574f', opacity: 0.4, fontSize: '20px' }}>
                  {expandedMeal === healthyOption.id ? 'expand_less' : 'arrow_forward_ios'}
                </span>
              </div>
              {expandedMeal === healthyOption.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(175,179,173,0.2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {healthyOption.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '16px', marginTop: '2px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <p style={{ color: '#5c605b', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Option */}
          {quickOption && (
            <div
              onClick={() => setExpandedMeal(expandedMeal === quickOption.id ? null : quickOption.id)}
              style={{
                padding: '24px', borderRadius: '16px', background: '#f3f4ef',
                cursor: 'pointer', transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: '#695d52', fontWeight: 700, fontSize: '13px', display: 'block', marginBottom: '4px' }}>Option 2: Quick</span>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#2f332f', margin: '0 0 4px' }}>{quickOption.name}</h4>
                  <p style={{ color: '#5f5f5c', fontSize: '14px', margin: 0 }}>{quickOption.description}</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#43574f', opacity: 0.4, fontSize: '20px' }}>
                  {expandedMeal === quickOption.id ? 'expand_less' : 'arrow_forward_ios'}
                </span>
              </div>
              {expandedMeal === quickOption.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(175,179,173,0.2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quickOption.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '16px', marginTop: '2px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <p style={{ color: '#5c605b', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* I've Eaten Button */}
        <div style={{ marginTop: '40px' }}>
          <button
            onClick={handleEaten}
            disabled={eaten}
            style={{
              width: '100%', padding: '20px', borderRadius: '9999px', border: 'none',
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '18px',
              cursor: eaten ? 'default' : 'pointer',
              background: eaten || justAte
                ? '#d1e8dd'
                : 'linear-gradient(to right, #4f645b, #43574f)',
              color: eaten || justAte ? '#42564e' : '#e7fef3',
              boxShadow: eaten ? 'none' : '0 12px 32px rgba(47, 51, 47, 0.08)',
              transition: 'all 0.3s ease',
            }}
          >
            {eaten ? '\u2713 You\u2019ve fueled up' : justAte ? '\u2713 Logged!' : "I've Eaten"}
          </button>
        </div>
      </section>

      {/* ===== PROGRESS ===== */}
      <section style={{
        background: '#edefe9', padding: '32px', borderRadius: '2rem',
        display: 'flex', flexDirection: 'column', gap: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#2f332f', margin: '0 0 4px' }}>Your Journey</h4>
            <p style={{ color: '#5f5f5c', fontSize: '14px', margin: 0 }}>Targeting 175 lbs for health</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '30px', fontWeight: 800, color: '#4f645b' }}>{currentWeight}</span>
            <span style={{ color: '#5f5f5c', fontWeight: 700, marginLeft: '4px' }}>lbs</span>
          </div>
        </div>

        <div>
          <div style={{ height: '16px', width: '100%', background: '#e6e9e3', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: '#c3dacf', borderRadius: '9999px',
              width: `${Math.max(3, progressPercent)}%`,
              transition: 'width 1s ease-out',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', fontWeight: 700, color: '#787c77', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            <span>145 lbs</span>
            <span>175 lbs</span>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'rgba(209, 232, 221, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ color: '#4f645b', fontVariationSettings: "'FILL' 1" }}>colors_spark</span>
          <p style={{ color: '#42564e', fontSize: '14px', fontWeight: 500, margin: 0 }}>
            Progress is quiet, but it's happening every day.
          </p>
        </div>
      </section>
    </div>
  )
}
