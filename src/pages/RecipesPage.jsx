import { useApp } from '../context/AppContext'

export default function RecipesPage() {
  const { weeklyRecipes, cookedRecipes, markCooked } = useApp()

  return (
    <div className="space-y-10 animate-fade-up">
      {/* ===== EDITORIAL HEADER ===== */}
      <section className="mb-6">
        <span className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-2">Weekly Selection</span>
        <h2 className="text-4xl font-extrabold text-on-surface leading-tight mb-3">
          Gentle meals for <span className="text-primary italic">focused</span> days.
        </h2>
        <p className="text-secondary text-base leading-relaxed">
          Simple rotations featuring your core pantry essentials. Minimal cleanup, maximum nourishment.
        </p>
      </section>

      {/* ===== RECIPE CARDS ===== */}
      <div className="space-y-8 stagger-children">
        {weeklyRecipes.map((meal, index) => {
          const isCooked = !!cookedRecipes[meal.id]
          const isQuick = meal.category === 'quick'

          return (
            <article
              key={meal.id}
              className={`rounded-[2rem] overflow-hidden transition-all duration-500 ${
                index === 0
                  ? 'bg-surface-container-low'
                  : index === 1
                    ? 'bg-surface-container'
                    : 'bg-surface-container-lowest botanical-shadow'
              }`}
            >
              {/* Card Header with Badges */}
              <div className="p-7 pb-0">
                <div className="flex items-center gap-2 mb-2">
                  {isQuick && (
                    <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-3 py-1 rounded-full">
                      QUICK
                    </span>
                  )}
                  {!isQuick && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full">
                      HEALTHY
                    </span>
                  )}
                  <span className="text-secondary text-[10px] font-bold tracking-widest uppercase">
                    {meal.prepTime}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-7 pt-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary">restaurant</span>
                  <span className="text-secondary font-medium text-xs tracking-widest uppercase">
                    {meal.type === 'dinner' ? 'The Evening Meal' : 'The Midday Meal'}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold mb-5 text-on-surface">{meal.name}</h3>
                <p className="text-secondary text-sm mb-6">{meal.description}</p>

                {/* Steps */}
                <div className="space-y-4 mb-7">
                  {meal.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Ingredients</p>
                  <div className="flex flex-wrap gap-2">
                    {meal.ingredients.map((ing, i) => (
                      <span key={i} className="text-xs font-medium bg-surface-container-high px-3 py-1.5 rounded-full text-on-surface-variant">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mark as Cooked */}
                <button
                  onClick={() => markCooked(meal.id)}
                  className={`w-fit rounded-full px-8 py-3 text-sm font-bold transition-all duration-300 active:scale-95 ${
                    isCooked
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-gradient-to-r from-primary to-primary-dim text-on-primary botanical-shadow'
                  }`}
                >
                  {isCooked ? '✓ Cooked This Week' : 'Mark as Cooked'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* ===== PAGINATION INDICATOR ===== */}
      <div className="flex justify-center items-center gap-2 pb-8">
        <div className="w-8 h-1 rounded-full bg-primary" />
        <div className="w-2 h-1 rounded-full bg-outline-variant/30" />
        <div className="w-2 h-1 rounded-full bg-outline-variant/30" />
      </div>
    </div>
  )
}
