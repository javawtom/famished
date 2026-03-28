import useLocalStorage from './useLocalStorage'
import { useCallback } from 'react'

const DISCARD_THRESHOLD = -3 // Cards at or below this score get discarded

/**
 * Card ranking system:
 * - Swap = -1 point (user rejected this option)
 * - Choose = +1 point (user picked this to eat)
 * - Cards at DISCARD_THRESHOLD or below are filtered out
 * 
 * Stored as { [mealId]: number }
 */
export default function useCardRanking() {
  const [scores, setScores] = useLocalStorage('fn-cardScores', {})
  const [swapCounts, setSwapCounts] = useLocalStorage('fn-swapCounts', {})

  const getScore = useCallback((id) => {
    return scores[id] || 0
  }, [scores])

  const recordSwap = useCallback((id, mealPeriodKey) => {
    // Decrement the card that was swapped away
    setScores(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 }))
    // Increment the swap counter for this meal period today
    const counterKey = `${mealPeriodKey}-${new Date().toISOString().split('T')[0]}`
    setSwapCounts(prev => ({
      ...prev,
      [counterKey]: (prev[counterKey] || 0) + 1,
    }))
  }, [setScores, setSwapCounts])

  const recordChoose = useCallback((id) => {
    setScores(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }, [setScores])

  const isDiscarded = useCallback((id) => {
    return (scores[id] || 0) <= DISCARD_THRESHOLD
  }, [scores])

  const getSwapsUsed = useCallback((mealPeriodKey) => {
    const counterKey = `${mealPeriodKey}-${new Date().toISOString().split('T')[0]}`
    return swapCounts[counterKey] || 0
  }, [swapCounts])

  // Get tier label for a card based on score
  const getTier = useCallback((id) => {
    const score = scores[id] || 0
    if (score >= 5) return { label: '★ Favorite', color: '#4f645b' }
    if (score >= 2) return { label: 'Liked', color: '#43574f' }
    if (score >= 0) return null // No tier badge for neutral
    if (score > DISCARD_THRESHOLD) return { label: 'On Thin Ice', color: '#a73b21' }
    return { label: 'Discarded', color: '#787c77' }
  }, [scores])

  // Restore a discarded card back to neutral (score = 0)
  const restoreCard = useCallback((id) => {
    setScores(prev => ({ ...prev, [id]: 0 }))
  }, [setScores])

  // Permanently delete a card from the ranking system
  const deleteCard = useCallback((id) => {
    setScores(prev => {
      const next = { ...prev }
      delete next[id]
      // Mark as permanently deleted with a special sentinel
      next[`__deleted__${id}`] = true
      return next
    })
  }, [setScores])

  // Check if permanently deleted
  const isPermanentlyDeleted = useCallback((id) => {
    return !!scores[`__deleted__${id}`]
  }, [scores])

  // Filter and sort a pool of meals: remove discarded + permanently deleted, sort by score (favorites first)
  // Then add randomness via day-of-year seeded shuffle within tiers
  const rankPool = useCallback((pool) => {
    const available = pool.filter(m => !isDiscarded(m.id) && !isPermanentlyDeleted(m.id))
    // Sort descending by score, with a day-based offset for variety
    const dayOffset = new Date().getDay()
    return available.sort((a, b) => {
      const sa = (scores[a.id] || 0)
      const sb = (scores[b.id] || 0)
      if (sa !== sb) return sb - sa // Higher score first
      // Same score: rotate based on day for variety
      return ((a.id.charCodeAt(0) + dayOffset) % 3) - ((b.id.charCodeAt(0) + dayOffset) % 3)
    })
  }, [scores, isDiscarded, isPermanentlyDeleted])

  return {
    getScore,
    recordSwap,
    recordChoose,
    isDiscarded,
    isPermanentlyDeleted,
    getSwapsUsed,
    getTier,
    rankPool,
    restoreCard,
    deleteCard,
    scores,
    DISCARD_THRESHOLD,
  }
}
