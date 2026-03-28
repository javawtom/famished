import { useApp } from '../context/AppContext'

export default function RecipesPage() {
  const { weeklyRecipes, cookedRecipes, markCooked } = useApp()

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

      {/* ===== RECIPE CARDS ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {weeklyRecipes.map((meal) => {
          const isCooked = !!cookedRecipes[meal.id]

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
              </div>

              {/* Card Content */}
              <div style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#2f332f', margin: '0 0 20px' }}>{meal.name}</h3>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {meal.steps.map((step, i) => (
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
                  {isCooked ? '\u2713 Cooked This Week' : 'Mark as Cooked'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
