// ~35 core grocery items, tagged by store, category, brand, and cost
const groceries = [
  // ===== PRODUCE =====
  { id: 'g-1',  name: 'Baby Spinach',          brand: 'Earthbound Farm Organic', cost: 4.99,  store: 'A', category: 'Produce' },
  { id: 'g-2',  name: 'Avocados',              brand: 'Hass Large (3-pack)',     cost: 5.50,  store: 'A', category: 'Produce' },
  { id: 'g-3',  name: 'Blueberries',           brand: "Organic Driscoll's",      cost: 6.00,  store: 'A', category: 'Produce' },
  { id: 'g-4',  name: 'Sweet Potatoes',         brand: 'Garnet Yams (per lb)',   cost: 1.89,  store: 'A', category: 'Produce' },
  { id: 'g-5',  name: 'Bananas',               brand: 'Organic (bunch)',         cost: 1.50,  store: 'A', category: 'Produce' },
  { id: 'g-6',  name: 'Lemons',                brand: 'Organic (3-pack)',        cost: 2.00,  store: 'A', category: 'Produce' },
  { id: 'g-7',  name: 'Limes',                 brand: 'Organic (bag)',           cost: 3.00,  store: 'B', category: 'Produce' },
  { id: 'g-8',  name: 'Bell Peppers',          brand: 'Organic Mixed (3-pack)', cost: 4.50,  store: 'A', category: 'Produce' },
  { id: 'g-9',  name: 'Broccoli',              brand: 'Organic Crown',          cost: 2.50,  store: 'A', category: 'Produce' },
  { id: 'g-10', name: 'Asparagus',             brand: 'Organic Bundle',         cost: 3.99,  store: 'A', category: 'Produce' },
  { id: 'g-11', name: 'Cherry Tomatoes',        brand: 'NatureSweet',           cost: 3.50,  store: 'B', category: 'Produce' },

  // ===== DAIRY & COLD =====
  { id: 'g-12', name: 'Greek Yogurt',          brand: 'Fage Total 5%',          cost: 5.99,  store: 'A', category: 'Dairy & Cold' },
  { id: 'g-13', name: 'Pasture Eggs',          brand: 'Vital Farms',            cost: 8.49,  store: 'A', category: 'Dairy & Cold' },
  { id: 'g-14', name: 'Grass-Fed Butter',      brand: 'Kerrygold',              cost: 4.50,  store: 'A', category: 'Dairy & Cold' },
  { id: 'g-15', name: 'Almond Milk',           brand: 'Califia Farms',          cost: 4.99,  store: 'B', category: 'Dairy & Cold' },
  { id: 'g-16', name: 'Tofu',                  brand: 'Organic Extra Firm',     cost: 3.50,  store: 'B', category: 'Dairy & Cold' },

  // ===== GRAINS & PANTRY =====
  { id: 'g-17', name: 'Quinoa',                brand: "Bob's Red Mill",         cost: 7.99,  store: 'A', category: 'Grains & Pantry' },
  { id: 'g-18', name: 'Steel Cut Oats',        brand: 'Organic Bulk',           cost: 3.40,  store: 'A', category: 'Grains & Pantry' },
  { id: 'g-19', name: 'Raw Almonds',           brand: 'California Grown',       cost: 8.50,  store: 'A', category: 'Grains & Pantry' },
  { id: 'g-20', name: 'Chia Seeds',            brand: 'Navitas Organics',       cost: 9.00,  store: 'A', category: 'Grains & Pantry' },
  { id: 'g-21', name: 'Extra Virgin Olive Oil', brand: 'California Olive Ranch', cost: 14.99, store: 'A', category: 'Grains & Pantry' },
  { id: 'g-22', name: 'Apple Cider Vinegar',   brand: "Bragg's Raw",            cost: 6.20,  store: 'A', category: 'Grains & Pantry' },
  { id: 'g-23', name: 'Honey',                 brand: 'Local Raw Wildflower',   cost: 8.99,  store: 'B', category: 'Grains & Pantry' },
  { id: 'g-24', name: 'Rice',                  brand: 'Lundberg Organic',       cost: 5.99,  store: 'B', category: 'Grains & Pantry' },
  { id: 'g-25', name: 'Pasta',                 brand: 'DeLallo Organic',        cost: 3.50,  store: 'B', category: 'Grains & Pantry' },
  { id: 'g-26', name: 'Soy Sauce',             brand: 'San-J Tamari',           cost: 5.99,  store: 'B', category: 'Grains & Pantry' },
  { id: 'g-27', name: 'Almond Butter',         brand: "Justin's",               cost: 9.50,  store: 'A', category: 'Grains & Pantry' },
  { id: 'g-28', name: 'Tortillas',             brand: 'Siete Grain Free',       cost: 7.99,  store: 'B', category: 'Grains & Pantry' },
  { id: 'g-29', name: 'Granola',               brand: 'Bear Naked',             cost: 5.49,  store: 'B', category: 'Grains & Pantry' },
  { id: 'g-30', name: 'Tahini',                brand: 'Soom',                   cost: 8.99,  store: 'B', category: 'Grains & Pantry' },

  // ===== PROTEINS =====
  { id: 'g-31', name: 'Wild Caught Salmon',    brand: 'Sockeye (per lb)',       cost: 16.00, store: 'A', category: 'Proteins' },
  { id: 'g-32', name: 'Chicken Breast',        brand: 'Organic Free-Range',     cost: 11.50, store: 'A', category: 'Proteins' },
  { id: 'g-33', name: 'Turkey Slices',         brand: 'Applegate Organic',      cost: 7.99,  store: 'B', category: 'Proteins' },
  { id: 'g-34', name: 'Protein Powder',        brand: 'Orgain Plant-Based',     cost: 29.99, store: 'B', category: 'Proteins' },
  { id: 'g-35', name: 'Black Beans',           brand: 'Eden Organic (canned)',  cost: 2.99,  store: 'B', category: 'Proteins' },

  // ===== FROZEN =====
  { id: 'g-36', name: 'Frozen Raspberries',    brand: "Wyman's Wild",           cost: 10.99, store: 'A', category: 'Frozen' },
  { id: 'g-37', name: 'Brussels Sprouts',      brand: 'Birds Eye Organic',      cost: 3.50,  store: 'B', category: 'Frozen' },
  { id: 'g-38', name: 'Frozen Stir-Fry Veggies', brand: 'Birds Eye',           cost: 3.99,  store: 'B', category: 'Frozen' },
]

export default groceries

export const storeNames = {
  A: 'The Co-op',
  B: 'Local Market',
}

export function getGroceriesByStore(store) {
  return groceries.filter(g => g.store === store)
}

export function getGroceriesByCategory(category) {
  return groceries.filter(g => g.category === category)
}

export function getTotalBudget() {
  return groceries.reduce((sum, g) => sum + g.cost, 0)
}

export const categories = ['Produce', 'Dairy & Cold', 'Grains & Pantry', 'Proteins', 'Frozen']

export const categoryIcons = {
  'Produce': 'energy_savings_leaf',
  'Dairy & Cold': 'egg',
  'Grains & Pantry': 'bakery_dining',
  'Proteins': 'fitness_center',
  'Frozen': 'ac_unit',
}
