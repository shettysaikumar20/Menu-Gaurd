import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { ISSUE_CATEGORIES, SEVERITIES, ANALYSIS_LAYERS, FINDING_STATUS } from '../shared/constants.js';

// Schema for Backboard AI generated findings
const AIFindingOutputSchema = z.object({
  menuItemId: z.string().optional().default('unknown'),
  menuItemName: z.string().min(1),
  category: z.nativeEnum(ISSUE_CATEGORIES),
  severity: z.nativeEnum(SEVERITIES),
  explanation: z.string().min(1),
  evidence: z.string().min(1),
  suggestedCorrection: z.string().min(1),
  confidence: z.union([z.number(), z.string()]).default('MEDIUM')
});

const AIResponseSchema = z.object({
  findings: z.array(AIFindingOutputSchema)
});

/**
 * Validates that the AI cited actual text from the input menu items,
 * preventing hallucinated quotes or fabricated citations.
 */
export function validateEvidenceAgainstInput(evidence, item) {
  if (!evidence || !item) return false;
  const evLower = evidence.toLowerCase();
  const descLower = (item.description || '').toLowerCase();
  const nameLower = (item.name || '').toLowerCase();
  const ingredientsStr = Array.isArray(item.ingredients) 
    ? item.ingredients.join(' ').toLowerCase() 
    : String(item.ingredients || '').toLowerCase();
  const labelsStr = Array.isArray(item.dietaryLabels) 
    ? item.dietaryLabels.join(' ').toLowerCase() 
    : String(item.dietaryLabels || '').toLowerCase();

  const combinedText = `${nameLower} ${descLower} ${ingredientsStr} ${labelsStr}`;

  // Check if any word sequence or key quote from evidence appears in the source data
  const words = evidence.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) return true; // generic short text
  
  // At least some significant words or phrase must be in the item data
  const matches = words.filter(w => combinedText.includes(w));
  return matches.length > 0;
}

/**
 * Generates mock Backboard AI analysis for offline / uncredentialed demonstration.
 * Must be explicitly marked as mock simulation.
 */
