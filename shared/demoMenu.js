export const DEMO_RESTAURANT = {
  name: 'Artisan Hearth Cafe & Bakery',
  menuName: 'Fall & Winter All-Day Menu',
  disclaimer: 'FICTIONAL DEMO DATASET — Curated for testing deterministic and Backboard AI menu validation.'
};

export const DEMO_MENU_ITEMS = [
  // 1. INTENTIONAL TEST CASE: Dietary Contradiction (Marked Vegan & Dairy-Free, contains dairy milk, eggs, butter)
  {
    id: 'demo-item-01',
    name: 'Vegan Brioche French Toast',
    category: 'Breakfast & Brunch',
    price: 14.50,
    description: 'Golden thick-sliced brioche dipped in sweet spiced batter, served with Vermont maple syrup.',
    ingredients: ['brioche bread', 'farm fresh eggs', 'whole dairy milk', 'salted sweet butter', 'cinnamon', 'pure maple syrup'],
    dietaryLabels: ['Vegan', 'Dairy-Free'],
    sizeVariants: []
  },
  // 2. INTENTIONAL TEST CASE: Description contradicts supplied ingredient record (Wild Alaskan Salmon claim vs farm-raised Atlantic salmon ingredients)
  {
    id: 'demo-item-02',
    name: 'Wild Alaskan Salmon Filet',
    category: 'Mains',
    price: 26.00,
    description: 'Pan-seared fresh wild-caught Alaskan king salmon served over roasted seasonal asparagus with fresh lemon dill butter.',
    ingredients: ['farm-raised Atlantic salmon', 'canola oil blend', 'farmed asparagus', 'margarine', 'lemon juice', 'dried dill'],
    dietaryLabels: ['Gluten-Free'],
    sizeVariants: []
  },
  // 3. INTENTIONAL TEST CASE: Duplicate item with conflicting prices across sections
  {
    id: 'demo-item-03',
    name: 'Truffle Wild Mushroom Risotto',
    category: 'Mains',
    price: 24.00,
    description: 'Creamy carnaroli rice with sauteed foraged wild chanterelles, porcini, white truffle oil, and aged parmesan.',
    ingredients: ['carnaroli rice', 'chanterelle mushrooms', 'porcini broth', 'parmesan cheese', 'white truffle oil', 'shallots', 'butter'],
    dietaryLabels: ['Vegetarian', 'Gluten-Free'],
    sizeVariants: []
  },
  // 3b. Duplicate of demo-item-03 in Chef Specials with conflicting price ($28 vs $24)
  {
    id: 'demo-item-04',
    name: 'Truffle Wild Mushroom Risotto',
    category: 'Chef Specials',
    price: 28.00,
    description: 'Creamy carnaroli rice with sauteed foraged wild chanterelles, porcini, white truffle oil, and aged parmesan.',
    ingredients: ['carnaroli rice', 'chanterelle mushrooms', 'porcini broth', 'parmesan cheese', 'white truffle oil', 'shallots', 'butter'],
    dietaryLabels: ['Vegetarian', 'Gluten-Free'],
    sizeVariants: []
  },
  // 4. INTENTIONAL TEST CASE: Missing price
  {
    id: 'demo-item-05',
    name: 'Rustic Avocado Tartine',
    category: 'Sandwiches & Tartines',
    price: null,
    description: 'Toasted house sourdough topped with crushed Hass avocado, heirloom radish, pickled shallot, and flaky sea salt.',
    ingredients: ['sourdough bread', 'Hass avocado', 'radish', 'shallot', 'flaky sea salt', 'extra virgin olive oil', 'lemon zest'],
    dietaryLabels: ['Vegan', 'Vegetarian'],
    sizeVariants: []
  },
  // 5. INTENTIONAL TEST CASE: Missing description
  {
    id: 'demo-item-06',
    name: 'Artisan Cold Brew Single Origin',
    category: 'Beverages',
    price: 5.50,
    description: '',
    ingredients: ['filtered water', 'organic Ethiopian Yirgacheffe coffee beans'],
    dietaryLabels: ['Vegan', 'Gluten-Free'],
    sizeVariants: []
  },
  // 6. INTENTIONAL TEST CASE: Legitimate size variants that MUST NOT be flagged as conflicting prices
  {
    id: 'demo-item-07',
    name: 'House Roasted Drip Coffee',
    category: 'Beverages',
    price: 3.50,
    description: 'Freshly brewed daily roast using sustainable fair-trade Arabica beans with tasting notes of milk chocolate and caramel.',
    ingredients: ['filtered water', 'medium roast Arabica coffee beans'],
    dietaryLabels: ['Vegan', 'Gluten-Free'],
    sizeVariants: [
      { size: 'Regular (12oz)', price: 3.50 },
      { size: 'Large (16oz)', price: 4.50 }
    ]
  },
  // 7. INTENTIONAL TEST CASE: Gluten-Free contradiction (Marked Gluten-Free but contains barley malt & wheat flour)
  {
    id: 'demo-item-08',
    name: 'Crusted Herb Chicken Schnitzel',
    category: 'Mains',
    price: 19.50,
    description: 'Crisp pan-fried chicken cutlet seasoned with fresh thyme and rosemary, served with warm potato salad.',
    ingredients: ['chicken breast', 'wheat flour', 'panko breadcrumbs', 'barley malt extract', 'eggs', 'potatoes', 'olive oil'],
    dietaryLabels: ['Gluten-Free', 'Dairy-Free'],
    sizeVariants: []
  },
  // 8. INTENTIONAL TEST CASE: Misleading / Unclear sugar claim (Claimed "100% sugar free" in description but ingredients contain agave nectar and brown sugar syrup)
  {
    id: 'demo-item-09',
    name: 'Acai Superfood Energy Bowl',
    category: 'Bowls & Salads',
    price: 13.00,
    description: 'Completely sugar-free organic acai puree topped with chia seeds, fresh blueberries, and toasted coconut flakes.',
    ingredients: ['organic acai pulp', 'organic agave nectar', 'brown sugar syrup', 'banana', 'chia seeds', 'blueberries', 'coconut flakes'],
    dietaryLabels: ['Vegan', 'Gluten-Free'],
    sizeVariants: []
  },
  // VALID ITEMS (10 - 24) that must pass smoothly without false positive findings:
  {
    id: 'demo-item-10',
    name: 'Artisan Country Sourdough Loaf',
    category: 'Bakery & Pastries',
    price: 9.00,
    description: 'Naturally fermented 36-hour sourdough baked in a hearth stone deck oven with a crisp blistered crust and open crumb.',
    ingredients: ['organic unbleached wheat flour', 'spring water', 'wild sourdough starter', 'sea salt'],
    dietaryLabels: ['Vegan', 'Vegetarian'],
    sizeVariants: []
  },
  {
    id: 'demo-item-11',
    name: 'Classic Butter Croissant',
    category: 'Bakery & Pastries',
    price: 4.75,
    description: 'Flaky layered viennoiserie laminated with 84% butterfat Normandy butter, baked golden brown.',
    ingredients: ['wheat flour', 'Normandy butter', 'water', 'whole milk', 'cane sugar', 'yeast', 'sea salt', 'egg wash'],
    dietaryLabels: ['Vegetarian'],
    sizeVariants: []
  },
  {
    id: 'demo-item-12',
    name: 'Pain au Chocolat',
    category: 'Bakery & Pastries',
    price: 5.25,
    description: 'Classic butter croissant dough enveloping two batons of 64% Valrhona dark chocolate.',
    ingredients: ['wheat flour', 'Normandy butter', 'Valrhona dark chocolate batons', 'milk', 'cane sugar', 'yeast', 'salt'],
    dietaryLabels: ['Vegetarian'],
    sizeVariants: []
  },
  {
    id: 'demo-item-13',
    name: 'Organic Matcha Green Tea Latte',
    category: 'Beverages',
    price: 6.25,
    description: 'Stone-ground ceremonial Uji matcha whisked with steamed oat milk and a touch of raw clover honey.',
    ingredients: ['ceremonial Uji matcha powder', 'steamed oat milk', 'raw clover honey'],
    dietaryLabels: ['Vegetarian', 'Gluten-Free', 'Dairy-Free'],
    sizeVariants: [
      { size: '12oz Hot', price: 6.25 },
      { size: '16oz Iced', price: 7.00 }
    ]
  },
  {
    id: 'demo-item-14',
    name: 'Golden Turmeric Ginger Tonic',
    category: 'Beverages',
    price: 5.75,
    description: 'Cold-pressed organic turmeric root, Peruvian ginger, Meyer lemon, and sparkling mineral water.',
    ingredients: ['fresh turmeric juice', 'ginger juice', 'Meyer lemon juice', 'sparkling mineral water', 'organic agave'],
    dietaryLabels: ['Vegan', 'Vegetarian', 'Gluten-Free'],
    sizeVariants: []
  },
  {
    id: 'demo-item-15',
    name: 'Charred Heirloom Tomato Salad',
    category: 'Bowls & Salads',
    price: 15.00,
    description: 'Ripe heirloom tomatoes with torn buffalo mozzarella, fresh basil, aged balsamic reduction, and toasted pine nuts.',
    ingredients: ['heirloom tomatoes', 'buffalo mozzarella', 'fresh basil', 'extra virgin olive oil', 'balsamic vinegar', 'pine nuts', 'sea salt'],
    dietaryLabels: ['Vegetarian', 'Gluten-Free'],
    sizeVariants: []
  },
  {
    id: 'demo-item-16',
    name: 'Mediterranean Grain & Lentil Bowl',
    category: 'Bowls & Salads',
    price: 16.50,
    description: 'Warm French green lentils, tricolor quinoa, roasted baby beets, baby kale, cucumber ribbons, and tahini lemon dressing.',
    ingredients: ['French green lentils', 'quinoa', 'roasted beets', 'baby kale', 'cucumber', 'tahini', 'lemon juice', 'garlic', 'olive oil'],
    dietaryLabels: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free'],
    sizeVariants: []
  },
  {
    id: 'demo-item-17',
    name: 'Prosciutto di Parma & Fig Panini',
    category: 'Sandwiches & Tartines',
    price: 17.00,
    description: 'Aged Prosciutto di Parma, black mission fig jam, creamy brie, and wild arugula pressed on house ciabatta.',
    ingredients: ['ciabatta bread', 'Prosciutto di Parma', 'fig jam', 'brie cheese', 'wild arugula', 'olive oil'],
    dietaryLabels: [],
    sizeVariants: []
  },
  {
    id: 'demo-item-18',
    name: 'Grilled Portobello & Pesto Melt',
    category: 'Sandwiches & Tartines',
    price: 15.50,
    description: 'Marinated balsamic portobello cap with house nut-free basil pesto, roasted red bell peppers, and smoked provolone.',
    ingredients: ['focaccia bread', 'portobello mushroom', 'basil pesto (nut-free)', 'roasted red pepper', 'smoked provolone cheese', 'olive oil'],
    dietaryLabels: ['Vegetarian'],
    sizeVariants: []
  },
  {
    id: 'demo-item-19',
    name: 'Smoked Shakshuka Skillet',
    category: 'Breakfast & Brunch',
    price: 16.00,
    description: 'Two poached farm eggs simmered in spiced San Marzano tomato sauce with bell peppers, cumin, cilantro, and warm zaatar pita.',
    ingredients: ['pasture-raised eggs', 'San Marzano tomatoes', 'bell peppers', 'yellow onion', 'garlic', 'cumin', 'smoked paprika', 'pita bread', 'feta cheese'],
    dietaryLabels: ['Vegetarian'],
    sizeVariants: []
  },
  {
    id: 'demo-item-20',
    name: 'Lemon Ricotta Hotcakes',
    category: 'Breakfast & Brunch',
    price: 15.50,
    description: 'Fluffy whole milk ricotta pancakes infused with fresh Meyer lemon zest, macerated wild blackberries, and cultured butter.',
    ingredients: ['flour', 'whole milk ricotta cheese', 'eggs', 'milk', 'Meyer lemon zest', 'baking powder', 'wild blackberries', 'butter', 'pure maple syrup'],
    dietaryLabels: ['Vegetarian'],
    sizeVariants: []
  },
  {
    id: 'demo-item-21',
    name: 'Slow-Braised Grass-Fed Short Rib',
    category: 'Mains',
    price: 32.00,
    description: 'Bone-in Angus beef short rib slow-cooked for 8 hours with red wine and rosemary, served over Yukon gold potato puree.',
    ingredients: ['grass-fed beef short rib', 'red wine reduction', 'beef stock', 'Yukon gold potatoes', 'butter', 'heavy cream', 'rosemary', 'thyme', 'garlic'],
    dietaryLabels: ['Gluten-Free'],
    sizeVariants: []
  },
  {
    id: 'demo-item-22',
    name: 'Wild Blackberry Lemon Galette',
    category: 'Bakery & Pastries',
    price: 7.50,
    description: 'Rustic flaky butter crust filled with sweet Oregon blackberries and Meyer lemon curd, finished with demerara sugar.',
    ingredients: ['pastry flour', 'unsalted butter', 'Oregon wild blackberries', 'lemon curd', 'demerara sugar', 'egg wash'],
    dietaryLabels: ['Vegetarian'],
    sizeVariants: []
  },
  {
    id: 'demo-item-23',
    name: 'Double Espresso',
    category: 'Beverages',
    price: 3.75,
    description: 'Full-bodied double shot extracted from freshly ground washed Colombian and Ethiopian roast beans with thick crema.',
    ingredients: ['filtered water', 'espresso blend coffee beans'],
    dietaryLabels: ['Vegan', 'Vegetarian', 'Gluten-Free'],
    sizeVariants: []
  },
  {
    id: 'demo-item-24',
    name: 'Sparkling Rosemary Grapefruit Fizz',
    category: 'Beverages',
    price: 5.50,
    description: 'House-squeezed Ruby Red grapefruit juice infused with fresh garden rosemary and charged sparkling soda water.',
    ingredients: ['fresh ruby red grapefruit juice', 'rosemary simple syrup', 'sparkling mineral water'],
    dietaryLabels: ['Vegan', 'Vegetarian', 'Gluten-Free'],
    sizeVariants: []
  }
];
