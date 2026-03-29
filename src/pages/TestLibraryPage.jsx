import { useState, useMemo } from 'react'

// Import all meals directly
const meals = []
import { getHealthyMeals, getQuickMeals } from '../data/meals'

// Build a full list from all meal types
function getAllMeals() {
  const types = ['breakfast', 'lunch', 'dinner']
  const all = []
  types.forEach(t => {
    all.push(...getHealthyMeals(t))
    all.push(...getQuickMeals(t))
  })
  return all
}

export default function TestLibraryPage() {
  const allMeals = useMemo(() => getAllMeals(), [])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [likedIds, setLikedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('testlib_liked') || '[]') } catch { return [] }
  })

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'healthy', label: 'Healthy' },
    { key: 'quick', label: 'Quick' },
  ]

  const filtered = useMemo(() => {
    let result = allMeals
    if (activeFilter !== 'all') {
      result = result.filter(m => m.type === activeFilter || m.category === activeFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.ingredients?.some(ing => ing.toLowerCase().includes(q))
      )
    }
    return result
  }, [allMeals, activeFilter, search])

  const toggleLike = (id) => {
    setLikedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('testlib_liked', JSON.stringify(next))
      return next
    })
  }

  const expandedMeal = expandedId ? allMeals.find(m => m.id === expandedId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ===== HEADER ===== */}
      <section>
        <h2 style={{
          fontSize: '32px', fontWeight: 800, color: '#2f332f',
          lineHeight: 1.15, margin: '0 0 4px', letterSpacing: '-0.02em',
        }}>Recipe Library</h2>
        <p style={{ color: '#5f5f5c', fontSize: '14px', margin: '0 0 24px' }}>
          Good food at home
        </p>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#f3f4ef', borderRadius: '14px', padding: '12px 16px',
          marginBottom: '16px',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#787c77' }}>search</span>
          <input
            type="text"
            placeholder="Search for recipes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', background: 'none', outline: 'none',
              fontFamily: "'Manrope', sans-serif", fontSize: '14px', color: '#2f332f',
            }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: '8px 18px', borderRadius: '9999px', border: 'none',
                fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                background: activeFilter === f.key ? '#2f332f' : '#f3f4ef',
                color: activeFilter === f.key ? '#fff' : '#5f5f5c',
              }}
            >{f.label}</button>
          ))}
        </div>
      </section>

      {/* ===== RECIPE CARDS ===== */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#787c77' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '12px', opacity: 0.4 }}>search_off</span>
            <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>No recipes found</p>
          </div>
        )}

        {filtered.map(meal => {
          const isExpanded = expandedId === meal.id
          const isLiked = likedIds.includes(meal.id)

          return (
            <div
              key={meal.id}
              style={{
                borderRadius: '2rem',
                boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
                cursor: 'pointer',
                background: '#fff',
              }}
            >
              {/* ===== IMAGE ===== */}
              <div style={{
                width: '100%', aspectRatio: '4/3',
                position: 'relative', overflow: 'hidden',
                borderRadius: '2rem 2rem 0 0',
              }}>
                <img
                  src={meal.image}
                  alt={meal.name}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    display: 'block',
                  }}
                  loading="lazy"
                />

                {/* Heart button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(meal.id) }}
                  style={{
                    position: 'absolute', top: '14px', right: '14px',
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{
                    fontSize: '20px',
                    color: isLiked ? '#e74c3c' : '#787c77',
                    fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
                  }}>favorite</span>
                </button>

                {/* Category pills */}
                <div style={{
                  position: 'absolute', bottom: '14px', left: '14px',
                  display: 'flex', gap: '6px',
                }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '9999px',
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                    color: '#4f645b',
                  }}>{meal.type}</span>
                  <span style={{
                    padding: '4px 12px', borderRadius: '9999px',
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: meal.category === 'healthy' ? 'rgba(79,100,91,0.9)' : 'rgba(105,93,82,0.9)',
                    color: '#fff',
                  }}>{meal.category}</span>
                </div>
              </div>

              {/* ===== INFO PANEL — slides up over image when expanded ===== */}
              <div
                className="card-panel"
                onClick={() => setExpandedId(isExpanded ? null : meal.id)}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  background: '#ffffff',
                  borderRadius: '1.5rem 1.5rem 2rem 2rem',
                  boxShadow: isExpanded ? '0 -8px 30px rgba(0,0,0,0.12)' : 'none',
                  padding: '20px 24px 24px',
                  /* negative margin pulls panel up over the image */
                  marginTop: isExpanded ? '-45%' : '0',
                  transition: 'margin-top 0.45s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.3s ease',
                }}
              >
                {/* Grab handle */}
                <div style={{
                  width: '36px', height: '4px', borderRadius: '2px',
                  background: 'rgba(175,179,173,0.3)', margin: '0 auto 16px',
                  opacity: isExpanded ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }} />

                {/* Title row — always visible */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '12px', fontWeight: 600, color: '#4f645b',
                      margin: '0 0 4px', textTransform: 'lowercase',
                    }}>{meal.category}</p>
                    <h3 style={{
                      fontSize: '22px', fontWeight: 800, color: '#2f332f',
                      margin: '0 0 6px', lineHeight: 1.2,
                    }}>{meal.name}</h3>
                    <p style={{
                      fontSize: '13px', color: '#787c77', fontWeight: 500, margin: 0,
                    }}>{meal.description}</p>
                  </div>

                  {/* Arrow button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : meal.id) }}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: '#2f332f', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginLeft: '16px', marginTop: '4px',
                      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{
                      fontSize: '20px', color: '#fff',
                    }}>arrow_forward</span>
                  </button>
                </div>

                {/* ===== Recipe details (revealed when expanded) ===== */}
                <div style={{
                  display: 'grid',
                  gridTemplateRows: isExpanded ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
                }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{
                      marginTop: '20px', paddingTop: '20px',
                      borderTop: '1px solid rgba(175,179,173,0.15)',
                      opacity: isExpanded ? 1 : 0,
                      transition: 'opacity 0.3s ease 0.15s',
                    }}>
                      <h4 style={{
                        fontSize: '14px', fontWeight: 800, color: '#2f332f',
                        margin: '0 0 10px',
                      }}>Overview</h4>
                      <p style={{
                        fontSize: '14px', color: '#5f5f5c', lineHeight: 1.7,
                        margin: '0 0 20px',
                      }}>
                        {meal.description} Ready in just {meal.prepTime}. You need only {meal.ingredients?.length || 0} ingredients.
                      </p>

                      {/* Stats row */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, background: '#f3f4ef', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#4f645b', display: 'block', marginBottom: '4px' }}>schedule</span>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#2f332f', margin: '0 0 2px' }}>{meal.prepTime}</p>
                          <p style={{ fontSize: '10px', fontWeight: 600, color: '#787c77', textTransform: 'uppercase', margin: 0 }}>Prep Time</p>
                        </div>
                        <div style={{ flex: 1, background: '#f3f4ef', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#4f645b', display: 'block', marginBottom: '4px' }}>grocery</span>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#2f332f', margin: '0 0 2px' }}>{meal.ingredients?.length || 0}</p>
                          <p style={{ fontSize: '10px', fontWeight: 600, color: '#787c77', textTransform: 'uppercase', margin: 0 }}>Ingredients</p>
                        </div>
                        <div style={{ flex: 1, background: '#f3f4ef', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#4f645b', display: 'block', marginBottom: '4px' }}>format_list_numbered</span>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#2f332f', margin: '0 0 2px' }}>{meal.steps?.length || 0}</p>
                          <p style={{ fontSize: '10px', fontWeight: 600, color: '#787c77', textTransform: 'uppercase', margin: 0 }}>Steps</p>
                        </div>
                      </div>

                      {/* Ingredients */}
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#2f332f', margin: '0 0 10px' }}>Ingredients</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {meal.ingredients?.map((ing, i) => (
                          <span key={i} style={{
                            padding: '6px 14px', borderRadius: '9999px',
                            fontSize: '12px', fontWeight: 600,
                            background: '#edefe9', color: '#4f645b',
                          }}>{ing}</span>
                        ))}
                      </div>

                      {/* Steps */}
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#2f332f', margin: '0 0 12px' }}>Steps</h4>
                      {meal.steps?.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                            background: '#4f645b', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, marginTop: '1px',
                          }}>{i + 1}</div>
                          <p style={{ color: '#5f5f5c', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>{step}</p>
                        </div>
                      ))}

                      {/* CTA */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: '24px', paddingTop: '20px',
                        borderTop: '1px solid rgba(175,179,173,0.15)',
                      }}>
                        <p style={{ fontSize: '16px', fontWeight: 700, color: '#2f332f', margin: 0 }}>Let's start cooking</p>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '44px', height: '44px', borderRadius: '50%',
                            background: '#2f332f', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#fff' }}>arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
