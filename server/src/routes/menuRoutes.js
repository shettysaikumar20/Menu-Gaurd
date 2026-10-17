import express from 'express';
import {
  getRestaurant,
  updateRestaurant,
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  importMenuCSV,
  resetToDemoMenu
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/restaurant', getRestaurant);
router.patch('/restaurant', updateRestaurant);
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.post('/import', importMenuCSV);
router.post('/reset-demo', resetToDemoMenu);

export default router;
