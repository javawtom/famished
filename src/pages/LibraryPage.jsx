import { useState } from 'react'
import { getMealsByType, getHealthyMeals, getQuickMeals } from '../data/meals'

const mealTypes = ['breakfast', 'lunch', 'dinner']
const mealTypeLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

export default function LibraryPage() {
  const [expandedMeal, setExpandedMeal] = useState(null)

  return (
    <div className="space-y-12 animate-fade-up">
      {/* ===== EDITORIAL HEADER ===== */}
      <section>
        <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">The Matrix</span>
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-4">The Meal Library</h2>
        <p className="text-secondary text-base leading-relaxed">
          Your personal architectural foundation for nutrition. 24 curated options designed to eliminate decision fatigue and support your journey.
        </p>
      </section>

      {/* ===== MEAL SECTIONS ===== */}
      {mealTypes.map(type => {
        const healthy = getHealthyMeals(type)
        const quick = getQuickMeals(type)

        return (
          <section key={type}>
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-2xl font-bold tracking-tight">{mealTypeLabels[type]}</h3>
              <div className="h-[1px] flex-grow bg-outline-variant/15" />
            </div>

            {/* Healthy Sub-section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-lg">energy_savings_leaf</span>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Healthy Options</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {healthy.map(meal => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    isExpanded={expandedMeal === meal.id}
                    onToggle={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                    badge="HEALTHY"
                    badgeClass="bg-primary/10 text-primary"
                  />
                ))}
              </div>
            </div>

            {/* Quick Sub-section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-tertiary-dim text-lg">bolt</span>
                <h4 className="text-sm font-bold text-tertiary-dim uppercase tracking-widest">Quick & Low-Energy</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {quick.map(meal => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    isExpanded={expandedMeal === meal.id}
                    onToggle={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                    badge="QUICK"
                    badgeClass="bg-tertiary-fixed text-on-tertiary-fixed"
                  />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function MealCard({ meal, isExpanded, onToggle, badge, badgeClass }) {
  return (
    <div
      className="bg-surface-container-lowest rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={onToggle}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-bold text-on-surface truncate">{meal.name}</h5>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${badgeClass}`}>
                {badge}
              </span>
            </div>
            <p className="text-xs text-secondary">{meal.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-outline">{meal.prepTime}</span>
            <span className="material-symbols-outlined text-primary-dim text-lg">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 animate-fade-up" style={{ borderTop: '1px solid rgba(175,179,173,0.15)' }}>
            <div className="space-y-3 mb-4">
              {meal.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary-dim text-sm mt-0.5">check_circle</span>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {meal.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface-variant"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
