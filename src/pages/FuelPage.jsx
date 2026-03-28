import { useState, useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getCurrentMealPeriod } from '../data/schedule'
import { getHealthyMeals, getQuickMeals } from '../data/meals'
import useCardRanking from '../hooks/useCardRanking'
import Confetti from '../components/Confetti'

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]
const STREAK_BADGES = {
  3: { emoji: '🔥', label: '3-Day Spark' },
  7: { emoji: '⚡', label: '7-Day Streak' },
  14: { emoji: '💪', label: '2-Week Warrior' },
  30: { emoji: '🏆', label: '30-Day Champion' },
  60: { emoji: '👑', label: '60-Day Legend' },
  100: { emoji: '💎', label: '100-Day Diamond' },
}

const MAX_SWAPS = 3

export default function FuelPage() {
  const { markEaten, unmarkEaten, isMealEaten, streakDays } = useApp()
  const mealPeriod = getCurrentMealPeriod()
  const ranking = useCardRanking()
  const [showConfetti, setShowConfetti] = useState(false)
  const [streakBadge, setStreakBadge] = useState(null)

  // Check for streak milestone when streak changes
  const currentBadge = STREAK_MILESTONES.filter(m => streakDays >= m).pop()
  const badgeInfo = currentBadge ? STREAK_BADGES[currentBadge] : null

  // Get all healthy and quick meals for current meal type
  const mealType = mealPeriod.mealType === 'snack' || mealPeriod.mealType === 'latenight'
    ? 'dinner' : mealPeriod.mealType
  const mealPeriodKey = `${mealType}-${mealPeriod.mealType}`

  // Rank and filter pools (removes discarded cards, sorts by score)
  const healthyPool = useMemo(() => ranking.rankPool(getHealthyMeals(mealType)), [mealType, ranking.scores])
  const quickPool = useMemo(() => ranking.rankPool(getQuickMeals(mealType)), [mealType, ranking.scores])

  // Flashcard index for cycling
  const [healthyIndex, setHealthyIndex] = useState(0)
  const [quickIndex, setQuickIndex] = useState(0)

  const healthyOption = healthyPool.length > 0 ? healthyPool[healthyIndex % healthyPool.length] : null
  const quickOption = quickPool.length > 0 ? quickPool[quickIndex % quickPool.length] : null

  const eaten = isMealEaten(mealPeriod.mealType)
  const [justAte, setJustAte] = useState(false)
  const [expandedMeal, setExpandedMeal] = useState(null)
  const [chosenMeal, setChosenMeal] = useState(null)

  // Swap tracking
  const swapsUsed = ranking.getSwapsUsed(mealPeriodKey)
  const swapsLeft = MAX_SWAPS - swapsUsed
  const canSwap = swapsLeft > 0

  const handleChoose = (side) => {
    if (eaten) {
      unmarkEaten(mealPeriod.mealType)
      setChosenMeal(null)
    } else {
      const chosenId = side === 'healthy' ? healthyOption?.id : quickOption?.id
      if (chosenId) ranking.recordChoose(chosenId)
      markEaten(mealPeriod.mealType)
      setChosenMeal(side)
      setJustAte(true)
      setTimeout(() => setJustAte(false), 2000)

      // Check if this eat triggers a streak milestone
      const nextStreak = streakDays + 1 // Approximate (actual recalculates)
      if (STREAK_MILESTONES.includes(nextStreak)) {
        setShowConfetti(true)
        setStreakBadge(STREAK_BADGES[nextStreak])
        setTimeout(() => { setShowConfetti(false); setStreakBadge(null) }, 4000)
      }
    }
  }

  const cycleHealthy = (e) => {
    e.stopPropagation()
    if (!canSwap || healthyPool.length <= 1) return
    // Record swap penalty on the card being dismissed
    if (healthyOption) ranking.recordSwap(healthyOption.id, mealPeriodKey)
    setHealthyIndex(i => (i + 1) % healthyPool.length)
    setExpandedMeal(null)
  }

  const cycleQuick = (e) => {
    e.stopPropagation()
    if (!canSwap || quickPool.length <= 1) return
    // Record swap penalty on the card being dismissed
    if (quickOption) ranking.recordSwap(quickOption.id, mealPeriodKey)
    setQuickIndex(i => (i + 1) % quickPool.length)
    setExpandedMeal(null)
  }

  // Friendly meal period label
  const mealLabel = mealPeriod.mealType === 'latenight' ? 'a late-night snack'
    : mealPeriod.mealType === 'snack' ? 'a snack'
    : mealPeriod.label.toLowerCase()

  // Check if meal has been liked (tier score >= 2)
  const isLiked = (mealId) => {
    const tier = ranking.getTier(mealId)
    return tier && tier.label !== 'New'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ===== CONFETTI OVERLAY ===== */}
      <Confetti trigger={showConfetti} />

      {/* ===== STREAK MILESTONE POPUP ===== */}
      {streakBadge && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9998, pointerEvents: 'none',
        }}>
          <div style={{
            background: 'rgba(47,51,47,0.9)', backdropFilter: 'blur(12px)',
            padding: '28px 40px', borderRadius: '24px', textAlign: 'center',
            animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>{streakBadge.emoji}</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'block' }}>{streakBadge.label}</span>
            <span style={{ fontSize: '12px', color: '#afb3ad', display: 'block', marginTop: '4px' }}>
              {streakDays + 1}-day streak!
            </span>
          </div>
        </div>
      )}

      {/* ===== COACH DIRECTIVE ===== */}
      <section style={{ textAlign: 'center' }}>
        <h2 style={{
          fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em',
          color: '#2f332f', margin: '0 0 8px',
        }}>{getCoachHeadline(mealPeriod.mealType, streakDays)}</h2>
        <p style={{ color: '#5f5f5c', fontSize: '17px', lineHeight: 1.6 }}>
          {getCoachSubtext(mealPeriod.mealType, streakDays)}
        </p>
        {/* Streak badge */}
        {badgeInfo && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '12px', padding: '6px 16px', borderRadius: '9999px',
            background: '#d1e8dd', color: '#42564e',
            fontSize: '13px', fontWeight: 700,
          }}>
            <span>{badgeInfo.emoji}</span>
            <span>{badgeInfo.label}</span>
            <span style={{ color: '#787c77', fontWeight: 500 }}>· Day {streakDays}</span>
          </div>
        )}
      </section>

      {/* ===== SWAP COUNTER ===== */}
      <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '6px' }}>
        {[...Array(MAX_SWAPS)].map((_, i) => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: i < swapsLeft ? '#4f645b' : '#e0e4dd',
            transition: 'background 0.3s ease',
          }} />
        ))}
        <span style={{
          fontSize: '11px', fontWeight: 600, color: canSwap ? '#787c77' : '#a73b21',
          marginLeft: '8px',
        }}>
          {canSwap ? `${swapsLeft} swap${swapsLeft === 1 ? '' : 's'} left` : "You're stuck with these!"}
        </span>
      </div>

      {/* ===== FLASHCARD GRID ===== */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Option 1: Healthy */}
        {healthyOption && (
          <div
            onClick={() => setExpandedMeal(expandedMeal === 'healthy' ? null : 'healthy')}
            style={{
              display: 'flex', flexDirection: 'column', textAlign: 'left',
              background: '#ffffff', borderRadius: '2rem', padding: '16px',
              boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
              cursor: 'pointer', transition: 'all 0.3s ease',
              transform: expandedMeal === 'healthy' ? 'scale(1.02)' : 'scale(1)',
              outline: chosenMeal === 'healthy' ? '3px solid #4f645b' : 'none',
            }}
          >
            <div style={{
              width: '100%', aspectRatio: '1/1', borderRadius: '1rem',
              overflow: 'hidden', marginBottom: '14px', background: '#f3f4ef',
              position: 'relative',
            }}>
              <img
                src={healthyOption.image}
                alt={healthyOption.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
              {isLiked(healthyOption.id) && (
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', top: '10px', right: '10px',
                  fontSize: '22px', color: '#e74c3c',
                  fontVariationSettings: "'FILL' 1",
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                }}>favorite</span>
              )}
            </div>
            <div style={{ padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '9999px',
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'rgba(79, 100, 91, 0.1)', color: '#4f645b',
                }}>Healthy</span>

              </div>
              <h3 style={{
                fontSize: '17px', fontWeight: 700, color: '#2f332f',
                lineHeight: 1.2, margin: '0 0 4px',
              }}>{healthyOption.name}</h3>
              <p style={{
                color: '#5f5f5c', fontSize: '12px', lineHeight: 1.5,
                margin: '0 0 10px',
              }}>{healthyOption.description}</p>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#787c77' }}>
                {healthyOption.prepTime}
              </span>
            </div>

            {/* Expanded Steps */}
            {expandedMeal === 'healthy' && (
              <div style={{
                marginTop: '12px', paddingTop: '12px',
                borderTop: '1px solid rgba(175,179,173,0.15)',
              }}>
                {healthyOption.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      background: '#d1e8dd', color: '#42564e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, marginTop: '1px',
                    }}>{i + 1}</div>
                    <p style={{ color: '#5c605b', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>{step}</p>
                  </div>
                ))}
                <button
                  onClick={(e) => { e.stopPropagation(); handleChoose('healthy') }}
                  style={{
                    width: '100%', marginTop: '8px', padding: '12px', borderRadius: '9999px',
                    border: 'none', fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                    fontSize: '13px', cursor: 'pointer',
                    background: eaten && chosenMeal === 'healthy' ? '#d1e8dd' : '#4f645b',
                    color: eaten && chosenMeal === 'healthy' ? '#42564e' : '#e7fef3',
                  }}
                >
                  {eaten && chosenMeal === 'healthy' ? '✕ Unmark' : "I'll eat this"}
                </button>
              </div>
            )}

            {/* Cycle Arrow */}
            {healthyPool.length > 1 && (
              <button
                onClick={cycleHealthy}
                disabled={!canSwap}
                style={{
                  alignSelf: 'center', marginTop: '8px', background: 'none', border: 'none',
                  cursor: canSwap ? 'pointer' : 'not-allowed', padding: '4px',
                  opacity: canSwap ? 1 : 0.3,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: '18px', color: canSwap ? '#afb3ad' : '#e0e4dd',
                }}>swap_horiz</span>
              </button>
            )}
          </div>
        )}

        {/* Option 2: Quick */}
        {quickOption && (
          <div
            onClick={() => setExpandedMeal(expandedMeal === 'quick' ? null : 'quick')}
            style={{
              display: 'flex', flexDirection: 'column', textAlign: 'left',
              background: '#ffffff', borderRadius: '2rem', padding: '16px',
              boxShadow: '0 12px 32px rgba(47, 51, 47, 0.08)',
              cursor: 'pointer', transition: 'all 0.3s ease',
              transform: expandedMeal === 'quick' ? 'scale(1.02)' : 'scale(1)',
              outline: chosenMeal === 'quick' ? '3px solid #695d52' : 'none',
            }}
          >
            <div style={{
              width: '100%', aspectRatio: '1/1', borderRadius: '1rem',
              overflow: 'hidden', marginBottom: '14px', background: '#f3f4ef',
              position: 'relative',
            }}>
              <img
                src={quickOption.image}
                alt={quickOption.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
              {isLiked(quickOption.id) && (
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', top: '10px', right: '10px',
                  fontSize: '22px', color: '#e74c3c',
                  fontVariationSettings: "'FILL' 1",
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                }}>favorite</span>
              )}
            </div>
            <div style={{ padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '9999px',
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'rgba(105, 93, 82, 0.1)', color: '#695d52',
                }}>Quick</span>

              </div>
              <h3 style={{
                fontSize: '17px', fontWeight: 700, color: '#2f332f',
                lineHeight: 1.2, margin: '0 0 4px',
              }}>{quickOption.name}</h3>
              <p style={{
                color: '#5f5f5c', fontSize: '12px', lineHeight: 1.5,
                margin: '0 0 10px',
              }}>{quickOption.description}</p>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#787c77' }}>
                {quickOption.prepTime}
              </span>
            </div>

            {/* Expanded Steps */}
            {expandedMeal === 'quick' && (
              <div style={{
                marginTop: '12px', paddingTop: '12px',
                borderTop: '1px solid rgba(175,179,173,0.15)',
              }}>
                {quickOption.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      background: '#fdebdc', color: '#62564b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, marginTop: '1px',
                    }}>{i + 1}</div>
                    <p style={{ color: '#5c605b', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>{step}</p>
                  </div>
                ))}
                <button
                  onClick={(e) => { e.stopPropagation(); handleChoose('quick') }}
                  style={{
                    width: '100%', marginTop: '8px', padding: '12px', borderRadius: '9999px',
                    border: 'none', fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                    fontSize: '13px', cursor: 'pointer',
                    background: eaten && chosenMeal === 'quick' ? '#fdebdc' : '#695d52',
                    color: eaten && chosenMeal === 'quick' ? '#62564b' : '#fff7f3',
                  }}
                >
                  {eaten && chosenMeal === 'quick' ? '✕ Unmark' : "I'll eat this"}
                </button>
              </div>
            )}

            {/* Cycle Arrow */}
            {quickPool.length > 1 && (
              <button
                onClick={cycleQuick}
                disabled={!canSwap}
                style={{
                  alignSelf: 'center', marginTop: '8px', background: 'none', border: 'none',
                  cursor: canSwap ? 'pointer' : 'not-allowed', padding: '4px',
                  opacity: canSwap ? 1 : 0.3,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: '18px', color: canSwap ? '#afb3ad' : '#e0e4dd',
                }}>swap_horiz</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* ===== ALREADY EATEN ===== */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => {
            if (eaten) { unmarkEaten(mealPeriod.mealType); setChosenMeal(null) }
            else { markEaten(mealPeriod.mealType); setJustAte(true); setTimeout(() => setJustAte(false), 2000) }
          }}
          style={{
            background: 'none', border: 'none', color: '#535351',
            fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px',
          }}
        >
          {eaten ? '✕ Unmark meal' : justAte ? '✓ Logged!' : "I've already eaten"}
        </button>
      </div>
    </div>
  )
}

