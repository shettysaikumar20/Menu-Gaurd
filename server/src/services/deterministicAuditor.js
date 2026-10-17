import { v4 as uuidv4 } from 'uuid';
import { ISSUE_CATEGORIES, SEVERITIES, ANALYSIS_LAYERS, FINDING_STATUS } from '../shared/constants.js';

// Non-compliant ingredient patterns for dietary checks
const DIETARY_RULES = {
  vegan: {
    label: 'Vegan',
    prohibited: [
      { pattern: /\b(milk|dairy|whole milk|skim milk|butter|cheese|cream|heavy cream|half and half|whey|casein|ghee|yogurt|ricotta|parmesan|mozzarella|provolone|brie|feta)\b/i, reason: 'contains dairy products' },
      { pattern: /\b(egg|eggs|egg wash|egg whites|egg yolk|pasture-raised eggs|farm fresh eggs)\b/i, reason: 'contains eggs' },
      { pattern: /\b(honey|clover honey|raw honey)\b/i, reason: 'contains honey (animal byproduct)' },
      { pattern: /\b(beef|pork|chicken|lamb|veal|bacon|prosciutto|ham|sausage|gelatin|lard|meat|duck|turkey)\b/i, reason: 'contains meat or animal fat' },
      { pattern: /\b(salmon|fish|tuna|anchovy|shrimp|crab|lobster|prawn|seafood|clam|oyster|squid|calamari)\b/i, reason: 'contains seafood/fish' }
    ]
  },
  vegetarian: {
    label: 'Vegetarian',
    prohibited: [
      { pattern: /\b(beef|pork|chicken|lamb|veal|bacon|prosciutto|ham|sausage|gelatin|lard|meat|duck|turkey)\b/i, reason: 'contains meat or poultry' },
      { pattern: /\b(salmon|fish|tuna|anchovy|shrimp|crab|lobster|prawn|seafood|clam|oyster|squid|calamari)\b/i, reason: 'contains seafood or fish' }
    ]
  },
  'gluten-free': {
    label: 'Gluten-Free',
    prohibited: [
      { 
        pattern: /\b(wheat|barley|rye|malt|barley malt|flour|unbleached flour|wheat flour|pastry flour|breadcrumbs|panko|brioche|ciabatta|focaccia|pita|sourdough|semolina|spelt|pasta|soy sauce)\b/i, 
        excludePattern: /\b(gluten-free|gf|almond flour|coconut flour|rice flour|tamari|gluten free)\b/i,
        reason: 'contains gluten-bearing grains or bakery ingredients' 
      }
    ]
  },
  'dairy-free': {
    label: 'Dairy-Free',
    prohibited: [
      { 
        pattern: /\b(milk|dairy|whole milk|butter|sweet butter|cultured butter|cheese|cream|heavy cream|half and half|whey|casein|ghee|yogurt|ricotta|parmesan|mozzarella|provolone|brie|feta)\b/i,
        excludePattern: /\b(oat milk|almond milk|soy milk|coconut milk|vegan butter|plant butter|dairy-free|dairy free)\b/i,
        reason: 'contains dairy' 
      }
    ]
  },
  'nut-free': {
    label: 'Nut-Free',
    prohibited: [
      { 
        pattern: /\b(peanut|peanuts|almond|almonds|walnut|walnuts|cashew|cashews|pecan|pecans|pistachio|pistachios|macadamia|hazelnut|hazelnuts|pine nut|pine nuts)\b/i,
        excludePattern: /\b(nut-free|nut free)\b/i,
        reason: 'contains tree nuts or peanuts' 
      }
    ]
  }
};

/**
 * Normalizes item names for loose comparison
 */
