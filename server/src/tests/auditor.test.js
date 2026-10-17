import { describe, it, expect } from 'vitest';
import { runDeterministicAudit } from '../services/deterministicAuditor.js';
import { runBackboardAudit, validateEvidenceAgainstInput } from '../services/backboardService.js';
import { parseMenuCSV } from '../utils/csvParser.js';
import { ISSUE_CATEGORIES, SEVERITIES, FINDING_STATUS } from '../shared/constants.js';
import { DEMO_MENU_ITEMS } from '../shared/demoMenu.js';

describe('Menu Auditing Engine: Layer 1 Deterministic Checks', () => {
  it('detects duplicate menu items across menu sections', () => {
    const items = [
      { id: '1', name: 'Truffle Risotto', category: 'Mains', price: 24, description: 'Creamy risotto' },
      { id: '2', name: 'Truffle Risotto', category: 'Specials', price: 24, description: 'Creamy risotto' }
    ];

    const findings = runDeterministicAudit(items);
    const duplicates = findings.filter(f => f.category === ISSUE_CATEGORIES.DUPLICATE_ITEM);
    expect(duplicates.length).toBeGreaterThanOrEqual(1);
    expect(duplicates[0].menuItemName).toBe('Truffle Risotto');
  });

  it('detects conflicting prices for identical items without size variants', () => {
    const items = [
      { id: '1', name: 'Truffle Wild Mushroom Risotto', category: 'Mains', price: 24.00, description: 'Risotto with mushrooms' },
      { id: '2', name: 'Truffle Wild Mushroom Risotto', category: 'Chef Specials', price: 28.00, description: 'Risotto with mushrooms' }
    ];

    const findings = runDeterministicAudit(items);
    const priceConflicts = findings.filter(f => f.category === ISSUE_CATEGORIES.PRICE_CONFLICT);
    expect(priceConflicts.length).toBeGreaterThanOrEqual(1);
    expect(priceConflicts[0].severity).toBe(SEVERITIES.CRITICAL);
    expect(priceConflicts[0].evidence).toContain('$24.00');
    expect(priceConflicts[0].evidence).toContain('$28.00');
  });

  it('does NOT flag legitimate size variants as price conflicts', () => {
    const items = [
      {
        id: '1',
        name: 'House Roasted Drip Coffee',
        category: 'Beverages',
        price: 3.50,
        description: 'Freshly brewed roast coffee with caramel notes.',
        sizeVariants: [
          { size: 'Regular 12oz', price: 3.50 },
          { size: 'Large 16oz', price: 4.50 }
        ]
      }
    ];

    const findings = runDeterministicAudit(items);
    const priceConflicts = findings.filter(f => f.category === ISSUE_CATEGORIES.PRICE_CONFLICT);
    const duplicates = findings.filter(f => f.category === ISSUE_CATEGORIES.DUPLICATE_ITEM);
    expect(priceConflicts.length).toBe(0);
    expect(duplicates.length).toBe(0);
  });

  it('detects missing price on menu items', () => {
    const items = [
      { id: '1', name: 'Rustic Avocado Tartine', category: 'Breakfast', price: null, description: 'Toast with avocado.' }
    ];

    const findings = runDeterministicAudit(items);
    const missingPrice = findings.find(f => f.category === ISSUE_CATEGORIES.MISSING_PRICE);
    expect(missingPrice).toBeDefined();
    expect(missingPrice.severity).toBe(SEVERITIES.HIGH);
  });

  it('detects missing required fields (name, category)', () => {
    const items = [
      { id: '1', name: '', category: 'Mains', price: 10, description: 'Tasty item' },
      { id: '2', name: 'Soup', category: '', price: 6, description: 'Warm soup' }
    ];

    const findings = runDeterministicAudit(items);
    const missingFields = findings.filter(f => f.category === ISSUE_CATEGORIES.MISSING_REQUIRED_FIELD);
    expect(missingFields.length).toBeGreaterThanOrEqual(2);
  });

  it('detects dietary contradictions when ingredients violate dietary claims', () => {
    const items = [
      {
        id: '1',
        name: 'Vegan French Toast',
        category: 'Breakfast',
        price: 14.50,
        description: 'Brioche toast.',
        ingredients: ['brioche bread', 'farm fresh eggs', 'whole dairy milk', 'sweet butter'],
        dietaryLabels: ['Vegan', 'Dairy-Free']
      }
    ];

    const findings = runDeterministicAudit(items);
    const dietaryIssues = findings.filter(f => f.category === ISSUE_CATEGORIES.DIETARY_CONTRADICTION);
    expect(dietaryIssues.length).toBeGreaterThanOrEqual(1);
    expect(dietaryIssues[0].severity).toBe(SEVERITIES.CRITICAL);
    expect(dietaryIssues.some(d => d.evidence.includes('dairy milk') || d.evidence.includes('butter') || d.evidence.includes('eggs'))).toBe(true);
  });
});