// ============================================
// HARDASS COACH MESSAGING
// ============================================

function getCoachHeadline(mealType, streak) {
  const headlinesByMeal = {
    breakfast: [
      "It's breakfast. Pick one.",
      "Your body's been fasting. Eat.",
      "Morning fuel. No excuses.",
      "Rise and eat. Now.",
    ],
    lunch: [
      "Lunch. Two options. Pick.",
      "Midday fuel. Choose now.",
      "You're eating lunch. Period.",
      "Refuel time. No skipping.",
    ],
    snack: [
      "Snack time. Eat something.",
      "Your body needs this. Pick.",
      "Quick fuel. Don't skip.",
      "Eat the snack, Jody.",
    ],
    dinner: [
      "Dinner's now. Pick one.",
      "Time to eat. No debate.",
      "Evening fuel. Choose.",
      "Sit down and eat, Jody.",
    ],
    latenight: [
      "One more meal. Pick it.",
      "Late fuel. Light but required.",
      "Don't go to bed empty.",
      "Last call. Choose now.",
    ],
  }

  // Streak-specific overrides (get more intense)
  if (streak >= 30) return "Day " + streak + ". Don't stop now."
  if (streak >= 14) return "Keep the chain going."
  if (streak >= 7) return "7+ and counting. Eat."

  const options = headlinesByMeal[mealType] || headlinesByMeal.dinner
  // Rotate daily
  const dayIndex = new Date().getDate() % options.length
  return options[dayIndex]
}

