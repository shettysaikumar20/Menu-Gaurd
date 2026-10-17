import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { MenuItemModel } from '../models/MenuItem.js';
import { AuditModel } from '../models/Audit.js';
import { DEMO_RESTAURANT, DEMO_MENU_ITEMS } from '../shared/demoMenu.js';
import { FINDING_STATUS, SEVERITIES } from '../shared/constants.js';

class StorageService {
  constructor() {
    this.isMongoConnected = false;
    this.restaurantInfo = { ...DEMO_RESTAURANT };
    
    // In-memory store initialized with deep clones of the demo items
    this.inMemoryMenuItems = DEMO_MENU_ITEMS.map(item => ({ ...item }));
    this.inMemoryAudits = [];
  }

  async init(mongoUri) {
    if (mongoUri && mongoUri.trim() !== '') {
      try {
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 2000
        });
        this.isMongoConnected = true;
        console.log('[StorageService] Connected successfully to MongoDB.');
        
        // Seed initial items if database is empty
        const count = await MenuItemModel.countDocuments();
        if (count === 0) {
          console.log('[StorageService] Seeding initial demo menu items into MongoDB...');
          await MenuItemModel.insertMany(DEMO_MENU_ITEMS.map(item => {
            const { id, ...rest } = item;
            return rest;
          }));
        }
      } catch (err) {
        this.isMongoConnected = false;
        console.warn(`[StorageService] MongoDB connection failed (${err.message}). Using In-Memory Storage Demo Mode.`);
      }
    } else {
      this.isMongoConnected = false;
      console.log('[StorageService] No MONGODB_URI provided. Running in high-performance In-Memory Storage Demo Mode.');
    }
  }

  getStorageStatus() {
    return {
      mode: this.isMongoConnected ? 'mongodb' : 'in-memory',
      connected: this.isMongoConnected,
      label: this.isMongoConnected ? 'MongoDB (Connected)' : 'In-Memory Demo Mode (MongoDB Disconnected / Offline)'
    };
  }

  getRestaurantInfo() {
    return { ...this.restaurantInfo };
  }

  updateRestaurantInfo(info) {
    this.restaurantInfo = {
      ...this.restaurantInfo,
      ...info
    };
    return this.getRestaurantInfo();
  }

  // --- Menu Item Operations ---

  async getMenuItems() {
    if (this.isMongoConnected) {
      const items = await MenuItemModel.find().lean();
      return items.map(it => ({
        ...it,
        id: it._id.toString()
      }));
    }
    return this.inMemoryMenuItems.map(it => ({ ...it }));
  }

  async getMenuItemById(id) {
    if (this.isMongoConnected) {
      const it = await MenuItemModel.findById(id).lean();
      if (!it) return null;
      return { ...it, id: it._id.toString() };
    }
    const it = this.inMemoryMenuItems.find(i => i.id === id);
    return it ? { ...it } : null;
  }

  async createMenuItem(data) {
    const newItemData = {
      name: data.name,
      category: data.category,
      price: data.price !== undefined && data.price !== null && data.price !== '' ? Number(data.price) : null,
      description: data.description || '',
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      dietaryLabels: Array.isArray(data.dietaryLabels) ? data.dietaryLabels : [],
      sizeVariants: Array.isArray(data.sizeVariants) ? data.sizeVariants : []
    };

    if (this.isMongoConnected) {
      const created = await MenuItemModel.create(newItemData);
      return {
        ...created.toJSON(),
        id: created._id.toString()
      };
    }

    const created = {
      ...newItemData,
      id: data.id || `item-${uuidv4()}`
    };
    this.inMemoryMenuItems.push(created);
    return { ...created };
  }

  async updateMenuItem(id, data) {
    const updateData = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.price !== undefined && { price: data.price === null || data.price === '' ? null : Number(data.price) }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.ingredients !== undefined && { ingredients: Array.isArray(data.ingredients) ? data.ingredients : [] }),
      ...(data.dietaryLabels !== undefined && { dietaryLabels: Array.isArray(data.dietaryLabels) ? data.dietaryLabels : [] }),
      ...(data.sizeVariants !== undefined && { sizeVariants: Array.isArray(data.sizeVariants) ? data.sizeVariants : [] })
    };

    if (this.isMongoConnected) {
      const updated = await MenuItemModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!updated) return null;
      return { ...updated, id: updated._id.toString() };
    }

    const index = this.inMemoryMenuItems.findIndex(i => i.id === id);
    if (index === -1) return null;

    this.inMemoryMenuItems[index] = {
      ...this.inMemoryMenuItems[index],
      ...updateData
    };
    return { ...this.inMemoryMenuItems[index] };
  }

  async deleteMenuItem(id) {
    if (this.isMongoConnected) {
      const res = await MenuItemModel.findByIdAndDelete(id);
      return !!res;
    }
    const initLen = this.inMemoryMenuItems.length;
    this.inMemoryMenuItems = this.inMemoryMenuItems.filter(i => i.id !== id);
    return this.inMemoryMenuItems.length < initLen;
  }

  async resetToDemoMenu() {
    this.restaurantInfo = { ...DEMO_RESTAURANT };
    if (this.isMongoConnected) {
      await MenuItemModel.deleteMany({});
      const seeded = await MenuItemModel.insertMany(DEMO_MENU_ITEMS.map(item => {
        const { id, ...rest } = item;
        return rest;
      }));
      return seeded.map(it => ({ ...it.toJSON(), id: it._id.toString() }));
    }
    this.inMemoryMenuItems = DEMO_MENU_ITEMS.map(item => ({ ...item }));
    return this.inMemoryMenuItems.map(it => ({ ...it }));
  }

  async bulkReplaceMenuItems(items) {
    if (this.isMongoConnected) {
      await MenuItemModel.deleteMany({});
      const docs = items.map(item => {
        const { id, ...rest } = item;
        return rest;
      });
      const inserted = await MenuItemModel.insertMany(docs);
      return inserted.map(it => ({ ...it.toJSON(), id: it._id.toString() }));
    }
    this.inMemoryMenuItems = items.map(item => ({
      ...item,
      id: item.id || `item-${uuidv4()}`
    }));
    return this.inMemoryMenuItems.map(it => ({ ...it }));
  }

  // --- Audit Operations ---

  async getAudits() {
    if (this.isMongoConnected) {
      const audits = await AuditModel.find().sort({ createdAt: -1 }).lean();
      return audits;
    }
    return [...this.inMemoryAudits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getAuditById(id) {
    if (this.isMongoConnected) {
      const audit = await AuditModel.findOne({ id }).lean();
      return audit;
    }
    return this.inMemoryAudits.find(a => a.id === id) || null;
  }

  async createAudit(auditData) {
    const auditRecord = {
      ...auditData,
      id: auditData.id || `audit-${uuidv4()}`,
      timestamp: auditData.timestamp || new Date().toISOString()
    };

    if (this.isMongoConnected) {
      const created = await AuditModel.create(auditRecord);
      return created.toJSON();
    }

    this.inMemoryAudits.unshift({ ...auditRecord });
    return { ...auditRecord };
  }

  async updateFinding(auditId, findingId, updates) {
    if (this.isMongoConnected) {
      const audit = await AuditModel.findOne({ id: auditId });
      if (!audit) return null;

      const finding = audit.findings.find(f => f.id === findingId);
      if (!finding) return null;

      if (updates.status) finding.status = updates.status;
      if (updates.humanNotes !== undefined) finding.humanNotes = updates.humanNotes;
      if (updates.suggestedCorrection) finding.suggestedCorrection = updates.suggestedCorrection;
      if (updates.correctedItemSnapshot) finding.correctedItemSnapshot = updates.correctedItemSnapshot;

      // Recalculate stats
      audit.resolvedCount = audit.findings.filter(f => f.status === FINDING_STATUS.RESOLVED || f.status === FINDING_STATUS.APPROVED).length;
      audit.unresolvedCount = audit.findings.filter(f => f.status === FINDING_STATUS.PENDING).length;

      await audit.save();
      return audit.toJSON();
    }

    const audit = this.inMemoryAudits.find(a => a.id === auditId);
    if (!audit) return null;

    const finding = audit.findings.find(f => f.id === findingId);
    if (!finding) return null;

    if (updates.status) finding.status = updates.status;
    if (updates.humanNotes !== undefined) finding.humanNotes = updates.humanNotes;
    if (updates.suggestedCorrection) finding.suggestedCorrection = updates.suggestedCorrection;
    if (updates.correctedItemSnapshot) finding.correctedItemSnapshot = updates.correctedItemSnapshot;

    audit.resolvedCount = audit.findings.filter(f => f.status === FINDING_STATUS.RESOLVED || f.status === FINDING_STATUS.APPROVED).length;
    audit.unresolvedCount = audit.findings.filter(f => f.status === FINDING_STATUS.PENDING).length;

    return { ...audit };
  }

  /**
   * Applies approved corrections from an audit onto the actual menu items.
   * Never modifies items silently - only approved findings with snapshots are applied!
   */
  async applyApprovedCorrections(auditId) {
    const audit = await this.getAuditById(auditId);
    if (!audit) throw new Error('Audit report not found');

    const approvedFindings = audit.findings.filter(f => f.status === FINDING_STATUS.APPROVED && f.correctedItemSnapshot);
    const appliedItems = [];

    for (const finding of approvedFindings) {
      const itemId = finding.menuItemId;
      const patch = finding.correctedItemSnapshot;

      if (itemId && itemId !== 'unknown') {
        const updated = await this.updateMenuItem(itemId, patch);
        if (updated) {
          appliedItems.push(updated);
        }
      }
      // Mark finding as RESOLVED once applied
      await this.updateFinding(auditId, finding.id, { status: FINDING_STATUS.RESOLVED });
    }

    return {
      appliedCount: appliedItems.length,
      appliedItems
    };
  }
}

export const storageService = new StorageService();
