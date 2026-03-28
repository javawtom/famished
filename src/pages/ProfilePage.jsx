import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import useMealNotifications from '../hooks/useMealNotifications'
import useCardRanking from '../hooks/useCardRanking'
import useWithings from '../hooks/useWithings'
import meals from '../data/meals'

const APPLIANCE_TEMPLATES = [
  { id: 'blender', name: 'Blender', icon: 'blender', hint: 'e.g. Vitamix 750, NutriBullet Pro' },
  { id: 'oven', name: 'Oven', icon: 'oven_gen', hint: 'e.g. GE Profile, Samsung' },
  { id: 'microwave', name: 'Microwave', icon: 'microwave', hint: 'e.g. Panasonic, Breville' },
  { id: 'stove', name: 'Stovetop', icon: 'cooking', hint: 'e.g. Gas, Electric, Induction' },
  { id: 'airfryer', name: 'Air Fryer', icon: 'skillet', hint: 'e.g. Typhur Dome 2, Ninja Foodi' },
  { id: 'toaster', name: 'Toaster', icon: 'breakfast_dining', hint: 'e.g. Breville, Cuisinart' },
  { id: 'slowcooker', name: 'Slow Cooker', icon: 'soup_kitchen', hint: 'e.g. Crock-Pot, Hamilton Beach' },
  { id: 'pressureCooker', name: 'Pressure Cooker', icon: 'soup_kitchen', hint: 'e.g. Instant Pot Duo, Ninja Foodi' },
  { id: 'ricecooker', name: 'Rice Cooker', icon: 'rice_bowl', hint: 'e.g. Zojirushi, Aroma' },
  { id: 'grill', name: 'Grill', icon: 'outdoor_grill', hint: 'e.g. Weber, Traeger, George Foreman' },
  { id: 'toasteroven', name: 'Toaster Oven', icon: 'oven_gen', hint: 'e.g. Breville Smart Oven' },
  { id: 'foodprocessor', name: 'Food Processor', icon: 'blender', hint: 'e.g. Cuisinart 14-Cup' },
  { id: 'standmixer', name: 'Stand Mixer', icon: 'blender', hint: 'e.g. KitchenAid Artisan' },
  { id: 'griddle', name: 'Griddle / Flat Top', icon: 'skillet', hint: 'e.g. Blackstone, Lodge Cast Iron' },
  { id: 'waffle', name: 'Waffle Maker', icon: 'breakfast_dining', hint: 'e.g. Dash, Cuisinart' },
  { id: 'kettle', name: 'Electric Kettle', icon: 'coffee', hint: 'e.g. Fellow Stagg, Bonavita' },
  { id: 'coffeemaker', name: 'Coffee Maker', icon: 'coffee_maker', hint: 'e.g. Keurig, Nespresso, Technivorm' },
  { id: 'juicer', name: 'Juicer', icon: 'local_cafe', hint: 'e.g. Breville Juice Fountain' },
  { id: 'dehydrator', name: 'Dehydrator', icon: 'air', hint: 'e.g. Excalibur, NESCO' },
  { id: 'smoker', name: 'Smoker', icon: 'outdoor_grill', hint: 'e.g. Traeger, Masterbuilt' },
]

/**
 * Appliance storage format:
 * { [id]: { enabled: true, model: "Vitamix 750 Series" } }
 * 
 * This lets the AI know exactly which appliance models the user has.
 */

