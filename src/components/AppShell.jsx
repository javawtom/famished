import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/',         icon: 'bolt',            label: 'Fuel'     },
  { path: '/list',     icon: 'shopping_cart',    label: 'List'     },
  { path: '/recipes',  icon: 'restaurant_menu',  label: 'Recipes'  },
  { path: '/progress', icon: 'trending_up',      label: 'Progress' },
  { path: '/library',  icon: 'local_library',    label: 'Library'  },
]

export default function AppShell() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100dvh', background: '#faf9f5', color: '#2f332f', fontFamily: "'Manrope', sans-serif" }}>
      {/* ===== TOP APP BAR ===== */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '64px',
        background: '#faf9f5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            className="material-symbols-outlined"
            onClick={() => setMenuOpen(true)}
            style={{ color: '#4f645b', padding: '8px', cursor: 'pointer' }}
          >menu</span>
          <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#4f645b', margin: 0 }}>Fuel Now</h1>
        </div>
        <div style={{
          height: '40px', width: '40px', borderRadius: '50%',
          background: '#d1e8dd', border: '2px solid #d1e8dd',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#4f645b', fontWeight: 700, fontSize: '14px',
        }}>
          J
        </div>
      </header>

      {/* ===== SLIDE-OUT MENU ===== */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)', zIndex: 100,
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            }}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: '280px', background: '#faf9f5', zIndex: 101,
            padding: '32px 24px', display: 'flex', flexDirection: 'column',
            boxShadow: '8px 0 32px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.25s ease-out',
          }}>
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#4f645b', margin: 0 }}>Famished</h2>
              <span
                className="material-symbols-outlined"
                onClick={() => setMenuOpen(false)}
                style={{ color: '#5f5f5c', cursor: 'pointer', padding: '4px' }}
              >close</span>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map(item => {
                const isActive = location.pathname === item.path
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '14px 16px', borderRadius: '12px',
                      textDecoration: 'none',
                      background: isActive ? '#e0e4dd' : 'transparent',
                      color: isActive ? '#4f645b' : '#5f5f5c',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{
                      fontSize: '22px',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}>{item.icon}</span>
                    {item.label}
                  </NavLink>
                )
              })}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Footer info */}
            <div style={{ padding: '20px 0', borderTop: '1px solid rgba(175,179,173,0.2)' }}>
              <p style={{ fontSize: '11px', color: '#787c77', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Integrations</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#4f645b', fontSize: '18px' }}>monitor_weight</span>
                <span style={{ fontSize: '13px', color: '#5f5f5c' }}>Withings Scale</span>
              </div>
              <p style={{ fontSize: '11px', color: '#a0a49e', margin: '16px 0 0' }}>Famished v1.0 • Built with care</p>
            </div>
          </div>
        </>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main style={{ paddingTop: '88px', paddingBottom: '120px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '672px', margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* ===== BOTTOM NAV BAR ===== */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '12px 16px 24px',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(175,179,173,0.15)',
        boxShadow: '0 -12px 32px rgba(47,51,47,0.05)',
        borderRadius: '24px 24px 0 0',
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '8px 20px', borderRadius: '16px',
                textDecoration: 'none',
                background: isActive ? '#e0e4dd' : 'transparent',
                color: isActive ? '#4f645b' : '#5f5f5c',
                transform: isActive ? 'translateY(-2px)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '24px',
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400",
                }}
              >
                {item.icon}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', marginTop: '2px' }}>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
