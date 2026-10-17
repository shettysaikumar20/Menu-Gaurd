import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { FINDING_STATUS } from '../shared/constants.js';

describe('MenuGuard AI API Endpoints', () => {
  beforeAll(() => {
    process.env.BACKBOARD_API_KEY = '';
  });

  it('GET /api/health returns healthy status and storage mode', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.storage).toBeDefined();
    expect(res.body.storage.mode).toBe('in-memory');
  });

  it('GET /api/menu returns initial seeded demo menu items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(20);
  });

  it('POST /api/audits runs Layer 1 + Layer 2 audit and creates an audit report', async () => {
    const res = await request(app).post('/api/audits');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.audit).toBeDefined();
    expect(res.body.audit.totalIssues).toBeGreaterThan(0);
    expect(res.body.audit.highPriorityCount).toBeGreaterThan(0);
    expect(res.body.audit.findings.length).toBe(res.body.audit.totalIssues);
  });

  it('PATCH /api/findings/:id allows approving and rejecting findings', async () => {
    // 1. Run audit to get findings
    const auditRes = await request(app).post('/api/audits');
    const auditId = auditRes.body.audit.id;
    const finding = auditRes.body.audit.findings[0];

    // 2. Approve the finding
    const approveRes = await request(app)
      .patch(`/api/findings/${finding.id}`)
      .send({
        auditId,
        status: FINDING_STATUS.APPROVED,
        humanNotes: 'Verified with head chef: removing conflicting claims.'
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);
    expect(approveRes.body.finding.status).toBe(FINDING_STATUS.APPROVED);
    expect(approveRes.body.finding.humanNotes).toBe('Verified with head chef: removing conflicting claims.');

    // 3. Reject another finding
    if (auditRes.body.audit.findings.length > 1) {
      const finding2 = auditRes.body.audit.findings[1];
      const rejectRes = await request(app)
        .patch(`/api/findings/${finding2.id}`)
        .send({
          auditId,
          status: FINDING_STATUS.REJECTED,
          humanNotes: 'Intended recipe configuration.'
        });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.finding.status).toBe(FINDING_STATUS.REJECTED);
    }
  });

  it('POST /api/audits/:id/apply applies approved corrections to menu items', async () => {
    const auditRes = await request(app).post('/api/audits');
    const audit = auditRes.body.audit;
    
    // Find a finding with a corrected snapshot
    const findingWithSnapshot = audit.findings.find(f => f.correctedItemSnapshot && f.menuItemId !== 'unknown');
    expect(findingWithSnapshot).toBeDefined();

    // Approve it
    await request(app)
      .patch(`/api/findings/${findingWithSnapshot.id}`)
      .send({
        auditId: audit.id,
        status: FINDING_STATUS.APPROVED
      });

    // Apply approved corrections
    const applyRes = await request(app).post(`/api/audits/${audit.id}/apply`);
    expect(applyRes.status).toBe(200);
    expect(applyRes.body.success).toBe(true);
    expect(applyRes.body.appliedCount).toBeGreaterThanOrEqual(1);
  });
});
