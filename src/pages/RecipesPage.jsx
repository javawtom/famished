import { useState } from 'react'
import { useApp } from '../context/AppContext'
import useLocalStorage from '../hooks/useLocalStorage'

export default function RecipesPage() {
  const { weeklyRecipes, cookedRecipes, markCooked } = useApp()
  const [mealPrepMode, setMealPrepMode] = useLocalStorage('fn-mealPrepMode', false)
  const [prepServings, setPrepServings] = useLocalStorage('fn-prepServings', 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* ===== EDITORIAL HEADER ===== */}
      <section>
        <span style={{ color: '#4f645b', fontWeight: 700, letterSpacing: '0.12em', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Weekly Selection</span>
        <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#2f332f', lineHeight: 1.15, margin: '0 0 16px' }}>
          Gentle meals for <span style={{ color: '#4f645b', fontStyle: 'italic' }}>focused</span> days.
        </h2>
        <p style={{ color: '#5f5f5c', fontSize: '16px', lineHeight: 1.6 }}>
          Simple rotations featuring your core pantry essentials. Minimal cleanup, maximum nourishment.
        </p>
      </section>

      {/* ===== MEAL PREP MODE TOGGLE ===== */}
      <div style={{
        borderRadius: '20px', padding: '24px',
        background: mealPrepMode
          ? 'linear-gradient(135deg, #d1e8dd, #e7fef3)'
          : '#f3f4ef',
        border: mealPrepMode ? '2px solid #4f645b' : '2px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '24px', color: mealPrepMode ? '#4f645b' : '#787c77',
              fontVariationSettings: mealPrepMode ? "'FILL' 1" : "'FILL' 0",
            }}>kitchen</span>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#2f332f', display: 'block' }}>
                Meal Prep Mode
              </span>
              <span style={{ fontSize: '12px', color: '#787c77' }}>
                {mealPrepMode ? `Batch cooking for ${prepServings} servings` : 'Cook once, eat all week'}
              </span>
            </div>
          </div>
          {/* Toggle pill */}
          <div
            onClick={() => setMealPrepMode(!mealPrepMode)}
            style={{
              width: '44px', height: '26px', borderRadius: '13px',
              background: mealPrepMode ? '#4f645b' : '#afb3ad',
              position: 'relative', transition: 'background 0.3s ease',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: '#fff', position: 'absolute', top: '3px',
              left: mealPrepMode ? '21px' : '3px',
              transition: 'left 0.3s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>

        {mealPrepMode && (
          <div style={{ marginTop: '16px' }}>
            {/* Servings selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#5f5f5c' }}>Servings:</span>
              {[3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => setPrepServings(n)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    border: prepServings === n ? '2px solid #4f645b' : '2px solid #e0e4dd',
                    background: prepServings === n ? '#4f645b' : 'transparent',
                    color: prepServings === n ? '#fff' : '#5f5f5c',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Manrope', sans-serif",
                    transition: 'all 0.2s ease',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            {/* Prep tips */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '8px',
              padding: '16px', borderRadius: '12px', background: 'rgba(79,100,91,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4f645b' }}>schedule</span>
                <span style={{ fontSize: '12px', color: '#5c605b' }}>Sunday prep → portioned containers for the week</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4f645b' }}>inventory_2</span>
                <span style={{ fontSize: '12px', color: '#5c605b' }}>Each recipe scaled to {prepServings} servings automatically</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4f645b' }}>ac_unit</span>
                <span style={{ fontSize: '12px', color: '#5c605b' }}>Extras freeze great — reheat and go</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== RECIPE CARDS ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {weeklyRecipes.map((meal) => {
          const isCooked = !!cookedRecipes[meal.id]
          const scaledSteps = mealPrepMode
            ? meal.steps.map(step => scalePrepStep(step, prepServings))
            : meal.steps
          const scaledIngredients = mealPrepMode
            ? meal.ingredients.map(ing => scaleIngredient(ing, prepServings))
            : meal.ingredients

          return (
            <article
              key={meal.id}
              style={{
                borderRadius: '2rem', overflow: 'hidden',
                background: '#ffffff',
                boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
              }}
            >
              {/* Hero Image */}
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img
                  src={meal.image}
                  alt={meal.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: '16px', left: '16px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                  borderRadius: '8px', padding: '6px 12px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4f645b' }}>bolt</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2f332f', textTransform: 'uppercase' }}>{meal.prepTime}</span>
                </div>
                {mealPrepMode && (
                  <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(79,100,91,0.9)', backdropFilter: 'blur(8px)',
                    borderRadius: '8px', padding: '6px 12px',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#e7fef3' }}>kitchen</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#e7fef3', textTransform: 'uppercase' }}>×{prepServings}</span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#2f332f', margin: '0 0 4px' }}>{meal.name}</h3>
                {mealPrepMode && (
                  <p style={{ fontSize: '12px', color: '#4f645b', fontWeight: 600, margin: '0 0 16px' }}>
                    🍱 Scaled for {prepServings} individual portions
                  </p>
                )}

                {/* Ingredients list in prep mode */}
                {mealPrepMode && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#4f645b', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>Ingredients (×{prepServings})</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {scaledIngredients.map((ing, i) => (
                        <span key={i} style={{
                          fontSize: '12px', fontWeight: 500, background: '#e6e9e3',
                          padding: '4px 10px', borderRadius: '9999px', color: '#5c605b',
                        }}>
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {scaledSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '18px', marginTop: '1px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <p style={{ color: '#5c605b', fontSize: '15px', margin: 0, lineHeight: 1.6 }}>{step}</p>
                    </div>
                  ))}
                </div>

                {/* Mark as Cooked Button */}
                <button
                  onClick={() => markCooked(meal.id)}
                  style={{
                    display: 'inline-block', border: 'none', borderRadius: '9999px',
                    padding: '14px 32px', fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                    background: isCooked
                      ? '#d1e8dd'
                      : 'linear-gradient(to right, #4f645b, #43574f)',
                    color: isCooked ? '#42564e' : '#e7fef3',
                    boxShadow: isCooked ? 'none' : '0 12px 32px rgba(47, 51, 47, 0.08)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isCooked ? '\u2713 Cooked This Week' : mealPrepMode ? `Prep'd ${prepServings} Servings` : 'Mark as Cooked'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Scale a prep step's quantities by the serving multiplier.
 * Looks for patterns like "2 cups", "1/2 lb", "3 eggs" and multiplies.
 */
function scalePrepStep(step, servings) {
  return step.replace(/(\d+(?:\/\d+)?)\s*(cups?|tbsp|tsp|oz|lbs?|cloves?|pieces?|slices?|eggs?)/gi, (match, num, unit) => {
    const val = num.includes('/') ? eval(num) : parseFloat(num)
    const scaled = Math.round(val * servings * 10) / 10
    return `${scaled} ${unit}`
  })
}

/**
 * Scale ingredient quantities for meal prep.
 */
function scaleIngredient(ingredient, servings) {
  // Try to find a leading quantity
  const match = ingredient.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(.*)/)
  if (match) {
    const val = match[1].includes('/') ? eval(match[1]) : parseFloat(match[1])
    const scaled = Math.round(val * servings * 10) / 10
    return `${scaled} ${match[2]}`
  }
  return `${servings}× ${ingredient}`
}