function getCoachSubtext(mealType, streak) {
  const subtextByMeal = {
    breakfast: [
      "Two options below. You're picking one before you do anything else today.",
      "Your metabolism doesn't negotiate. Neither do I. Pick one.",
      "Not a question. Not a suggestion. Two meals, one choice. Go.",
      "You didn't wake up to skip breakfast. Choose and move on.",
    ],
    lunch: [
      "Halfway through the day. You're not running on empty. Pick one.",
      "This isn't optional. Two solid options, zero excuses.",
      "Lunch fuels your afternoon. Pick one and keep moving.",
      "Your body's working hard. Feed it. Now.",
    ],
    snack: [
      "Small meal, big impact. Pick one and don't overthink it.",
      "This keeps your energy flat. Just choose.",
      "Quick bite. Keep the machine running.",
      "No skipping. Eat something and get back to it.",
    ],
    dinner: [
      "Day's winding down. Your body needs fuel to recover. Pick one.",
      "Two options. Pick the one that sounds less annoying. Just pick.",
      "Recovery starts with dinner. Choose and cook.",
      "The gym didn't build you. The kitchen does. Pick one.",
    ],
    latenight: [
      "One last push for the day. Light fuel, big difference tomorrow.",
      "Don't go to bed on empty. Something small, right now.",
      "Your overnight recovery depends on this. Choose.",
      "Final meal of the day. Make it count.",
    ],
  }

  if (streak >= 30) return `${streak} days of showing up. You know the drill — just pick.`
  if (streak >= 7) return "You've built momentum. Don't let one skip unravel it. Pick one."
  if (streak >= 3) return "Streak's building. Keep it alive. Pick one."

  const options = subtextByMeal[mealType] || subtextByMeal.dinner
  const dayIndex = new Date().getDate() % options.length
  return options[dayIndex]
}
