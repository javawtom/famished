import { useState } from 'react'
import { getHealthyMeals, getQuickMeals } from '../data/meals'

const mealTypes = ['breakfast', 'lunch', 'dinner']
const mealTypeLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }
const healthyDescriptions = {
  breakfast: 'Nutrient-dense starts for high-clarity mornings.',
  lunch: 'Balanced, sustained energy for your afternoon.',
  dinner: 'Restorative evening meals for recovery and rest.',
}

export default function LibraryPage() {
  const [expandedMeal, setExpandedMeal] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* ===== EDITORIAL HEADER ===== */}
      <section>
        <span style={{ color: '#4f645b', fontWeight: 700, letterSpacing: '0.12em', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>The Matrix</span>
        <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em', color: '#2f332f', margin: '0 0 16px' }}>The Meal Library</h2>
        <p style={{ color: '#5f5f5c', fontSize: '16px', lineHeight: 1.6 }}>
          Your personal architectural foundation for nutrition. 24 curated options designed to eliminate decision fatigue and support your journey.
        </p>
      </section>

      {/* ===== MEAL SECTIONS ===== */}
      {mealTypes.map(type => {
        const healthy = getHealthyMeals(type)
        const quick = getQuickMeals(type)

        return (
          <section key={type}>
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{mealTypeLabels[type]}</h3>
              <div style={{ height: '1px', flex: 1, background: 'rgba(175,179,173,0.2)' }} />
            </div>

            {/* Healthy Options Header Card */}
            <div style={{
              background: '#f3f4ef', borderRadius: '2rem', padding: '28px', marginBottom: '16px',
            }}>
              <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '28px', display: 'block', marginBottom: '12px' }}>energy_savings_leaf</span>
              <h4 style={{ fontSize: '22px', fontWeight: 700, color: '#2f332f', margin: '0 0 8px' }}>Healthy Options</h4>
              <p style={{ color: '#5f5f5c', fontSize: '14px', lineHeight: 1.5, margin: '0 0 20px' }}>{healthyDescriptions[type]}</p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#4f645b', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>Progression</p>
              <div style={{ height: '6px', width: '60%', background: '#4f645b', borderRadius: '9999px' }} />
            </div>

            {/* Healthy Meal Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {healthy.map(meal => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  isExpanded={expandedMeal === meal.id}
                  onToggle={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                />
              ))}
            </div>

            {/* Quick Options Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ color: '#5d5146', fontSize: '20px' }}>bolt</span>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#5d5146', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Quick & Low-Energy</h4>
            </div>

            {/* Quick Meal Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quick.map(meal => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  isExpanded={expandedMeal === meal.id}
                  onToggle={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function MealCard({ meal, isExpanded, onToggle }) {
  return (
    <div
      style={{
        borderRadius: '1.5rem', overflow: 'hidden', background: '#ffffff',
        boxShadow: '0 4px 16px rgba(47, 51, 47, 0.06)',
        cursor: 'pointer', transition: 'all 0.3s ease',
      }}
      onClick={onToggle}
    >
      {/* Image */}
      <div style={{ height: '160px', overflow: 'hidden' }}>
        <img
          src={meal.image}
          alt={meal.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <h5 style={{ fontWeight: 700, fontSize: '18px', color: '#2f332f', margin: '0 0 4px' }}>{meal.name}</h5>
        <p style={{ fontSize: '14px', color: '#5f5f5c', margin: '0 0 8px' }}>{meal.description}</p>

        {!isExpanded && (
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#4f645b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            VIEW GUIDE <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
          </p>
        )}

        {/* Expanded */}
        {isExpanded && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(175,179,173,0.2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {meal.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '16px', marginTop: '2px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p style={{ color: '#5c605b', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {meal.ingredients.map((ing, i) => (
                <span key={i} style={{
                  fontSize: '12px', fontWeight: 500, background: '#e6e9e3',
                  padding: '4px 12px', borderRadius: '9999px', color: '#5c605b',
                }}>
                  {ing}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#787c77', marginTop: '12px' }}>
              ⏱ {meal.prepTime}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