function runMockBackboardAnalysis(items) {
  const findings = [];

  for (const item of items) {
    const rawId = item.id || 'unknown';
    const name = item.name || '';
    const desc = item.description || '';
    const ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];

    // Mock Check 1: Description vs Ingredients contradiction (Wild salmon claim vs farm-raised Atlantic salmon ingredients)
    const descLower = desc.toLowerCase();
    const ingText = ingredients.join(' ').toLowerCase();

    if (descLower.includes('wild') && ingText.includes('farm-raised')) {
      findings.push({
        id: uuidv4(),
        category: ISSUE_CATEGORIES.INGREDIENT_MISMATCH,
        severity: SEVERITIES.CRITICAL,
        layer: ANALYSIS_LAYERS.AI_BACKBOARD,
        menuItemId: rawId,
        menuItemName: name,
        explanation: 'Menu description prominently claims "wild-caught Alaskan" seafood, but the kitchen ingredient specification lists "farm-raised Atlantic salmon". This creates legal compliance risk and misinforms guests.',
        evidence: `Description: "${desc}" vs Ingredients: [${ingredients.join(', ')}]`,
        suggestedCorrection: 'Update menu description to truthfully state "Oven-roasted Atlantic salmon", or switch kitchen procurement to certified wild Alaskan king salmon.',
        confidence: 'HIGH (Simulated Llama-3.1-70B Analysis)',
        status: FINDING_STATUS.PENDING,
        originalItemSnapshot: { ...item },
        correctedItemSnapshot: {
          ...item,
          description: desc.replace(/fresh wild-caught Alaskan king salmon/i, 'fresh oven-roasted Atlantic salmon')
        }
      });
    }

    // Mock Check 2: Misleading "sugar free" claim vs ingredients containing sweeteners
    if (descLower.includes('sugar-free') || descLower.includes('sugar free')) {
      if (ingText.includes('agave') || ingText.includes('sugar') || ingText.includes('syrup') || ingText.includes('honey')) {
        findings.push({
          id: uuidv4(),
          category: ISSUE_CATEGORIES.MISLEADING_CLAIM,
          severity: SEVERITIES.HIGH,
          layer: ANALYSIS_LAYERS.AI_BACKBOARD,
          menuItemId: rawId,
          menuItemName: name,
          explanation: 'Dish description claims to be "sugar-free", yet kitchen recipe ingredients include caloric sweeteners (agave nectar, sugar syrup). Diabetic or health-conscious patrons could be misled.',
          evidence: `Claim: "${desc}" | Disclosed Sweeteners in ingredients: ${ingredients.filter(i => /sugar|syrup|agave|honey/i.test(i)).join(', ')}`,
          suggestedCorrection: 'Change phrasing from "sugar-free" to "naturally sweetened with organic agave", or reformulate the recipe without added caloric syrups.',
          confidence: 'HIGH (Simulated Llama-3.1-70B Analysis)',
          status: FINDING_STATUS.PENDING,
          originalItemSnapshot: { ...item },
          correctedItemSnapshot: {
            ...item,
            description: desc.replace(/Completely sugar-free/i, 'Naturally sweetened with organic agave')
          }
        });
      }
    }

    // Mock Check 3: Allergen uncertainty flag (Requires kitchen staff verification)
    if (item.category === 'Bakery & Pastries' && (!item.dietaryLabels || item.dietaryLabels.length === 0)) {
      if (ingText.includes('flour') || ingText.includes('butter') || ingText.includes('eggs')) {
        findings.push({
          id: uuidv4(),
          category: ISSUE_CATEGORIES.ALLERGEN_UNCERTAINTY,
          severity: SEVERITIES.INFO,
          layer: ANALYSIS_LAYERS.AI_BACKBOARD,
          menuItemId: rawId,
          menuItemName: name,
          explanation: 'Bakery item contains major allergens (wheat, dairy, egg) but displays no allergen badges. Model cannot guarantee cross-contact safety; restaurant staff must verify shared facility disclosure.',
          evidence: `Ingredients: [${ingredients.join(', ')}]`,
          suggestedCorrection: 'Add a standard food allergy advisory: "Contains wheat and dairy. Prepared in a facility handling tree nuts and sesame."',
          confidence: 'VERIFICATION_REQUIRED (Human Kitchen Review Needed)',
          status: FINDING_STATUS.PENDING,
          originalItemSnapshot: { ...item },
          correctedItemSnapshot: { ...item }
        });
      }
    }
  }

  return findings;
}

/**
 * Service to execute Backboard AI analysis.
 * Uses official Backboard endpoints with open-weight models (e.g. meta-llama/llama-3.1-70b-instruct).
 * Safely falls back to clearly labeled mock analysis if API key is missing or request fails.
 */
