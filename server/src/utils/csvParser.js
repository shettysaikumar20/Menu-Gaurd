import { CSVRowSchema } from '../shared/schema.js';

/**
 * Parses raw CSV string handling escaped commas and quotes
 */
function parseCSVLines(text) {
  const lines = [];
  let currentField = '';
  let currentLine = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip CRLF
      }
      currentLine.push(currentField.trim());
      if (currentLine.some(f => f.length > 0)) {
        lines.push(currentLine);
      }
      currentLine = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.some(f => f.length > 0)) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Validates and transforms parsed CSV lines into structured Menu Items
 * Returns { validItems, errors, totalRows }
 */
export function parseMenuCSV(csvText) {
  if (!csvText || typeof csvText !== 'string' || csvText.trim() === '') {
    return {
      validItems: [],
      errors: [{ rowNumber: 0, message: 'CSV content is empty' }],
      totalRows: 0
    };
  }

  const rawLines = parseCSVLines(csvText.trim());
  if (rawLines.length === 0) {
    return { validItems: [], errors: [{ rowNumber: 0, message: 'No rows found in CSV' }], totalRows: 0 };
  }

  // Header inspection
  const headers = rawLines[0].map(h => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
  const nameIdx = headers.findIndex(h => h === 'name' || h === 'itemname' || h === 'dish');
  const catIdx = headers.findIndex(h => h === 'category' || h === 'section');
  const priceIdx = headers.findIndex(h => h === 'price' || h === 'cost');
  const descIdx = headers.findIndex(h => h === 'description' || h === 'desc');
  const ingIdx = headers.findIndex(h => h === 'ingredients' || h === 'ingredient');
  const labelIdx = headers.findIndex(h => h === 'dietarylabels' || h === 'dietary' || h === 'labels');

  if (nameIdx === -1 || catIdx === -1 || priceIdx === -1) {
    return {
      validItems: [],
      errors: [{
        rowNumber: 1,
        message: 'Invalid CSV header format. Header must contain at least "name", "category", and "price" columns.'
      }],
      totalRows: rawLines.length - 1
    };
  }

  const validItems = [];
  const errors = [];

  for (let i = 1; i < rawLines.length; i++) {
    const row = rawLines[i];
    const rowNumber = i + 1; // 1-indexed

    const rawName = row[nameIdx] || '';
    const rawCategory = row[catIdx] || '';
    const rawPrice = row[priceIdx] !== undefined ? row[priceIdx] : '';
    const rawDescription = descIdx !== -1 ? (row[descIdx] || '') : '';
    const rawIngredients = ingIdx !== -1 ? (row[ingIdx] || '') : '';
    const rawLabels = labelIdx !== -1 ? (row[labelIdx] || '') : '';

    const validationResult = CSVRowSchema.safeParse({
      name: rawName,
      category: rawCategory,
      price: rawPrice,
      description: rawDescription,
      ingredients: rawIngredients,
      dietaryLabels: rawLabels
    });

    if (!validationResult.success) {
      const issueMsgs = validationResult.error.issues.map(iss => `${iss.path.join('.')}: ${iss.message}`).join(', ');
      errors.push({
        rowNumber,
        rowData: row,
        message: `Row ${rowNumber} rejected: ${issueMsgs}`
      });
      continue;
    }

    const { name, category, price, description, ingredients, dietaryLabels } = validationResult.data;

    // Parse ingredients (split by semicolon or pipe or comma)
    const parsedIngredients = ingredients
      ? ingredients.split(/[;|]/).map(s => s.trim()).filter(Boolean)
      : [];

    // Parse dietary labels
    const parsedLabels = dietaryLabels
      ? dietaryLabels.split(/[;,|]/).map(s => s.trim()).filter(Boolean)
      : [];

    validItems.push({
      id: `imported-${i}`,
      name,
      category,
      price: Number(price),
      description,
      ingredients: parsedIngredients.length > 0 ? parsedIngredients : (ingredients ? [ingredients] : []),
      dietaryLabels: parsedLabels,
      sizeVariants: []
    });
  }

  return {
    validItems,
    errors,
    totalRows: rawLines.length - 1,
    validCount: validItems.length,
    errorCount: errors.length
  };
}
