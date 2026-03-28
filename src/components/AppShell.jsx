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
          <span className="material-symbols-outlined" style={{ color: '#4f645b', padding: '8px', cursor: 'pointer' }}>menu</span>
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
