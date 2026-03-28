import { useState } from 'react'
import { useApp } from '../context/AppContext'
import schedule, { formatTime } from '../data/schedule'

export default function ProgressPage() {
  const { currentWeight, weightLog, logWeight, streakDays } = useApp()
  const [showWeightInput, setShowWeightInput] = useState(false)
  const [weightInput, setWeightInput] = useState('')

  const totalGained = currentWeight - 145
  const progressPercent = Math.min(100, Math.round(((currentWeight - 145) / (175 - 145)) * 100))

  // Build chart data from weight log (last 8 entries or pad with empty)
  const chartData = []
  const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const recentLog = weightLog.slice(-8)

  for (let i = 0; i < 8; i++) {
    if (i < recentLog.length) {
      const entry = recentLog[i]
      const date = new Date(entry.date)
      chartData.push({
        label: monthLabels[date.getMonth()],
        weight: entry.weight,
        height: ((entry.weight - 140) / (180 - 140)) * 100,
        isLatest: i === recentLog.length - 1,
      })
    } else {
      chartData.push({ label: '', weight: 0, height: 5, isLatest: false, empty: true })
    }
  }

  const handleLogWeight = () => {
    const w = parseFloat(weightInput)
    if (w && w > 0 && w < 500) {
      logWeight(w)
      setWeightInput('')
      setShowWeightInput(false)
    }
  }

  return (
    <div className="space-y-12 animate-fade-up">
      {/* ===== EDITORIAL HEADER ===== */}
      <section>
        <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">Progress Overview</p>
        <h2 className="text-4xl font-extrabold text-on-surface leading-tight tracking-tight">
          Nurturing your <span className="text-primary italic">steady growth</span>.
        </h2>
      </section>

      {/* ===== WEIGHT CHART ===== */}
      <section className="bg-surface-container-lowest p-7 rounded-[2rem] botanical-shadow">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-secondary text-sm font-medium mb-1">Current Weight</p>
            <h3 className="text-3xl font-bold text-on-surface">
              {currentWeight} <span className="text-lg font-normal text-secondary-dim">lbs</span>
            </h3>
          </div>
          <div className="text-right">
            <p className="text-secondary text-sm font-medium mb-1">Target</p>
            <h3 className="text-xl font-bold text-primary">175.0 lbs</h3>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-40 flex items-end gap-2 relative mb-4">
          <div className="absolute top-0 w-full border-t border-dashed border-outline-variant/30 text-[10px] text-outline tracking-widest pt-1">
            GOAL: 175 LBS
          </div>
          {chartData.map((bar, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-xl transition-all duration-700 ${
                bar.empty
                  ? 'bg-surface-container opacity-20'
                  : bar.isLatest
                    ? 'bg-primary botanical-shadow'
                    : 'bg-primary/20'
              }`}
              style={{
                height: `${bar.height}%`,
                opacity: bar.empty ? 0.2 : (0.3 + (i / chartData.length) * 0.7),
              }}
            />
          ))}
        </div>

        <div className="flex justify-between text-[11px] text-outline font-bold tracking-widest px-1">
          {chartData.map((bar, i) => (
            <span key={i} className={bar.isLatest ? 'text-primary' : ''}>
              {bar.isLatest ? 'TODAY' : bar.label}
            </span>
          ))}
        </div>

        {/* Log Weight Button */}
        <div className="mt-6">
          {showWeightInput ? (
            <div className="flex gap-3">
              <input
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="Enter weight..."
                className="flex-1 bg-surface-container rounded-xl px-4 py-3 text-on-surface font-medium text-sm outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleLogWeight()}
              />
              <button
                onClick={handleLogWeight}
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Log
              </button>
              <button
                onClick={() => setShowWeightInput(false)}
                className="bg-surface-container-high text-on-surface px-4 py-3 rounded-xl font-bold text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWeightInput(true)}
              className="w-full py-3 rounded-full bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-colors active:scale-95"
            >
              Log Today's Weight
            </button>
          )}
        </div>
      </section>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low p-6 rounded-[2rem] flex flex-col gap-4">
          <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
          <div>
            <p className="text-2xl font-bold text-on-surface">
              +{totalGained.toFixed(1)} <span className="text-xs font-medium">lbs</span>
            </p>
            <p className="text-secondary text-[10px] uppercase tracking-widest font-bold mt-1">Total Gained</p>
          </div>
        </div>
        <div className="bg-primary-container p-6 rounded-[2rem] flex flex-col gap-4">
          <span className="material-symbols-outlined text-on-primary-container text-2xl">calendar_today</span>
          <div>
            <p className="text-2xl font-bold text-on-primary-container">
              {streakDays} <span className="text-xs font-medium">days</span>
            </p>
            <p className="text-on-primary-container/70 text-[10px] uppercase tracking-widest font-bold mt-1">Consistent Routine</p>
          </div>
        </div>
      </div>

      {/* ===== DAILY FUELING SCHEDULE ===== */}
      <section className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-on-surface tracking-tight">Daily Fueling Schedule</h3>
          <p className="text-secondary text-sm mt-1">Small, frequent nourishment to sustain your energy.</p>
        </div>

        <div className="space-y-0">
          {schedule.map((slot, index) => (
            <div key={slot.id} className="flex gap-5">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  index === 0 ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-primary'
                }`}>
                  <span className="material-symbols-outlined">{slot.icon}</span>
                </div>
                {index < schedule.length - 1 && (
                  <div className="w-0.5 flex-1 bg-surface-container rounded-full min-h-[3rem]" />
                )}
              </div>
              <div className="pt-1 pb-8">
                <p className={`font-bold text-sm tracking-widest uppercase ${
                  index === 0 ? 'text-primary' : 'text-secondary'
                }`}>
                  {formatTime(slot.time)}
                </p>
                <h4 className="text-xl font-bold mt-1 text-on-surface">{slot.label}</h4>
                <p className="text-secondary text-sm mt-2 leading-relaxed">{slot.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MOTIVATIONAL QUOTE ===== */}
      <section className="bg-surface-container-low p-10 rounded-[2.5rem] text-center">
        <span className="material-symbols-outlined text-primary/40 text-3xl mb-4 block">format_quote</span>
        <p className="text-lg font-medium text-on-surface leading-relaxed italic">
          "Progress is not about perfection, but about showing up for yourself, one small bite at a time."
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="w-8 h-0.5 bg-outline-variant/30" />
          <p className="text-primary font-bold text-xs uppercase tracking-widest">Your Gentle Guide</p>
          <div className="w-8 h-0.5 bg-outline-variant/30" />
        </div>
      </section>
    </div>
  )
}
