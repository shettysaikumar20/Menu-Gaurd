import { storageService } from '../services/storageService.js';
import { runDeterministicAudit } from '../services/deterministicAuditor.js';
import { runBackboardAudit } from '../services/backboardService.js';
import { SEVERITIES, FINDING_STATUS } from '../shared/constants.js';

export async function runAudit(req, res) {
  try {
    const restaurant = storageService.getRestaurantInfo();
    const items = await storageService.getMenuItems();

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot audit an empty menu. Please add or import menu items first.'
      });
    }

    // Layer 1: Deterministic JavaScript checks
    const deterministicFindings = runDeterministicAudit(items);

    // Layer 2: Backboard AI language analysis
    const aiResult = await runBackboardAudit(items);

    // Combine both layers while keeping them clearly tagged
    const combinedFindings = [
      ...deterministicFindings,
      ...aiResult.findings
    ];

    const highPriorityCount = combinedFindings.filter(
      f => f.severity === SEVERITIES.CRITICAL || f.severity === SEVERITIES.HIGH
    ).length;

    const resolvedCount = combinedFindings.filter(
      f => f.status === FINDING_STATUS.RESOLVED || f.status === FINDING_STATUS.APPROVED
    ).length;

    const unresolvedCount = combinedFindings.filter(
      f => f.status === FINDING_STATUS.PENDING
    ).length;

    const auditData = {
      restaurantName: restaurant.name || 'Artisan Hearth Cafe & Bakery',
      menuName: restaurant.menuName || 'Active Menu',
      timestamp: new Date().toISOString(),
      totalItems: items.length,
      totalIssues: combinedFindings.length,
      highPriorityCount,
      resolvedCount,
      unresolvedCount,
      isMock: aiResult.isMock,
      engineModel: aiResult.modelUsed,
      findings: combinedFindings
    };

    const savedAudit = await storageService.createAudit(auditData);

    res.status(201).json({
      success: true,
      audit: savedAudit
    });
  } catch (error) {
    console.error('[runAudit Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAudits(req, res) {
  try {
    const audits = await storageService.getAudits();
    res.json({ success: true, count: audits.length, audits });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAudit(req, res) {
  try {
    const { id } = req.params;
    const audit = await storageService.getAuditById(id);
    if (!audit) {
      return res.status(404).json({ success: false, error: 'Audit not found' });
    }
    res.json({ success: true, audit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateFinding(req, res) {
  try {
    const { id: findingId } = req.params;
    const { auditId, status, humanNotes, suggestedCorrection, correctedItemSnapshot } = req.body;

    if (!auditId) {
      return res.status(400).json({ success: false, error: 'auditId is required in request body' });
    }

    const updatedAudit = await storageService.updateFinding(auditId, findingId, {
      status,
      humanNotes,
      suggestedCorrection,
      correctedItemSnapshot
    });

    if (!updatedAudit) {
      return res.status(404).json({ success: false, error: 'Audit or Finding not found' });
    }

    const updatedFinding = updatedAudit.findings.find(f => f.id === findingId);
    res.json({
      success: true,
      finding: updatedFinding,
      auditSummary: {
        totalIssues: updatedAudit.totalIssues,
        resolvedCount: updatedAudit.resolvedCount,
        unresolvedCount: updatedAudit.unresolvedCount,
        highPriorityCount: updatedAudit.highPriorityCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function applyApprovedCorrections(req, res) {
  try {
    const { id: auditId } = req.params;
    const result = await storageService.applyApprovedCorrections(auditId);
    res.json({
      success: true,
      message: `Successfully applied ${result.appliedCount} approved corrections to the menu.`,
      appliedCount: result.appliedCount,
      appliedItems: result.appliedItems
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
