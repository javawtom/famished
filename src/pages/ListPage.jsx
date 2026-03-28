import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import useIngredients from '../hooks/useIngredients'
import groceries, { storeNames, categories, categoryIcons, getGroceriesByStore } from '../data/groceries'

const ingredientCategories = [
  { key: 'produce', label: 'Produce', icon: 'eco', placeholder: 'e.g. Avocados, Bananas' },
  { key: 'dairy', label: 'Dairy', icon: 'egg_alt', placeholder: 'e.g. Greek Yogurt, Eggs' },
  { key: 'meat', label: 'Meat & Fish', icon: 'restaurant', placeholder: 'e.g. Chicken Breast, Salmon' },
  { key: 'grain', label: 'Grains', icon: 'bakery_dining', placeholder: 'e.g. Rice, Oats, Bread' },
  { key: 'frozen', label: 'Frozen', icon: 'ac_unit', placeholder: 'e.g. Frozen Berries' },
  { key: 'pantry', label: 'Pantry', icon: 'kitchen', placeholder: 'e.g. Olive Oil, Peanut Butter' },
  { key: 'other', label: 'Other', icon: 'category', placeholder: 'e.g. Protein Powder' },
]

export default function ListPage() {
  const { checkedGroceries, toggleGrocery, resetGroceryList } = useApp()
  const { ingredients, addIngredient, removeIngredient, clearAll, getStatus, isEmpty } = useIngredients()
  const [activeStore, setActiveStore] = useState('A')
  const [activeTab, setActiveTab] = useState('pantry') // 'grocery' or 'pantry'
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('produce')
  const [showAddForm, setShowAddForm] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiRecipes, setAiRecipes] = useState(null)
  const [aiError, setAiError] = useState(null)
  const [expandedRecipe, setExpandedRecipe] = useState(null)

  // Grocery list data
  const storeItems = useMemo(() => getGroceriesByStore(activeStore), [activeStore])
  const grouped = useMemo(() => {
    const groups = {}
    for (const cat of categories) {
      const items = storeItems.filter(g => g.category === cat)
      if (items.length > 0) groups[cat] = items
    }
    return groups
  }, [storeItems])
  const storeBudget = useMemo(() => storeItems.reduce((sum, g) => sum + g.cost, 0), [storeItems])
  const checkedCount = storeItems.filter(g => checkedGroceries[g.id]).length
  const totalCount = storeItems.length

  // Group ingredients by category
  const ingredientGroups = useMemo(() => {
    const groups = {}
    for (const item of ingredients) {
      const cat = item.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    }
    return groups
  }, [ingredients])

  const handleAddIngredient = () => {
    if (!newItemName.trim()) return
    addIngredient(newItemName, newItemCategory)
    setNewItemName('')
  }

  const handleGenerateRecipes = async () => {
    if (isEmpty) return
    setAiLoading(true)
    setAiError(null)
    setAiRecipes(null)

    try {
      const res = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredients.map(i => ({
            name: i.name,
            expiresIn: getStatus(i).daysLeft,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate')
      }

      const data = await res.json()
      setAiRecipes(data.recipes || [])
    } catch (err) {
      setAiError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ===== HEADER ===== */}
      <section>
        <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#2f332f', margin: '0 0 8px' }}>
          {activeTab === 'grocery' ? 'Master Pantry' : 'My Ingredients'}
        </h2>
        <p style={{ color: '#5f5f5c', fontSize: '16px', lineHeight: 1.6 }}>
          {activeTab === 'grocery'
            ? 'Your essential, high-quality fuel list.'
            : 'Track what\'s in your kitchen. AI will craft recipes from these.'}
        </p>
      </section>

      {/* ===== TAB TOGGLE ===== */}
      <div style={{ display: 'flex', gap: '4px', background: '#e6e9e3', borderRadius: '9999px', padding: '4px' }}>
        {[
          { key: 'pantry', label: 'Ingredients', icon: 'kitchen' },
          { key: 'grocery', label: 'Grocery List', icon: 'shopping_cart' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: '9999px', border: 'none',
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: activeTab === tab.key ? '#ffffff' : 'transparent',
              color: activeTab === tab.key ? '#4f645b' : '#787c77',
              boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== PANTRY TAB ===== */}
      {activeTab === 'pantry' && (
        <>
          {/* Add Ingredient Form */}
          {showAddForm ? (
            <section style={{ background: '#ffffff', padding: '24px', borderRadius: '1.5rem', boxShadow: '0 4px 16px rgba(47,51,47,0.06)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#2f332f', margin: '0 0 16px' }}>Add Ingredient</h4>

              {/* Category selector */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {ingredientCategories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setNewItemCategory(cat.key)}
                    style={{
                      padding: '8px 14px', borderRadius: '9999px', border: 'none',
                      fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: '12px',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: newItemCategory === cat.key ? '#4f645b' : '#f3f4ef',
                      color: newItemCategory === cat.key ? '#e7fef3' : '#5f5f5c',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder={ingredientCategories.find(c => c.key === newItemCategory)?.placeholder || 'Ingredient name...'}
                  autoFocus
                  style={{
                    flex: 1, background: '#f3f4ef', border: 'none', borderRadius: '12px',
                    padding: '14px 16px', fontFamily: "'Manrope', sans-serif",
                    fontSize: '15px', color: '#2f332f', outline: 'none',
                  }}
                />
                <button onClick={handleAddIngredient} style={{
                  background: '#4f645b', color: '#e7fef3', border: 'none', borderRadius: '12px',
                  padding: '14px 20px', fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                }}>Add</button>
              </div>

              <button onClick={() => setShowAddForm(false)} style={{
                marginTop: '12px', background: 'none', border: 'none', color: '#787c77',
                fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              }}>Cancel</button>
            </section>
          ) : (
            <button onClick={() => setShowAddForm(true)} style={{
              width: '100%', padding: '18px', borderRadius: '1.5rem', border: '2px dashed rgba(175,179,173,0.3)',
              background: 'transparent', color: '#4f645b', fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: '15px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.3s ease',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
              Add Ingredient
            </button>
          )}

          {/* Ingredient List */}
          {!isEmpty && (
            <>
              {Object.entries(ingredientGroups).map(([catKey, items]) => {
                const catInfo = ingredientCategories.find(c => c.key === catKey) || { label: catKey, icon: 'category' }
                return (
                  <section key={catKey}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '20px' }}>{catInfo.icon}</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#2f332f' }}>{catInfo.label}</h3>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#787c77', marginLeft: 'auto' }}>{items.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {items.map(item => {
                        const status = getStatus(item)
                        return (
                          <div key={item.id} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '14px 16px', borderRadius: '14px', background: '#ffffff',
                            boxShadow: '0 1px 4px rgba(47,51,47,0.04)',
                          }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#2f332f', margin: '0 0 2px' }}>{item.name}</h4>
                              <p style={{ fontSize: '12px', color: status.color, fontWeight: 600, margin: 0 }}>
                                {status.label}
                                {status.daysLeft > 0 && status.daysLeft <= 5 && ' ⚠️'}
                              </p>
                            </div>
                            <button
                              onClick={() => removeIngredient(item.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                              <span className="material-symbols-outlined" style={{ color: '#afb3ad', fontSize: '20px' }}>close</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}

              {/* AI Recipe Generator */}
              <section style={{
                background: 'linear-gradient(135deg, #4f645b 0%, #3a4c44 100%)',
                padding: '28px', borderRadius: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#b8d9c8', fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <div>
                    <h4 style={{ color: '#e7fef3', fontSize: '18px', fontWeight: 700, margin: '0 0 2px' }}>AI Recipe Builder</h4>
                    <p style={{ color: '#a3bfb3', fontSize: '13px', margin: 0 }}>Generate recipes from your ingredients</p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateRecipes}
                  disabled={aiLoading}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '9999px', border: 'none',
                    background: aiLoading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                    color: '#e7fef3', fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                    fontSize: '15px', cursor: aiLoading ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {aiLoading ? (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_awesome</span>
                      Generate Recipes with AI
                    </>
                  )}
                </button>

                {aiError && (
                  <p style={{ color: '#ffb4ab', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>{aiError}</p>
                )}
              </section>

              {/* AI Generated Recipes */}
              {aiRecipes && aiRecipes.length > 0 && (
                <section>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#2f332f', margin: '0 0 4px' }}>AI Recipes</h3>
                  <p style={{ color: '#5f5f5c', fontSize: '14px', margin: '0 0 20px' }}>Made from your ingredients, prioritizing what expires soon</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {aiRecipes.map((recipe, i) => (
                      <div
                        key={i}
                        onClick={() => setExpandedRecipe(expandedRecipe === i ? null : i)}
                        style={{
                          background: '#ffffff', borderRadius: '1.5rem', padding: '24px',
                          boxShadow: '0 4px 16px rgba(47,51,47,0.06)', cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '9999px', fontSize: '11px',
                                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                background: '#d1e8dd', color: '#42564e',
                              }}>{recipe.mealType}</span>
                              <span style={{
                                padding: '4px 10px', borderRadius: '9999px', fontSize: '11px',
                                fontWeight: 700, background: '#f3f4ef', color: '#5f5f5c',
                              }}>{recipe.prepTime}</span>
                              <span style={{
                                padding: '4px 10px', borderRadius: '9999px', fontSize: '11px',
                                fontWeight: 700, background: '#f3f4ef', color: '#4f645b',
                              }}>{recipe.calories} cal</span>
                            </div>
                            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#2f332f', margin: '0 0 4px' }}>{recipe.name}</h4>
                            <p style={{ color: '#5f5f5c', fontSize: '14px', margin: 0 }}>{recipe.description}</p>
                          </div>
                          <span className="material-symbols-outlined" style={{ color: '#afb3ad', fontSize: '20px', marginLeft: '12px' }}>
                            {expandedRecipe === i ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>

                        {/* Expiring ingredient badges */}
                        {recipe.usesExpiring && recipe.usesExpiring.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                            {recipe.usesExpiring.map((ing, j) => (
                              <span key={j} style={{
                                padding: '3px 8px', borderRadius: '6px', fontSize: '11px',
                                fontWeight: 600, background: '#fff3cd', color: '#856404',
                              }}>⏰ Uses {ing}</span>
                            ))}
                          </div>
                        )}

                        {/* Expanded content */}
                        {expandedRecipe === i && (
                          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(175,179,173,0.15)' }}>
                            <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#5f5f5c', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Ingredients</h5>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                              {recipe.ingredients.map((ing, j) => (
                                <span key={j} style={{
                                  padding: '6px 12px', borderRadius: '9999px', fontSize: '13px',
                                  fontWeight: 500, background: '#f3f4ef', color: '#2f332f',
                                }}>{ing}</span>
                              ))}
                            </div>

                            <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#5f5f5c', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Steps</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {recipe.steps.map((step, j) => (
                                <div key={j} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                  <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                    background: '#d1e8dd', color: '#42564e',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: 700,
                                  }}>{j + 1}</div>
                                  <p style={{ color: '#2f332f', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Clear All */}
              <button onClick={clearAll} style={{
                width: '100%', padding: '14px', borderRadius: '9999px', border: 'none',
                background: '#e6e9e3', color: '#787c77', fontFamily: "'Manrope', sans-serif",
                fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              }}>
                Clear All Ingredients
              </button>
            </>
          )}

          {/* Empty State */}
          {isEmpty && !showAddForm && (
            <section style={{
              textAlign: 'center', padding: '48px 24px', background: '#f3f4ef',
              borderRadius: '2rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'rgba(79,100,91,0.3)', display: 'block', marginBottom: '16px' }}>kitchen</span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#2f332f', margin: '0 0 8px' }}>Your kitchen is empty</h3>
              <p style={{ color: '#5f5f5c', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
                Add ingredients you have at home. AI will generate recipes from them, prioritizing what expires soon.
              </p>
              <button onClick={() => setShowAddForm(true)} style={{
                padding: '14px 32px', borderRadius: '9999px', border: 'none',
                background: '#4f645b', color: '#e7fef3', fontFamily: "'Manrope', sans-serif",
                fontWeight: 700, fontSize: '15px', cursor: 'pointer',
              }}>
                Add Your First Ingredient
              </button>
            </section>
          )}
        </>
      )}

      {/* ===== GROCERY TAB ===== */}
      {activeTab === 'grocery' && (
        <>
          {/* Budget Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: '#f3f4ef', borderRadius: '9999px', padding: '8px 24px 8px 8px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', background: '#4f645b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: '#e7fef3', fontSize: '20px' }}>shopping_cart</span>
            </div>
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: '#5f5f5c', margin: 0 }}>Est. Budget</p>
              <p style={{ fontWeight: 700, color: '#4f645b', margin: 0, fontSize: '16px' }}>${storeBudget.toFixed(2)}</p>
            </div>
          </div>

          {/* Store Toggle */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {['A', 'B'].map(store => (
              <button
                key={store}
                onClick={() => setActiveStore(store)}
                style={{
                  padding: '14px 28px', borderRadius: '9999px', border: 'none',
                  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  background: activeStore === store ? '#4f645b' : '#e6e9e3',
                  color: activeStore === store ? '#e7fef3' : '#2f332f',
                }}
              >
                Store {store}: {storeNames[store]}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '8px', background: '#e6e9e3', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: '#c3dacf', borderRadius: '9999px',
                width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{ color: '#5f5f5c', fontWeight: 500, fontSize: '13px' }}>{checkedCount}/{totalCount}</span>
          </div>

          {/* Categorized Lists */}
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '24px' }}>
                  {categoryIcons[category] || 'category'}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{category}</h3>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#5f5f5c', marginLeft: 'auto' }}>{items.length} Items</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map(item => {
                  const checked = !!checkedGroceries[item.id]
                  return (
                    <div key={item.id} onClick={() => toggleGrocery(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '16px 20px', borderRadius: '16px', cursor: 'pointer',
                        background: checked ? 'rgba(209,232,221,0.4)' : '#ffffff',
                        boxShadow: checked ? 'none' : '0 2px 8px rgba(47,51,47,0.04)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '8px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: checked ? '#4f645b' : 'transparent',
                        border: checked ? 'none' : '2px solid #afb3ad',
                      }}>
                        {checked && <span className="material-symbols-outlined" style={{ color: '#e7fef3', fontSize: '16px' }}>check</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontWeight: 700, fontSize: '15px', margin: '0 0 2px',
                          color: checked ? '#5f5f5c' : '#2f332f',
                          textDecoration: checked ? 'line-through' : 'none',
                        }}>{item.name}</h4>
                        <p style={{ fontSize: '13px', color: '#787c77', margin: 0 }}>{item.brand} • ${item.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}

          {checkedCount > 0 && (
            <button onClick={resetGroceryList} style={{
              width: '100%', padding: '16px', borderRadius: '9999px', border: 'none',
              background: '#e6e9e3', color: '#2f332f', fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            }}>Reset Shopping List</button>
          )}
        </>
      )}
    </div>
  )
}