describe('Backboard AI Service & Evidence Validation', () => {
  it('correctly validates evidence presence against source data', () => {
    const item = {
      name: 'Wild Salmon Tartare',
      description: 'Hand-cut king salmon with avocado mousse',
      ingredients: ['fresh king salmon', 'avocado', 'sea salt']
    };

    expect(validateEvidenceAgainstInput('hand-cut king salmon', item)).toBe(true);
    expect(validateEvidenceAgainstInput('completely made-up artificial unicorn meat', item)).toBe(false);
  });

  it('provides safe, clearly labelled mock audit when Backboard API credentials are absent', async () => {
    const origKey = process.env.BACKBOARD_API_KEY;
    process.env.BACKBOARD_API_KEY = '';
    try {
      const result = await runBackboardAudit(DEMO_MENU_ITEMS);
      expect(result).toBeDefined();
      expect(result.isMock).toBe(true);
      expect(result.modelUsed).toContain('Mock Backboard');
      expect(Array.isArray(result.findings)).toBe(true);
      expect(result.findings.length).toBeGreaterThan(0);

      // Verify mock findings have structured fields
      const mismatch = result.findings.find(f => f.category === ISSUE_CATEGORIES.INGREDIENT_MISMATCH);
      expect(mismatch).toBeDefined();
      expect(mismatch.menuItemName).toContain('Salmon');
      expect(mismatch.suggestedCorrection).toBeDefined();
    } finally {
      process.env.BACKBOARD_API_KEY = origKey;
    }
  });
});

describe('CSV Parser and Validation with Malformed Rows', () => {
  it('parses valid CSV correctly with ingredients and labels', () => {
    const csv = `name,category,price,description,ingredients,dietaryLabels
Garden Salad,Bowls,12.50,Crisp romaine lettuce with cucumbers,romaine; cucumber; olive oil,Vegan; Gluten-Free
Espresso,Beverages,3.50,Double shot espresso,coffee beans; water,Vegan; Gluten-Free`;

    const result = parseMenuCSV(csv);
    expect(result.validCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.validItems[0].name).toBe('Garden Salad');
    expect(result.validItems[0].price).toBe(12.5);
    expect(result.validItems[0].ingredients).toContain('romaine');
    expect(result.validItems[0].dietaryLabels).toContain('Vegan');
  });

  it('gracefully reports malformed rows without crashing or discarding valid rows', () => {
    const csv = `name,category,price,description,ingredients,dietaryLabels
Valid Item,Mains,15.00,Good description,chicken; rice,Gluten-Free
,Mains,10.00,Missing name row,beef,
Malformed Price Item,Mains,-5.00,Negative price,pork,
Another Valid Item,Beverages,4.00,Fresh lemonade,lemon; water; sugar,Vegan`;

    const result = parseMenuCSV(csv);
    expect(result.validCount).toBe(2);
    expect(result.errorCount).toBe(2);
    expect(result.errors[0].rowNumber).toBe(3); // row 3 is missing name
    expect(result.errors[1].rowNumber).toBe(4); // row 4 has negative price
    expect(result.validItems.map(i => i.name)).toEqual(['Valid Item', 'Another Valid Item']);
  });
});
