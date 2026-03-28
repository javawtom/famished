import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const COMMON_APPLIANCES = [
  { id: 'blender', name: 'Blender', icon: 'blender' },
  { id: 'oven', name: 'Oven', icon: 'oven_gen' },
  { id: 'microwave', name: 'Microwave', icon: 'microwave' },
  { id: 'stove', name: 'Stovetop', icon: 'cooking' },
  { id: 'airfryer', name: 'Air Fryer', icon: 'skillet' },
  { id: 'toaster', name: 'Toaster', icon: 'breakfast_dining' },
  { id: 'slowcooker', name: 'Slow Cooker', icon: 'soup_kitchen' },
  { id: 'pressureCooker', name: 'Pressure Cooker', icon: 'soup_kitchen' },
  { id: 'ricecooker', name: 'Rice Cooker', icon: 'rice_bowl' },
  { id: 'grill', name: 'Grill', icon: 'outdoor_grill' },
  { id: 'toasteroven', name: 'Toaster Oven', icon: 'oven_gen' },
  { id: 'foodprocessor', name: 'Food Processor', icon: 'blender' },
  { id: 'standmixer', name: 'Stand Mixer', icon: 'blender' },
  { id: 'griddle', name: 'Griddle / Flat Top', icon: 'skillet' },
  { id: 'waffle', name: 'Waffle Maker', icon: 'breakfast_dining' },
  { id: 'kettle', name: 'Electric Kettle', icon: 'coffee' },
  { id: 'coffeemaker', name: 'Coffee Maker', icon: 'coffee_maker' },
  { id: 'juicer', name: 'Juicer', icon: 'local_cafe' },
  { id: 'dehydrator', name: 'Dehydrator', icon: 'air' },
  { id: 'smoker', name: 'Smoker', icon: 'outdoor_grill' },
]

export default function ProfilePage({ onClose }) {
  const [appliances, setAppliances] = useLocalStorage('fn-appliances', [])
  const [customName, setCustomName] = useState('')
  const [showAddCustom, setShowAddCustom] = useState(false)

  const toggleAppliance = (id) => {
    setAppliances(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    )
  }

  const addCustomAppliance = () => {
    if (!customName.trim()) return
    const id = `custom-${customName.trim().toLowerCase().replace(/\s+/g, '-')}`
    if (!appliances.includes(id)) {
      // Store custom appliances with a special prefix
      setAppliances(prev => [...prev, id])
    }
    setCustomName('')
    setShowAddCustom(false)
  }

  const customAppliances = appliances
    .filter(id => id.startsWith('custom-'))
    .map(id => ({
      id,
      name: id.replace('custom-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      icon: 'kitchen',
    }))

  const allAppliances = [...COMMON_APPLIANCES, ...customAppliances]

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Profile Panel */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '420px',
        background: '#faf9f5', zIndex: 201,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-16px 0 48px rgba(0,0,0,0.12)',
        animation: 'slideInRight 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 24px 24px', borderBottom: '1px solid rgba(175,179,173,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#d1e8dd', border: '3px solid #c3dacf',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4f645b', fontWeight: 800, fontSize: '22px',
              }}>J</div>
              <div>
                <h2 style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: 800, color: '#2f332f' }}>Jody</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#787c77', fontWeight: 500 }}>
                  {appliances.length} appliance{appliances.length !== 1 ? 's' : ''} configured
                </p>
              </div>
            </div>
            <span
              className="material-symbols-outlined"
              onClick={onClose}
              style={{ color: '#5f5f5c', cursor: 'pointer', padding: '8px', fontSize: '24px' }}
            >close</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Kitchen Appliances Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '20px' }}>kitchen</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#2f332f' }}>My Kitchen</h3>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#787c77', lineHeight: 1.5 }}>
              Select the appliances you have. Famished will only suggest recipes you can actually make.
            </p>

            {/* Appliance Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
            }}>
              {allAppliances.map(app => {
                const isActive = appliances.includes(app.id)
                return (
                  <button
                    key={app.id}
                    onClick={() => toggleAppliance(app.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      padding: '14px 8px', borderRadius: '16px',
                      border: isActive ? '2px solid #4f645b' : '2px solid transparent',
                      background: isActive ? '#d1e8dd' : '#f3f4ef',
                      cursor: 'pointer',
                      fontFamily: "'Manrope', sans-serif",
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{
                      fontSize: '24px',
                      color: isActive ? '#4f645b' : '#787c77',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}>{app.icon}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#42564e' : '#5f5f5c',
                      textAlign: 'center', lineHeight: 1.2,
                    }}>{app.name}</span>
                  </button>
                )
              })}

              {/* Add Custom Button */}
              <button
                onClick={() => setShowAddCustom(true)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '14px 8px', borderRadius: '16px',
                  border: '2px dashed #afb3ad',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: '24px', color: '#afb3ad',
                }}>add</span>
                <span style={{
                  fontSize: '11px', fontWeight: 500, color: '#afb3ad',
                }}>Add Custom</span>
              </button>
            </div>

            {/* Add Custom Appliance Input */}
            {showAddCustom && (
              <div style={{
                marginTop: '16px', display: 'flex', gap: '10px',
              }}>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomAppliance()}
                  placeholder="e.g. Sous Vide, Panini Press..."
                  autoFocus
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: '12px',
                    border: 'none', background: '#edefe9',
                    fontFamily: "'Manrope', sans-serif", fontSize: '14px',
                    color: '#2f332f', outline: 'none',
                  }}
                />
                <button
                  onClick={addCustomAppliance}
                  style={{
                    padding: '12px 20px', borderRadius: '12px',
                    border: 'none', background: '#4f645b', color: '#e7fef3',
                    fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                    fontSize: '13px', cursor: 'pointer',
                  }}
                >Add</button>
                <button
                  onClick={() => { setShowAddCustom(false); setCustomName('') }}
                  style={{
                    padding: '12px', borderRadius: '12px',
                    border: 'none', background: '#e6e9e3', color: '#2f332f',
                    fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >✕</button>
              </div>
            )}
          </div>

          {/* Active Appliances Summary */}
          {appliances.length > 0 && (
            <div style={{
              padding: '20px', background: '#edefe9', borderRadius: '16px',
            }}>
              <p style={{
                margin: '0 0 12px', fontSize: '11px', fontWeight: 700,
                color: '#5f5f5c', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Active Kitchen Setup</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {appliances.map(id => {
                  const app = allAppliances.find(a => a.id === id)
                  if (!app) return null
                  return (
                    <span key={id} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '6px 12px', borderRadius: '9999px',
                      background: '#d1e8dd', color: '#42564e',
                      fontSize: '12px', fontWeight: 600,
                    }}>
                      <span className="material-symbols-outlined" style={{
                        fontSize: '14px', fontVariationSettings: "'FILL' 1",
                      }}>{app.icon}</span>
                      {app.name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
