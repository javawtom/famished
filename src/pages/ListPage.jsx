import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import groceries, { storeNames, categories, categoryIcons, getTotalBudget, getGroceriesByStore } from '../data/groceries'

export default function ListPage() {
  const { checkedGroceries, toggleGrocery, resetGroceryList } = useApp()
  const [activeStore, setActiveStore] = useState('A')

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ===== HEADER ===== */}
      <section>
        <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#2f332f', margin: '0 0 8px' }}>Master Pantry</h2>
        <p style={{ color: '#5f5f5c', fontSize: '16px', lineHeight: 1.6 }}>
          Your essential, high-quality fuel list. Curated for nutrient density and minimal decision fatigue.
        </p>

        {/* Budget Pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px', marginTop: '16px',
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
      </section>

      {/* ===== STORE TOGGLE ===== */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
        {['A', 'B'].map(store => (
          <button
            key={store}
            onClick={() => setActiveStore(store)}
            style={{
              padding: '14px 28px', borderRadius: '9999px', border: 'none',
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s ease',
              background: activeStore === store ? '#4f645b' : '#e6e9e3',
              color: activeStore === store ? '#e7fef3' : '#2f332f',
              boxShadow: activeStore === store ? '0 12px 32px rgba(47, 51, 47, 0.08)' : 'none',
            }}
          >
            Store {store}: {storeNames[store]}
          </button>
        ))}
      </div>

      {/* ===== PROGRESS ===== */}
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

      {/* ===== CATEGORIZED LISTS ===== */}
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
                <div
                  key={item.id}
                  onClick={() => toggleGrocery(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 20px', borderRadius: '16px', cursor: 'pointer',
                    background: checked ? 'rgba(209, 232, 221, 0.4)' : '#ffffff',
                    boxShadow: checked ? 'none' : '0 2px 8px rgba(47, 51, 47, 0.04)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '8px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: checked ? '#4f645b' : 'transparent',
                    border: checked ? 'none' : '2px solid #afb3ad',
                    transition: 'all 0.3s ease',
                  }}>
                    {checked && <span className="material-symbols-outlined" style={{ color: '#e7fef3', fontSize: '16px' }}>check</span>}
                  </div>

                  {/* Item Info */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontWeight: 700, fontSize: '15px', margin: '0 0 2px',
                      color: checked ? '#5f5f5c' : '#2f332f',
                      textDecoration: checked ? 'line-through' : 'none',
                    }}>{item.name}</h4>
                    <p style={{ fontSize: '13px', color: '#787c77', margin: 0 }}>
                      {item.brand} • ${item.cost.toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {/* ===== RESET ===== */}
      {checkedCount > 0 && (
        <button
          onClick={resetGroceryList}
          style={{
            width: '100%', padding: '16px', borderRadius: '9999px', border: 'none',
            background: '#e6e9e3', color: '#2f332f', fontFamily: "'Manrope', sans-serif",
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
          }}
        >
          Reset Shopping List
        </button>
      )}
    </div>
  )
}
