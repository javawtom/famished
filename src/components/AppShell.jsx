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
    <div className="min-h-screen bg-surface text-on-surface">
      {/* ===== TOP APP BAR ===== */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-surface">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight text-primary">Fuel Now</h1>
        </div>
        <div className="h-9 w-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm">
          J
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="pt-20 pb-28 px-5 max-w-2xl mx-auto">
        <Outlet />
      </main>

      {/* ===== BOTTOM NAV BAR ===== */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 glass rounded-t-3xl"
           style={{ boxShadow: 'var(--shadow-botanical-up)', borderTop: '1px solid rgba(175, 179, 173, 0.15)' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-surface-container-highest text-primary -translate-y-0.5'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? 'filled' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[11px] font-medium tracking-wide mt-0.5">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
