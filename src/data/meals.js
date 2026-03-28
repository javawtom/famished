// 24 Curated Meals: 2+2 Breakfast, 5+5 Lunch, 5+5 Dinner
const meals = [
  // ========== BREAKFAST: HEALTHY (2) ==========
  {
    id: 'b-h-1',
    name: 'Oatmeal & Fruit',
    type: 'breakfast',
    category: 'healthy',
    description: 'Fiber rich, sustained energy.',
    prepTime: '10 min',
    steps: [
      'Bring 1 cup water to a boil, add ½ cup steel cut oats.',
      'Simmer 5 min, stir in almond butter.',
      'Top with blueberries and a drizzle of honey.',
    ],
    ingredients: ['Steel Cut Oats', 'Almond Butter', 'Blueberries', 'Honey'],
  },
  {
    id: 'b-h-2',
    name: 'Greek Berry Bowl',
    type: 'breakfast',
    category: 'healthy',
    description: 'High protein start for clear mornings.',
    prepTime: '5 min',
    steps: [
      'Scoop Greek yogurt into a bowl.',
      'Top with blueberries, chia seeds, and a drizzle of honey.',
      'Sprinkle with raw almonds for crunch.',
    ],
    ingredients: ['Greek Yogurt', 'Blueberries', 'Chia Seeds', 'Honey', 'Raw Almonds'],
  },

  // ========== BREAKFAST: QUICK (2) ==========
  {
    id: 'b-q-1',
    name: 'Protein Shake',
    type: 'breakfast',
    category: 'quick',
    description: 'Zero prep, high protein.',
    prepTime: '2 min',
    steps: [
      'Add protein powder, banana, and almond milk to blender.',
      'Blend for 30 seconds.',
      'Pour and drink.',
    ],
    ingredients: ['Protein Powder', 'Bananas', 'Almond Milk'],
  },
  {
    id: 'b-q-2',
    name: 'Overnight Oats',
    type: 'breakfast',
    category: 'quick',
    description: 'Prep night before, zero morning effort.',
    prepTime: '0 min (prepped)',
    steps: [
      'Night before: mix oats, almond milk, chia seeds in jar.',
      'Refrigerate overnight.',
      'Morning: top with almond butter and banana slices.',
    ],
    ingredients: ['Steel Cut Oats', 'Almond Milk', 'Chia Seeds', 'Almond Butter', 'Bananas'],
  },

  // ========== LUNCH: HEALTHY (5) ==========
  {
    id: 'l-h-1',
    name: 'The Zen Bowl',
    type: 'lunch',
    category: 'healthy',
    description: 'A complete micro-nutrient profile in a single bowl.',
    prepTime: '15 min',
    steps: [
      'Cook quinoa per package directions.',
      'Roast sweet potato cubes at 400°F for 15 min.',
      'Assemble bowl with spinach, quinoa, sweet potato, and tahini dressing.',
    ],
    ingredients: ['Quinoa', 'Sweet Potatoes', 'Baby Spinach', 'Tahini'],
  },
  {
    id: 'l-h-2',
    name: 'Avocado Power Plate',
    type: 'lunch',
    category: 'healthy',
    description: 'Healthy fats and fiber for sustained energy.',
    prepTime: '10 min',
    steps: [
      'Toast sourdough bread.',
      'Smash avocado on top with lemon juice, salt, pepper.',
      'Add a poached or fried egg on top.',
    ],
    ingredients: ['Avocados', 'Sourdough Bread', 'Pasture Eggs', 'Lemons'],
  },
  {
    id: 'l-h-3',
    name: 'Salmon & Greens',
    type: 'lunch',
    category: 'healthy',
    description: 'Omega-3 rich with leafy greens.',
    prepTime: '15 min',
    steps: [
      'Pan-sear salmon fillet 4 min each side.',
      'Toss spinach with olive oil and lemon.',
      'Serve salmon over greens with avocado slices.',
    ],
    ingredients: ['Wild Caught Salmon', 'Baby Spinach', 'Extra Virgin Olive Oil', 'Avocados'],
  },
  {
    id: 'l-h-4',
    name: 'Chicken Quinoa Bowl',
    type: 'lunch',
    category: 'healthy',
    description: 'Lean protein with whole grains.',
    prepTime: '20 min',
    steps: [
      'Grill or pan-sear chicken breast.',
      'Slice and serve over quinoa with roasted veggies.',
      'Drizzle with olive oil and apple cider vinegar.',
    ],
    ingredients: ['Chicken Breast', 'Quinoa', 'Sweet Potatoes', 'Extra Virgin Olive Oil'],
  },
  {
    id: 'l-h-5',
    name: 'Sweet Potato Stew',
    type: 'lunch',
    category: 'healthy',
    description: 'Warm, filling, nutrient-dense.',
    prepTime: '25 min',
    steps: [
      'Dice sweet potatoes and sauté in olive oil.',
      'Add vegetable broth, spinach, and black beans.',
      'Simmer 15 min until thick and hearty.',
    ],
    ingredients: ['Sweet Potatoes', 'Baby Spinach', 'Black Beans', 'Extra Virgin Olive Oil'],
  },

  // ========== LUNCH: QUICK (5) ==========
  {
    id: 'l-q-1',
    name: 'Turkey Sprouts Wrap',
    type: 'lunch',
    category: 'quick',
    description: 'Low energy required, high protein.',
    prepTime: '5 min',
    steps: [
      'Lay out a tortilla.',
      'Layer turkey slices, sprouts, and avocado.',
      'Roll up and eat.',
    ],
    ingredients: ['Turkey Slices', 'Tortillas', 'Avocados'],
  },
  {
    id: 'l-q-2',
    name: 'Healing Lentil Soup',
    type: 'lunch',
    category: 'quick',
    description: 'Quick heat from pre-made batch.',
    prepTime: '5 min',
    steps: [
      'Heat pre-made lentil soup in a pot.',
      'Add a handful of spinach to wilt in.',
      'Serve with sourdough bread.',
    ],
    ingredients: ['Lentil Soup', 'Baby Spinach', 'Sourdough Bread'],
  },
  {
    id: 'l-q-3',
    name: 'PB & Banana Wrap',
    type: 'lunch',
    category: 'quick',
    description: 'Sweet, filling, zero cooking.',
    prepTime: '3 min',
    steps: [
      'Spread almond butter on a tortilla.',
      'Place banana slices across.',
      'Drizzle honey, roll up.',
    ],
    ingredients: ['Almond Butter', 'Bananas', 'Tortillas', 'Honey'],
  },
  {
    id: 'l-q-4',
    name: 'Quick Egg Scramble',
    type: 'lunch',
    category: 'quick',
    description: 'Fast protein hit.',
    prepTime: '5 min',
    steps: [
      'Scramble 3 eggs in butter.',
      'Add salt, pepper, and a handful of spinach.',
      'Eat from the pan if needed.',
    ],
    ingredients: ['Pasture Eggs', 'Grass-Fed Butter', 'Baby Spinach'],
  },
  {
    id: 'l-q-5',
    name: 'Yogurt & Granola',
    type: 'lunch',
    category: 'quick',
    description: 'Grab and go protein bowl.',
    prepTime: '2 min',
    steps: [
      'Scoop yogurt into a bowl.',
      'Top with granola and frozen raspberries.',
      'Eat immediately.',
    ],
    ingredients: ['Greek Yogurt', 'Granola', 'Frozen Raspberries'],
  },

  // ========== DINNER: HEALTHY (5) ==========
  {
    id: 'd-h-1',
    name: 'Seared Salmon',
    type: 'dinner',
    category: 'healthy',
    description: 'Omega-3 rich dinner for better sleep and recovery.',
    prepTime: '20 min',
    steps: [
      'Season salmon with salt, pepper, and olive oil.',
      'Pan-sear skin-side down 5 min, flip 3 min.',
      'Serve with roasted asparagus and wild rice.',
    ],
    ingredients: ['Wild Caught Salmon', 'Extra Virgin Olive Oil', 'Asparagus', 'Wild Rice'],
  },
  {
    id: 'd-h-2',
    name: 'Sheet Pan Chicken & Veggies',
    type: 'dinner',
    category: 'healthy',
    description: 'One pan, minimal cleanup.',
    prepTime: '30 min',
    steps: [
      'Toss chicken and chopped roots in olive oil.',
      'Season with salt, pepper, and dried herbs.',
      'Roast at 400°F for 25 minutes. No flipping needed.',
    ],
    ingredients: ['Chicken Breast', 'Sweet Potatoes', 'Brussels Sprouts', 'Extra Virgin Olive Oil'],
  },
  {
    id: 'd-h-3',
    name: 'Tofu Stir-Fry',
    type: 'dinner',
    category: 'healthy',
    description: 'Light, plant-based and high in antioxidants.',
    prepTime: '15 min',
    steps: [
      'Press and cube tofu, pan-fry until golden.',
      'Add frozen stir-fry veggies and soy sauce.',
      'Serve over rice.',
    ],
    ingredients: ['Tofu', 'Frozen Stir-Fry Veggies', 'Soy Sauce', 'Rice'],
  },
  {
    id: 'd-h-4',
    name: 'Quinoa Stuffed Peppers',
    type: 'dinner',
    category: 'healthy',
    description: 'Colorful, satisfying, nutrient-packed.',
    prepTime: '35 min',
    steps: [
      'Cook quinoa, mix with black beans and spices.',
      'Stuff into halved bell peppers.',
      'Bake at 375°F for 20 minutes.',
    ],
    ingredients: ['Quinoa', 'Black Beans', 'Bell Peppers'],
  },
  {
    id: 'd-h-5',
    name: 'Herb Baked Chicken',
    type: 'dinner',
    category: 'healthy',
    description: 'Classic comfort, minimal effort.',
    prepTime: '30 min',
    steps: [
      'Season chicken with olive oil, garlic, and herbs.',
      'Bake at 400°F for 25 minutes.',
      'Serve with steamed broccoli and sweet potato.',
    ],
    ingredients: ['Chicken Breast', 'Extra Virgin Olive Oil', 'Sweet Potatoes', 'Broccoli'],
  },

  // ========== DINNER: QUICK (5) ==========
  {
    id: 'd-q-1',
    name: '15-Min Stir Fry',
    type: 'dinner',
    category: 'quick',
    description: 'Fast, warm, and filling.',
    prepTime: '15 min',
    steps: [
      'Sauté frozen veggies with protein over high heat.',
      'Add 2 tbsp soy sauce and a splash of honey.',
      'Serve over pre-cooked rice or grains.',
    ],
    ingredients: ['Frozen Stir-Fry Veggies', 'Soy Sauce', 'Honey', 'Rice'],
  },
  {
    id: 'd-q-2',
    name: 'Lazy Day Red Curry',
    type: 'dinner',
    category: 'quick',
    description: 'Comforting, creamy, one-pot.',
    prepTime: '12 min',
    steps: [
      'Simmer curry paste in 1 can coconut milk for 2 minutes.',
      'Add any leftover protein and a bag of spinach.',
      'Squeeze lime over it and eat from the pot if needed.',
    ],
    ingredients: ['Curry Paste', 'Coconut Milk', 'Baby Spinach', 'Limes'],
  },
  {
    id: 'd-q-3',
    name: '10-Min Pesto Pasta',
    type: 'dinner',
    category: 'quick',
    description: 'The ultimate safety-net meal for exhausted evenings.',
    prepTime: '10 min',
    steps: [
      'Boil pasta per package directions.',
      'Drain and toss with pesto sauce.',
      'Top with cherry tomatoes and parmesan.',
    ],
    ingredients: ['Pasta', 'Pesto Sauce', 'Cherry Tomatoes'],
  },
  {
    id: 'd-q-4',
    name: 'Bean & Corn Tacos',
    type: 'dinner',
    category: 'quick',
    description: 'Pantry staples for a filling finish.',
    prepTime: '8 min',
    steps: [
      'Heat black beans with cumin and lime juice.',
      'Warm tortillas in a dry pan.',
      'Fill with beans, corn, and avocado.',
    ],
    ingredients: ['Black Beans', 'Corn', 'Tortillas', 'Avocados', 'Limes'],
  },
  {
    id: 'd-q-5',
    name: 'Egg Fried Rice',
    type: 'dinner',
    category: 'quick',
    description: 'Use leftover rice for a 10-minute meal.',
    prepTime: '10 min',
    steps: [
      'Scramble eggs in butter, set aside.',
      'Fry leftover rice with soy sauce and frozen veggies.',
      'Combine eggs back in, season to taste.',
    ],
    ingredients: ['Pasture Eggs', 'Rice', 'Soy Sauce', 'Frozen Stir-Fry Veggies', 'Grass-Fed Butter'],
  },
]

export default meals

export function getMealsByType(type) {
  return meals.filter(m => m.type === type)
}

export function getMealsByCategory(category) {
  return meals.filter(m => m.category === category)
}

export function getMealById(id) {
  return meals.find(m => m.id === id)
}

export function getHealthyMeals(type) {
  return meals.filter(m => m.type === type && m.category === 'healthy')
}

export function getQuickMeals(type) {
  return meals.filter(m => m.type === type && m.category === 'quick')
}
