import mongoose from 'mongoose';

const SizeVariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, default: null },
  description: { type: String, default: '', trim: true },
  ingredients: { type: [String], default: [] },
  dietaryLabels: { type: [String], default: [] },
  sizeVariants: { type: [SizeVariantSchema], default: [] }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const MenuItemModel = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
