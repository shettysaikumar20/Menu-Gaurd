import express from 'express';
import {
  runAudit,
  getAudits,
  getAudit,
  updateFinding,
  applyApprovedCorrections
} from '../controllers/auditController.js';

const router = express.Router();

router.post('/', runAudit);
router.get('/', getAudits);
router.get('/:id', getAudit);
router.patch('/findings/:id', updateFinding);
router.post('/:id/apply', applyApprovedCorrections);

export default router;