function normalizeName(name) {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Runs Layer 1: Deterministic JavaScript checks on menu items.
 * @param {Array} items - List of menu items to audit
 * @returns {Array} List of audit findings
 */
export function runDeterministicAudit(items = []) {
  const findings = [];
  if (!Array.isArray(items) || items.length === 0) {
    return findings;
  }

  // Group items by normalized name for duplicate and price conflict detection
  const itemsByName = new Map();

  items.forEach((item, index) => {
    const rawId = item.id || `item-${index}`;
    const name = item.name ? item.name.trim() : '';
    const norm = normalizeName(name);

    // Check 1: Missing Required Fields
    if (!name) {
      findings.push({
        id: uuidv4(),
        category: ISSUE_CATEGORIES.MISSING_REQUIRED_FIELD,
        severity: SEVERITIES.CRITICAL,
        layer: ANALYSIS_LAYERS.DETERMINISTIC,
        menuItemId: rawId,
        menuItemName: `Item #${index + 1} (Unnamed)`,
        explanation: 'Menu item is missing a required name field.',
        evidence: `Item index ${index}: ${JSON.stringify(item)}`,
        suggestedCorrection: 'Provide a clear, recognizable name for this menu item.',
        confidence: 'HIGH',
        status: FINDING_STATUS.PENDING,
        originalItemSnapshot: { ...item },
        correctedItemSnapshot: { ...item, name: `New Menu Item ${index + 1}` }
      });
    }

    if (!item.category || item.category.trim() === '') {
      findings.push({
        id: uuidv4(),
        category: ISSUE_CATEGORIES.MISSING_REQUIRED_FIELD,
        severity: SEVERITIES.HIGH,
        layer: ANALYSIS_LAYERS.DETERMINISTIC,
        menuItemId: rawId,
        menuItemName: name || `Item #${index + 1}`,
        explanation: 'Menu item has no menu section / category specified.',
        evidence: `Category field is empty or undefined.`,
        suggestedCorrection: 'Assign this item to an active category (e.g., Breakfast, Mains, Beverages).',
        confidence: 'HIGH',
        status: FINDING_STATUS.PENDING,
        originalItemSnapshot: { ...item },
        correctedItemSnapshot: { ...item, category: 'Mains' }
      });
    }

    // Check 2: Missing Price
    const priceNum = item.price !== null && item.price !== undefined ? Number(item.price) : null;
    const hasValidPrice = priceNum !== null && !isNaN(priceNum) && priceNum > 0;
    const hasSizeVariants = Array.isArray(item.sizeVariants) && item.sizeVariants.length > 0;

    if (!hasValidPrice && !hasSizeVariants) {
      findings.push({
        id: uuidv4(),
        category: ISSUE_CATEGORIES.MISSING_PRICE,
        severity: SEVERITIES.HIGH,
        layer: ANALYSIS_LAYERS.DETERMINISTIC,
        menuItemId: rawId,
        menuItemName: name || `Item #${index + 1}`,
        explanation: 'Menu item has no price configured, which prevents order placement and POS sync.',
        evidence: `Price value is: ${item.price === null ? 'null' : item.price === undefined ? 'undefined' : item.price}`,
        suggestedCorrection: 'Specify a valid retail price or configure portion size variants.',
        confidence: 'HIGH',
        status: FINDING_STATUS.PENDING,
        originalItemSnapshot: { ...item },
        correctedItemSnapshot: { ...item, price: 12.00 }
      });
    }

    // Check 3: Missing Description
    const desc = (item.description || '').trim();
    if (!desc || desc.length < 5) {
      findings.push({
        id: uuidv4(),
        category: ISSUE_CATEGORIES.MISSING_DESCRIPTION,
        severity: SEVERITIES.MEDIUM,
        layer: ANALYSIS_LAYERS.DETERMINISTIC,
        menuItemId: rawId,
        menuItemName: name,
        explanation: 'Menu item has no description or description is too brief (< 5 characters) for customer clarity.',
        evidence: `Description is empty or '${desc}'.`,
        suggestedCorrection: 'Add a helpful 1-2 sentence description explaining preparation and key ingredients.',
        confidence: 'HIGH',
        status: FINDING_STATUS.PENDING,
        originalItemSnapshot: { ...item },
        correctedItemSnapshot: { ...item, description: `Freshly prepared ${name} made daily with quality ingredients.` }
      });
    }

    // Check 4: Deterministic Dietary Label Conflicts
    const ingredients = Array.isArray(item.ingredients) 
      ? item.ingredients.map(i => String(i).toLowerCase().trim()) 
      : typeof item.ingredients === 'string'
      ? item.ingredients.split(',').map(i => i.toLowerCase().trim())
      : [];

    const labels = Array.isArray(item.dietaryLabels) 
      ? item.dietaryLabels 
      : typeof item.dietaryLabels === 'string' 
      ? item.dietaryLabels.split(',').map(l => l.trim()) 
      : [];

    labels.forEach(label => {
      const cleanLabel = label.trim().toLowerCase();
      const rule = DIETARY_RULES[cleanLabel];
      if (rule && ingredients.length > 0) {
        for (const ing of ingredients) {
          for (const check of rule.prohibited) {
            if (check.excludePattern && check.excludePattern.test(ing)) {
              // Excluded safe substitution (e.g. "oat milk" for dairy-free)
              continue;
            }
            if (check.pattern.test(ing)) {
              const matchedWord = ing.match(check.pattern)?.[0] || ing;
              findings.push({
                id: uuidv4(),
                category: ISSUE_CATEGORIES.DIETARY_CONTRADICTION,
                severity: SEVERITIES.CRITICAL,
                layer: ANALYSIS_LAYERS.DETERMINISTIC,
                menuItemId: rawId,
                menuItemName: name,
                explanation: `Item is labeled '${rule.label}', but supplied ingredient '${ing}' ${check.reason}.`,
                evidence: `Dietary Labels: [${labels.join(', ')}] | Conflict: Ingredient '${ing}' contains '${matchedWord}'`,
                suggestedCorrection: `Remove the '${rule.label}' badge, or substitute '${ing}' with a certified ${rule.label} alternative.`,
                confidence: 'HIGH',
                status: FINDING_STATUS.PENDING,
                originalItemSnapshot: { ...item },
                correctedItemSnapshot: {
                  ...item,
                  dietaryLabels: labels.filter(l => l.toLowerCase() !== cleanLabel)
                }
              });
              break; // one violation per ingredient per rule is sufficient
            }
          }
        }
      }
    });

    // Populate grouping for duplicate / price conflict checks
    if (norm) {
      if (!itemsByName.has(norm)) {
        itemsByName.set(norm, []);
      }
      itemsByName.get(norm).push({ item, index, rawId, priceNum, hasSizeVariants });
    }
  });

  // Check 5 & 6: Duplicate Items and Conflicting Prices across duplicates
  for (const [norm, group] of itemsByName.entries()) {
    if (group.length > 1) {
      // We have multiple items with the same or near-identical name
      const distinctCategories = [...new Set(group.map(g => g.item.category || 'Unassigned'))];
      const distinctPrices = [...new Set(group.map(g => g.priceNum).filter(p => p !== null))];

      // Flag duplicate item
      const itemNames = group.map(g => `"${g.item.name}" (ID: ${g.rawId}, Section: ${g.item.category})`).join(' and ');
      
      findings.push({
        id: uuidv4(),
        category: ISSUE_CATEGORIES.DUPLICATE_ITEM,
        severity: distinctPrices.length > 1 ? SEVERITIES.HIGH : SEVERITIES.MEDIUM,
        layer: ANALYSIS_LAYERS.DETERMINISTIC,
        menuItemId: group[1].rawId,
        menuItemName: group[0].item.name,
        explanation: `Duplicate item found across menu: ${itemNames}. Having duplicates can confuse customers and cause kitchen order routing errors.`,
        evidence: `Duplicate names detected: ${group.map(g => `[${g.item.category}: $${g.priceNum}]`).join(' vs ')}`,
        suggestedCorrection: distinctCategories.length > 1 
          ? `Consolidate into a single section, or rename the variant (e.g., "${group[0].item.name} - Special Edition").`
          : `Remove the duplicate entry.`,
        confidence: 'HIGH',
        status: FINDING_STATUS.PENDING,
        originalItemSnapshot: { ...group[1].item },
        correctedItemSnapshot: { ...group[1].item, name: `${group[1].item.name} (Variant)` }
      });

      // If prices conflict and neither has explicit size variants, flag conflicting price!
      if (distinctPrices.length > 1) {
        const hasExplicitSizeVariants = group.some(g => g.hasSizeVariants);
        if (!hasExplicitSizeVariants) {
          findings.push({
            id: uuidv4(),
            category: ISSUE_CATEGORIES.PRICE_CONFLICT,
            severity: SEVERITIES.CRITICAL,
            layer: ANALYSIS_LAYERS.DETERMINISTIC,
            menuItemId: group[1].rawId,
            menuItemName: group[0].item.name,
            explanation: `Conflicting prices detected for "${group[0].item.name}": listed at ${distinctPrices.map(p => `$${Number(p).toFixed(2)}`).join(' vs ')} without documented size variants.`,
            evidence: `Price mismatch: ${group.map(g => `${g.item.category || 'Section'}: $${Number(g.priceNum).toFixed(2)}`).join(' vs ')}`,
            suggestedCorrection: `Align both listings to the intended price ($${Number(Math.min(...distinctPrices)).toFixed(2)} or $${Number(Math.max(...distinctPrices)).toFixed(2)}), or add portion size labels.`,
            confidence: 'HIGH',
            status: FINDING_STATUS.PENDING,
            originalItemSnapshot: { ...group[1].item },
            correctedItemSnapshot: { ...group[1].item, price: Math.min(...distinctPrices) }
          });
        }
      }
    }
  }

  return findings;
}
