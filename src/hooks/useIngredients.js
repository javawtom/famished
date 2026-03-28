import { useState, useCallback } from 'react'

export default function useIngredients() {
  const storageKey = 'fn-ingredients'

  // Load from localStorage
  const loadIngredients = () => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  const [ingredients, setIngredients] = useState(loadIngredients)

  const save = (updated) => {
    setIngredients(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  // Shelf life estimates (days)
  const shelfLife = {
    produce: 5,
    dairy: 10,
    meat: 3,
    frozen: 90,
    pantry: 180,
    grain: 30,
    other: 14,
  }

  const addIngredient = useCallback((name, category = 'other') => {
    const now = new Date().toISOString()
    const daysUntilExpiry = shelfLife[category] || 14
    const expiryDate = new Date(Date.now() + daysUntilExpiry * 86400000).toISOString().split('T')[0]

    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      category,
      addedDate: now,
      expiryDate,
      daysUntilExpiry,
    }

    save([...ingredients, newItem])
    return newItem
  }, [ingredients])

  const removeIngredient = useCallback((id) => {
    save(ingredients.filter(i => i.id !== id))
  }, [ingredients])

  const clearAll = useCallback(() => {
    save([])
  }, [])

  // Calculate freshness status
  const getStatus = (item) => {
    const now = new Date()
    const expiry = new Date(item.expiryDate)
    const daysLeft = Math.ceil((expiry - now) / 86400000)

    if (daysLeft <= 0) return { label: 'Expired', color: '#d44', daysLeft: 0 }
    if (daysLeft <= 2) return { label: 'Use today!', color: '#d97706', daysLeft }
    if (daysLeft <= 5) return { label: `${daysLeft}d left`, color: '#b8860b', daysLeft }
    return { label: 'Fresh', color: '#4f645b', daysLeft }
  }

  // Sort: expiring soonest first
  const sorted = [...ingredients].sort((a, b) => {
    return new Date(a.expiryDate) - new Date(b.expiryDate)
  })

  return {
    ingredients: sorted,
    addIngredient,
    removeIngredient,
    clearAll,
    getStatus,
    isEmpty: ingredients.length === 0,
  }
}
