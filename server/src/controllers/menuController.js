import { storageService } from '../services/storageService.js';
import { parseMenuCSV } from '../utils/csvParser.js';
import { MenuItemSchema } from '../shared/schema.js';

export async function getRestaurant(req, res) {
  try {
    const restaurant = storageService.getRestaurantInfo();
    const storage = storageService.getStorageStatus();
    res.json({ success: true, restaurant, storage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateRestaurant(req, res) {
  try {
    const { name, menuName } = req.body;
    const updated = storageService.updateRestaurantInfo({ name, menuName });
    res.json({ success: true, restaurant: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMenuItems(req, res) {
  try {
    const items = await storageService.getMenuItems();
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMenuItem(req, res) {
  try {
    const { id } = req.params;
    const item = await storageService.getMenuItemById(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createMenuItem(req, res) {
  try {
    const validation = MenuItemSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        issues: validation.error.issues
      });
    }

    const created = await storageService.createMenuItem(validation.data);
    res.status(201).json({ success: true, item: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateMenuItem(req, res) {
  try {
    const { id } = req.params;
    const validation = MenuItemSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        issues: validation.error.issues
      });
    }

    const updated = await storageService.updateMenuItem(id, validation.data);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;
    const deleted = await storageService.deleteMenuItem(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Menu item not found or already deleted' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function importMenuCSV(req, res) {
  try {
    const { csvContent, mode = 'append' } = req.body; // 'append' or 'replace'
    if (!csvContent) {
      return res.status(400).json({ success: false, error: 'csvContent is required' });
    }

    const parsed = parseMenuCSV(csvContent);

    if (parsed.validItems.length === 0 && parsed.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid menu items could be parsed from the provided CSV file.',
        errors: parsed.errors
      });
    }

    let savedItems = [];
    if (mode === 'replace') {
      savedItems = await storageService.bulkReplaceMenuItems(parsed.validItems);
    } else {
      for (const item of parsed.validItems) {
        const created = await storageService.createMenuItem(item);
        savedItems.push(created);
      }
    }

    res.json({
      success: true,
      mode,
      importedCount: savedItems.length,
      invalidRowCount: parsed.errors.length,
      errors: parsed.errors,
      items: savedItems
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function resetToDemoMenu(req, res) {
  try {
    const items = await storageService.resetToDemoMenu();
    res.json({
      success: true,
      message: 'Menu restored to 24-item Artisan Hearth Cafe demonstration menu with intentional audit test cases.',
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