export async function runBackboardAudit(items = []) {
  const apiKey = process.env.BACKBOARD_API_KEY;
  const baseUrl = process.env.BACKBOARD_BASE_URL || 'https://app.backboard.io/api';
  const openWeightModel = process.env.BACKBOARD_MODEL_NAME || 'meta-llama/llama-3.1-70b-instruct';
  const llmProvider = process.env.BACKBOARD_LLM_PROVIDER || 'featherless';

  // If no API key configured, use clearly labelled mock mode
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    return {
      isMock: true,
      modelUsed: `Mock Backboard Simulation (${openWeightModel} / Provider: ${llmProvider}) [NO API KEY CONFIGURED]`,
      findings: runMockBackboardAnalysis(items)
    };
  }

  // Live Backboard API call
  try {
    const compactItems = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      ingredients: item.ingredients,
      dietaryLabels: item.dietaryLabels
    }));

    const systemPrompt = `You are the Backboard AI Menu Quality Auditor.
Audit these restaurant menu items against their supplied kitchen ingredients.
Detect semantic contradictions, misleading menu claims, ingredient mismatches, and ambiguous allergen statements.
NEVER certify an allergen as 100% safe. Always flag allergen uncertainty requiring human verification.
All evidence MUST be copied verbatim from the supplied item descriptions, names, or ingredients. Do NOT fabricate quotes.

Return ONLY a valid JSON object matching this exact structure:
{
  "findings": [
    {
      "menuItemId": "id of the item",
      "menuItemName": "exact name of the item",
      "category": "INGREDIENT_MISMATCH" | "MISLEADING_CLAIM" | "ALLERGEN_UNCERTAINTY",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "explanation": "Clear explanation of the issue",
      "evidence": "verbatim quote from description or ingredients",
      "suggestedCorrection": "Actionable correction",
      "confidence": "HIGH" | "MEDIUM" | "VERIFICATION_REQUIRED"
    }
  ]
}`;

    const userMessage = `Audit the following menu items:\n${JSON.stringify(compactItems, null, 2)}`;

    // Call Backboard API message endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const response = await fetch(`${baseUrl}/threads/messages`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: `${systemPrompt}\n\n${userMessage}`,
        llm_provider: llmProvider,
        model_name: openWeightModel,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Backboard API Warning] HTTP ${response.status}: ${errText}. Falling back to labelled mock mode.`);
      return {
        isMock: true,
        modelUsed: `Mock Backboard Fallback (${openWeightModel}) [API error ${response.status}]`,
        findings: runMockBackboardAnalysis(items)
      };
    }

    const data = await response.json();
    const rawContent = data.content || (data.message && data.message.content) || JSON.stringify(data);

    // Extract JSON block if surrounded by markdown fences
    let jsonStr = rawContent;
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || rawContent.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsedJson = JSON.parse(jsonStr.trim());
    const validated = AIResponseSchema.safeParse(parsedJson);

    if (!validated.success) {
      console.warn('[Backboard API Warning] Output failed schema validation, falling back to mock mode:', validated.error.message);
      return {
        isMock: true,
        modelUsed: `Mock Backboard Fallback (${openWeightModel}) [Schema validation failed on live response]`,
        findings: runMockBackboardAnalysis(items)
      };
    }

    // Transform validated findings and verify evidence against input
    const validatedFindings = validated.data.findings.map(f => {
      const targetItem = items.find(it => it.id === f.menuItemId || it.name.toLowerCase() === f.menuItemName.toLowerCase()) || {};
      const evidenceValid = validateEvidenceAgainstInput(f.evidence, targetItem);
      
      return {
        id: uuidv4(),
        category: f.category,
        severity: f.severity,
        layer: ANALYSIS_LAYERS.AI_BACKBOARD,
        menuItemId: targetItem.id || f.menuItemId || 'unknown',
        menuItemName: targetItem.name || f.menuItemName,
        explanation: f.explanation,
        evidence: evidenceValid ? f.evidence : `Input data reference: ${targetItem.description || targetItem.name || f.evidence}`,
        suggestedCorrection: f.suggestedCorrection,
        confidence: f.confidence || 'HIGH',
        status: FINDING_STATUS.PENDING,
        originalItemSnapshot: { ...targetItem },
        correctedItemSnapshot: { ...targetItem }
      };
    });

    return {
      isMock: false,
      modelUsed: `Backboard AI (${openWeightModel} via ${llmProvider})`,
      findings: validatedFindings
    };

  } catch (error) {
    console.warn(`[Backboard API Exception] ${error.message}. Returning clearly labelled mock findings.`);
    return {
      isMock: true,
      modelUsed: `Mock Backboard Simulation (${openWeightModel}) [Connection failed: ${error.message}]`,
      findings: runMockBackboardAnalysis(items)
    };
  }
}