export default function ProfilePage({ onClose }) {
  // v2: object-based storage with brand/model
  const [applianceData, setApplianceData] = useLocalStorage('fn-appliances-v2', {})
  const [editingId, setEditingId] = useState(null)
  const [modelInput, setModelInput] = useState('')
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customModel, setCustomModel] = useState('')
  const notifications = useMealNotifications()
  const ranking = useCardRanking()
  const withings = useWithings()

  // Get discarded meals
  const discardedMeals = meals.filter(m => ranking.isDiscarded(m.id))

  const toggleAppliance = (id) => {
    setApplianceData(prev => {
      const current = prev[id]
      if (current?.enabled) {
        // Disable but keep the model data
        return { ...prev, [id]: { ...current, enabled: false } }
      } else {
        return { ...prev, [id]: { enabled: true, model: current?.model || '' } }
      }
    })
  }

  const startEditing = (id, e) => {
    e.stopPropagation()
    setEditingId(id)
    setModelInput(applianceData[id]?.model || '')
  }

  const saveModel = (id) => {
    setApplianceData(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: true, model: modelInput.trim() }
    }))
    setEditingId(null)
    setModelInput('')
  }

  const addCustom = () => {
    if (!customName.trim()) return
    const id = `custom-${customName.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    setApplianceData(prev => ({
      ...prev,
      [id]: { enabled: true, model: customModel.trim(), customName: customName.trim() }
    }))
    setCustomName('')
    setCustomModel('')
    setShowAddCustom(false)
  }

  const removeCustom = (id, e) => {
    e.stopPropagation()
    setApplianceData(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // Build custom appliance templates from stored data
  const customTemplates = Object.entries(applianceData)
    .filter(([id]) => id.startsWith('custom-'))
    .map(([id, data]) => ({
      id,
      name: data.customName || id.replace(/^custom-/, '').replace(/-\d+$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      icon: 'kitchen',
      hint: 'Custom appliance',
    }))

  const allTemplates = [...APPLIANCE_TEMPLATES, ...customTemplates]
  const activeCount = Object.values(applianceData).filter(a => a.enabled).length

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
        width: '100%', maxWidth: '440px',
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
                  {activeCount} appliance{activeCount !== 1 ? 's' : ''} configured
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
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '20px' }}>kitchen</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#2f332f' }}>My Kitchen</h3>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#787c77', lineHeight: 1.5 }}>
              Add your appliances with brand & model. The AI will tailor recipes to your exact equipment.
            </p>

            {/* Appliance List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allTemplates.map(tmpl => {
                const data = applianceData[tmpl.id]
                const isActive = data?.enabled
                const isEditing = editingId === tmpl.id
                const isCustom = tmpl.id.startsWith('custom-')

                return (
                  <div key={tmpl.id}>
                    <div
                      onClick={() => toggleAppliance(tmpl.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 16px', borderRadius: '16px',
                        border: isActive ? '2px solid #4f645b' : '2px solid transparent',
                        background: isActive ? '#d1e8dd' : '#f3f4ef',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{
                        fontSize: '22px',
                        color: isActive ? '#4f645b' : '#787c77',
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                      }}>{tmpl.icon}</span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '14px', fontWeight: isActive ? 700 : 500,
                            color: isActive ? '#42564e' : '#5f5f5c',
                          }}>{tmpl.name}</span>
                        </div>
                        {isActive && data?.model && (
                          <span style={{
                            fontSize: '11px', color: '#43574f', fontWeight: 600,
                            display: 'block', marginTop: '2px',
                          }}>{data.model}</span>
                        )}
                        {isActive && !data?.model && (
                          <span style={{
                            fontSize: '11px', color: '#afb3ad', fontStyle: 'italic',
                          }}>Tap pencil to add brand/model</span>
                        )}
                      </div>

                      {/* Edit model button */}
                      {isActive && (
                        <span
                          className="material-symbols-outlined"
                          onClick={(e) => startEditing(tmpl.id, e)}
                          style={{ fontSize: '18px', color: '#787c77', cursor: 'pointer', padding: '4px' }}
                        >edit</span>
                      )}

                      {/* Remove button for custom */}
                      {isCustom && (
                        <span
                          className="material-symbols-outlined"
                          onClick={(e) => removeCustom(tmpl.id, e)}
                          style={{ fontSize: '18px', color: '#a73b21', cursor: 'pointer', padding: '4px' }}
                        >delete</span>
                      )}
                    </div>

                    {/* Inline model editor */}
                    {isEditing && (
                      <div style={{
                        display: 'flex', gap: '8px', padding: '10px 16px',
                        background: '#edefe9', borderRadius: '0 0 16px 16px',
                        marginTop: '-4px',
                      }}>
                        <input
                          type="text"
                          value={modelInput}
                          onChange={e => setModelInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveModel(tmpl.id)}
                          placeholder={tmpl.hint}
                          autoFocus
                          style={{
                            flex: 1, padding: '10px 14px', borderRadius: '10px',
                            border: 'none', background: '#faf9f5',
                            fontFamily: "'Manrope', sans-serif", fontSize: '13px',
                            color: '#2f332f', outline: 'none',
                          }}
                        />
                        <button
                          onClick={() => saveModel(tmpl.id)}
                          style={{
                            padding: '10px 16px', borderRadius: '10px',
                            border: 'none', background: '#4f645b', color: '#e7fef3',
                            fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                            fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >Save</button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: '10px', borderRadius: '10px',
                            border: 'none', background: '#e6e9e3', color: '#2f332f',
                            fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >✕</button>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add Custom */}
              {!showAddCustom ? (
                <button
                  onClick={() => setShowAddCustom(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: '16px',
                    border: '2px dashed #afb3ad', background: 'transparent',
                    cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#afb3ad' }}>add</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#afb3ad' }}>Add Custom Appliance</span>
                </button>
              ) : (
                <div style={{
                  padding: '16px', borderRadius: '16px', background: '#edefe9',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="Appliance name (e.g. Sous Vide)"
                    autoFocus
                    style={{
                      padding: '12px 14px', borderRadius: '10px', border: 'none',
                      background: '#faf9f5', fontFamily: "'Manrope', sans-serif",
                      fontSize: '14px', color: '#2f332f', outline: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={customModel}
                    onChange={e => setCustomModel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustom()}
                    placeholder="Brand & model (e.g. Anova Precision)"
                    style={{
                      padding: '12px 14px', borderRadius: '10px', border: 'none',
                      background: '#faf9f5', fontFamily: "'Manrope', sans-serif",
                      fontSize: '14px', color: '#2f332f', outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={addCustom}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                        background: '#4f645b', color: '#e7fef3',
                        fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                        fontSize: '13px', cursor: 'pointer',
                      }}
                    >Add</button>
                    <button
                      onClick={() => { setShowAddCustom(false); setCustomName(''); setCustomModel('') }}
                      style={{
                        padding: '12px 16px', borderRadius: '10px', border: 'none',
                        background: '#e6e9e3', color: '#2f332f',
                        fontFamily: "'Manrope', sans-serif", fontWeight: 700, cursor: 'pointer',
                      }}
                    >Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Setup Summary */}
          {activeCount > 0 && (
            <div style={{
              padding: '20px', background: '#edefe9', borderRadius: '16px',
            }}>
              <p style={{
                margin: '0 0 14px', fontSize: '11px', fontWeight: 700,
                color: '#5f5f5c', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Active Kitchen Setup</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(applianceData)
                  .filter(([, d]) => d.enabled)
                  .map(([id, data]) => {
                    const tmpl = allTemplates.find(t => t.id === id)
                    const displayName = tmpl?.name || data.customName || id
                    return (
                      <div key={id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 12px', borderRadius: '12px',
                        background: '#d1e8dd',
                      }}>
                        <span className="material-symbols-outlined" style={{
                          fontSize: '16px', color: '#42564e', fontVariationSettings: "'FILL' 1",
                        }}>{tmpl?.icon || 'kitchen'}</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#42564e' }}>
                            {displayName}
                          </span>
                          {data.model && (
                            <span style={{ fontSize: '11px', color: '#43574f', marginLeft: '8px', fontWeight: 500 }}>
                              {data.model}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* ===== WITHINGS CONNECTION ===== */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '20px' }}>monitor_weight</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#2f332f' }}>Withings Integration</h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#787c77', lineHeight: 1.5 }}>
              Connect your Withings scale & sleep mat for automatic weight and sleep tracking.
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderRadius: '16px',
              background: withings.connected ? '#d1e8dd' : '#f3f4ef',
              border: withings.connected ? '2px solid #4f645b' : '2px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '22px',
                  color: withings.connected ? '#4f645b' : '#787c77',
                  fontVariationSettings: withings.connected ? "'FILL' 1" : "'FILL' 0",
                }}>monitor_weight</span>
                <div>
                  <span style={{
                    fontSize: '14px', fontWeight: 700,
                    color: withings.connected ? '#42564e' : '#5f5f5c',
                  }}>{withings.loading ? 'Checking...' : withings.connected ? 'Connected' : 'Not Connected'}</span>
                  <span style={{ display: 'block', fontSize: '11px', color: '#787c77' }}>
                    {withings.serverDown
                      ? 'Start the API server'
                      : withings.connected
                        ? withings.syncing ? 'Syncing...' : 'Auto-syncing weight & sleep'
                        : 'Scale · Sleep Mat'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {withings.connected && (
                  <button
                    onClick={withings.refresh}
                    disabled={withings.syncing}
                    style={{
                      padding: '8px', borderRadius: '10px', border: 'none',
                      background: 'rgba(47,67,60,0.1)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{
                      color: '#2f433c', fontSize: '18px',
                      animation: withings.syncing ? 'spin 1s linear infinite' : 'none',
                    }}>refresh</span>
                  </button>
                )}
                {!withings.loading && !withings.serverDown && (
                  <button
                    onClick={withings.connected ? withings.disconnect : withings.connect}
                    style={{
                      padding: '8px 16px', borderRadius: '9999px', border: 'none',
                      fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '12px',
                      cursor: 'pointer',
                      background: withings.connected ? 'rgba(167,59,33,0.1)' : '#4f645b',
                      color: withings.connected ? '#a73b21' : '#e7fef3',
                    }}
                  >
                    {withings.connected ? 'Disconnect' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ===== NOTIFICATIONS SECTION ===== */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '20px' }}>notifications</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#2f332f' }}>Meal Prep Reminders</h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#787c77', lineHeight: 1.5 }}>
              Get notified 30 min before each meal so you have time to prep.
            </p>
            <div
              onClick={() => notifications.toggleEnabled()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: '16px',
                background: notifications.enabled ? '#d1e8dd' : '#f3f4ef',
                border: notifications.enabled ? '2px solid #4f645b' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '22px',
                  color: notifications.enabled ? '#4f645b' : '#787c77',
                  fontVariationSettings: notifications.enabled ? "'FILL' 1" : "'FILL' 0",
                }}>notifications_active</span>
                <div>
                  <span style={{
                    fontSize: '14px', fontWeight: 700,
                    color: notifications.enabled ? '#42564e' : '#5f5f5c',
                  }}>{notifications.enabled ? 'Reminders On' : 'Enable Reminders'}</span>
                  <span style={{
                    display: 'block', fontSize: '11px',
                    color: notifications.enabled ? '#43574f' : '#afb3ad',
                  }}>
                    {notifications.enabled
                      ? '7:30a · 12:30p · 3:30p · 6:30p · 9:30p'
                      : 'Prep alerts 30 min before meals'}
                  </span>
                </div>
              </div>
              {/* Toggle pill */}
              <div style={{
                width: '44px', height: '26px', borderRadius: '13px',
                background: notifications.enabled ? '#4f645b' : '#afb3ad',
                position: 'relative', transition: 'background 0.3s ease',
                flexShrink: 0,
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#fff', position: 'absolute', top: '3px',
                  left: notifications.enabled ? '21px' : '3px',
                  transition: 'left 0.3s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
            {notifications.enabled && !notifications.supportsNotifications && (
              <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#787c77', fontStyle: 'italic' }}>
                📱 Browser notifications aren't supported here. You'll see in-app alerts when the app is open.
              </p>
            )}
          </div>

          {/* ===== DISCARDED CARDS SECTION ===== */}
          {discardedMeals.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span className="material-symbols-outlined" style={{ color: '#a73b21', fontSize: '20px' }}>delete_sweep</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#2f332f' }}>Discarded Meals</h3>
                <span style={{
                  marginLeft: 'auto', padding: '3px 10px', borderRadius: '9999px',
                  fontSize: '11px', fontWeight: 700, background: '#f5e6e1', color: '#a73b21',
                }}>{discardedMeals.length}</span>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#787c77', lineHeight: 1.5 }}>
                Meals you've swiped away too many times. Restore them or delete permanently.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {discardedMeals.map(meal => (
                  <div key={meal.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '14px',
                    background: '#fdf5f3', border: '1px solid rgba(167,59,33,0.1)',
                  }}>
                    <img src={meal.image} alt={meal.name} style={{
                      width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#2f332f', display: 'block' }}>
                        {meal.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#a73b21', fontWeight: 600 }}>
                        Score: {ranking.getScore(meal.id)}
                      </span>
                    </div>
                    <button
                      onClick={() => ranking.restoreCard(meal.id)}
                      style={{
                        padding: '8px 14px', borderRadius: '10px', border: 'none',
                        background: '#d1e8dd', color: '#42564e',
                        fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                        fontSize: '11px', cursor: 'pointer',
                      }}
                    >Restore</button>
                    <button
                      onClick={() => ranking.deleteCard(meal.id)}
                      style={{
                        padding: '8px', borderRadius: '10px', border: 'none',
                        background: 'transparent', color: '#a73b21',
                        cursor: 'pointer',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
