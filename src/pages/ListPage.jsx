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

  const totalBudget = getTotalBudget()
  const storeBudget = useMemo(
    () => storeItems.reduce((sum, g) => sum + g.cost, 0),
    [storeItems]
  )
  const checkedCount = storeItems.filter(g => checkedGroceries[g.id]).length
  const totalCount = storeItems.length

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ===== HEADER ===== */}
      <section>
        <h2 className="text-4xl font-bold tracking-tight text-on-surface mb-2">Master Pantry</h2>
        <p className="text-secondary text-base leading-relaxed">
          Your essential, high-quality fuel list. Curated for nutrient density and minimal decision fatigue.
        </p>
        <div className="flex items-center gap-3 mt-4 bg-surface-container-low p-2 rounded-full pr-6 w-fit">
          <div className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-secondary">Est. Budget</p>
            <p className="font-bold text-primary">${totalBudget.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* ===== STORE TOGGLE ===== */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar">
        {['A', 'B'].map(store => (
          <button
            key={store}
            onClick={() => setActiveStore(store)}
            className={`px-7 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 ${
              activeStore === store
                ? 'bg-primary text-on-primary botanical-shadow'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            Store {store}: {storeNames[store]}
          </button>
        ))}
      </div>

      {/* ===== PROGRESS PILL ===== */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-fixed-dim rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
        <span className="text-secondary font-medium text-xs">{checkedCount}/{totalCount}</span>
      </div>

      {/* ===== CATEGORIZED LISTS ===== */}
      <div className="space-y-8 stagger-children">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-primary text-2xl">
                {categoryIcons[category] || 'category'}
              </span>
              <h3 className="text-xl font-bold">{category}</h3>
              <span className="text-sm font-medium text-secondary ml-auto">{items.length} Items</span>
            </div>

            <div className="space-y-2">
              {items.map(item => {
                const checked = !!checkedGroceries[item.id]
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleGrocery(item.id)}
                    className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                      checked
                        ? 'bg-primary-container/40'
                        : 'bg-surface-container-lowest hover:bg-surface-container-highest'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        checked
                          ? 'bg-primary'
                          : 'border-2 border-outline-variant group-hover:border-primary'
                      }`}>
                        {checked && (
                          <span className="material-symbols-outlined text-on-primary text-sm">check</span>
                        )}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${checked ? 'line-through text-secondary' : 'text-on-surface'}`}>
                          {item.name}
                        </h4>
                        <p className="text-xs text-secondary">
                          {item.brand} • ${item.cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {/* ===== RESET BUTTON ===== */}
      {checkedCount > 0 && (
        <div className="pt-4 pb-4">
          <button
            onClick={resetGroceryList}
            className="w-full py-4 rounded-full bg-surface-container-high text-on-surface font-bold transition-all active:scale-95"
          >
            Reset Shopping List
          </button>
        </div>
      )}
    </div>
  )
}
