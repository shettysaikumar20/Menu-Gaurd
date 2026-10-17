import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Upload, 
  RefreshCw, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Check, 
  X, 
  FileSpreadsheet, 
  Info,
  DollarSign,
  Tag
} from 'lucide-react';
import { MENU_CATEGORIES, COMMON_DIETARY_LABELS } from '../shared/constants.js';

export default function MenuManager({
  menuItems = [],
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onImportCSV,
  onResetDemo,
  isResetting
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importMode, setImportMode] = useState('append');
  const [importErrors, setImportErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mains',
    price: '',
    description: '',
    ingredients: '',
    dietaryLabels: []
  });

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q)) ||
        (Array.isArray(item.ingredients) && item.ingredients.some(i => i.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Mains',
      price: '',
      description: '',
      ingredients: '',
      dietaryLabels: []
    });
    setIsItemModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'Mains',
      price: item.price !== null && item.price !== undefined ? item.price : '',
      description: item.description || '',
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients || '',
      dietaryLabels: Array.isArray(item.dietaryLabels) ? [...item.dietaryLabels] : []
    });
    setIsItemModalOpen(true);
  };

  // Submit Create or Edit
  const handleSubmitItem = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: formData.price === '' ? null : Number(formData.price),
      description: formData.description.trim(),
      ingredients: formData.ingredients
        .split(',')
        .map(i => i.trim())
        .filter(Boolean),
      dietaryLabels: formData.dietaryLabels
    };

    if (editingItem) {
      await onUpdateItem(editingItem.id, payload);
    } else {
      await onCreateItem(payload);
    }
    setIsItemModalOpen(false);
  };

  // Toggle dietary label selection
  const handleToggleLabel = (label) => {
    setFormData(prev => {
      const exists = prev.dietaryLabels.includes(label);
      return {
        ...prev,
        dietaryLabels: exists 
          ? prev.dietaryLabels.filter(l => l !== label) 
          : [...prev.dietaryLabels, label]
      };
    });
  };

  // Handle CSV Import Submit
  const handleCSVSubmit = async () => {
    if (!csvText.trim()) return;
    setIsImporting(true);
    setImportErrors([]);
    try {
      const res = await onImportCSV(csvText, importMode);
      if (res && res.errors && res.errors.length > 0) {
        setImportErrors(res.errors);
      } else {
        setIsImportModalOpen(false);
        setCsvText('');
      }
    } catch (err) {
      setImportErrors([{ rowNumber: 0, message: err.message }]);
    } finally {
      setIsImporting(false);
    }
  };

  // Sample CSV template generator
  const loadSampleCSV = () => {
    const sample = `name,category,price,description,ingredients,dietaryLabels
Avocado Toast,Breakfast & Brunch,11.50,Toasted sourdough with crushed avocado and radish,sourdough bread; avocado; radish; olive oil,Vegan; Vegetarian
House Drip Coffee,Beverages,3.50,Freshly brewed fair-trade roast,coffee beans; water,Vegan; Gluten-Free
Brioche French Toast,Breakfast & Brunch,14.00,Classic brioche dipped in spiced custard,brioche; whole milk; eggs; butter; maple syrup,Vegetarian
Wild Atlantic Salmon,Mains,26.00,Oven-roasted fresh salmon with asparagus,salmon; olive oil; asparagus; lemon,Gluten-Free`;
    setCsvText(sample);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-900">Menu Catalog</h1>
          <p className="text-xs text-charcoal-500">
            Manage restaurant dishes, portion pricing, ingredient specifications, and dietary claims.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-cream-300 bg-white hover:bg-cream-200 text-charcoal-700 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-charcoal-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-cream-300 bg-white hover:bg-cream-200 text-charcoal-700 transition-colors shadow-2xs disabled:opacity-50"
            title="Reload fictional cafe test menu with intentional audit cases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Load Demo Menu</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sage-700 hover:bg-sage-800 text-cream-50 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-cream-300 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item name, description, or ingredient..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-sage-500 focus:bg-white text-charcoal-900 placeholder:text-charcoal-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-sage-700 text-cream-50'
                  : 'bg-cream-100 hover:bg-cream-200 text-charcoal-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white border border-cream-300 rounded-xl overflow-hidden shadow-xs">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-charcoal-400 mx-auto stroke-1" />
            <h3 className="text-sm font-semibold text-charcoal-800">No Menu Items Found</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search query or category filters.'
                : 'Click "Add Menu Item" or "Import CSV" to populate your menu.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 text-charcoal-600 font-medium border-b border-cream-200">
                <tr>
                  <th className="px-5 py-3.5">Item Name & Section</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Supplied Ingredients</th>
                  <th className="px-5 py-3.5">Dietary Badges</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filteredItems.map((item) => {
                  const hasPrice = item.price !== null && item.price !== undefined;
                  const hasSizeVariants = Array.isArray(item.sizeVariants) && item.sizeVariants.length > 0;

                  return (
                    <tr key={item.id} className="hover:bg-cream-50 transition-colors">
                      {/* Name & Category */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-semibold text-charcoal-900 text-sm">
                          {item.name || <span className="text-red-600 italic">Unnamed Item</span>}
                        </div>
                        <div className="inline-block mt-1 text-[11px] font-medium text-charcoal-500 bg-cream-200 px-2 py-0.5 rounded">
                          {item.category || 'Uncategorized'}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        {hasPrice ? (
                          <span className="font-semibold text-charcoal-900 text-sm">
                            ${Number(item.price).toFixed(2)}
                          </span>
                        ) : hasSizeVariants ? (
                          <div className="space-y-0.5">
                            {item.sizeVariants.map((v, idx) => (
                              <div key={idx} className="text-[11px] text-charcoal-600">
                                <span className="text-charcoal-500">{v.size}:</span> ${Number(v.price).toFixed(2)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-xs bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <AlertCircle className="w-3 h-3" />
                            Missing Price
                          </span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 align-top max-w-xs">
                        {item.description ? (
                          <p className="text-charcoal-700 leading-relaxed text-xs line-clamp-3">
                            {item.description}
                          </p>
                        ) : (
                          <span className="text-amber-700 italic text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            No description provided
                          </span>
                        )}
                      </td>

                      {/* Ingredients */}
                      <td className="px-5 py-4 align-top max-w-xs">
                        {Array.isArray(item.ingredients) && item.ingredients.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.ingredients.map((ing, i) => (
                              <span 
                                key={i} 
                                className="inline-block bg-cream-100 text-charcoal-600 text-[11px] px-1.5 py-0.5 rounded border border-cream-300"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-charcoal-400 italic text-[11px]">None specified</span>
                        )}
                      </td>

                      {/* Dietary Labels */}
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        {Array.isArray(item.dietaryLabels) && item.dietaryLabels.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.dietaryLabels.map((lbl, i) => (
                              <span 
                                key={i} 
                                className="inline-block bg-sage-50 text-sage-800 border border-sage-200 text-[10px] font-medium px-2 py-0.5 rounded-full"
                              >
                                {lbl}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-charcoal-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-charcoal-500 hover:text-charcoal-900 hover:bg-cream-200 rounded-md transition-colors"
                            title="Edit menu item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete menu item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item Create / Edit Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-cream-300 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-cream-200 flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-charcoal-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Truffle Wild Mushroom Risotto"
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-sage-500 focus:bg-white text-charcoal-900"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-sage-500 focus:bg-white text-charcoal-900"
                  >
                    {MENU_CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 18.50"
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-sage-500 focus:bg-white text-charcoal-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Menu Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed preparation and taste profile presented to guests..."
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-sage-500 focus:bg-white text-charcoal-900 leading-relaxed"
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Kitchen Ingredients (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="e.g., carnaroli rice, chanterelles, porcini broth, butter, parmesan"
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-sage-500 focus:bg-white text-charcoal-900"
                />
                <p className="text-[10px] text-charcoal-500 mt-1">
                  Audit engine compares these specifications against descriptions and dietary claims.
                </p>
              </div>

              {/* Dietary Labels */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-2">
                  Dietary Badges & Claims
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_DIETARY_LABELS.map(label => {
                    const active = formData.dietaryLabels.includes(label);
                    return (
                      <button
                        type="button"
                        key={label}
                        onClick={() => handleToggleLabel(label)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-sage-700 text-cream-50 border-sage-700'
                            : 'bg-cream-100 text-charcoal-600 border-cream-300 hover:bg-cream-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium border border-cream-300 bg-white hover:bg-cream-200 text-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-sage-700 hover:bg-sage-800 text-cream-50 shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal with Error Reporting */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-cream-300 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sage-700" />
                <h2 className="font-serif font-bold text-lg text-charcoal-900">Import Menu via CSV</h2>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportErrors([]);
                }}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-charcoal-600">
                  Required Columns: <code className="bg-cream-200 px-1.5 py-0.5 rounded text-charcoal-800 font-mono text-[11px]">name,category,price,description,ingredients,dietaryLabels</code>
                </p>
                <button
                  onClick={loadSampleCSV}
                  className="text-xs text-sage-700 hover:underline font-medium"
                >
                  Load Sample Template
                </button>
              </div>

              {/* Paste Text Area */}
              <div>
                <textarea
                  rows="8"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`name,category,price,description,ingredients,dietaryLabels\nArtisan Sourdough,Bakery,8.50,Crisp hearth-baked loaf,wheat flour; water; starter; salt,Vegan\n...`}
                  className="w-full px-3 py-2 text-xs font-mono bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-sage-500 focus:bg-white text-charcoal-900"
                />
              </div>

              {/* Import Mode Selection */}
              <div className="flex items-center gap-4 text-xs">
                <span className="font-semibold text-charcoal-700">Import Mode:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-sage-700 focus:ring-sage-600"
                  />
                  <span>Append to existing items</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-sage-700 focus:ring-sage-600"
                  />
                  <span>Replace entire menu catalog</span>
                </label>
              </div>

              {/* Granular Error Reporting for Malformed Rows */}
              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-red-900 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>CSV Validation Warnings ({importErrors.length} rejected row{importErrors.length > 1 ? 's' : ''}):</span>
                  </div>
                  <ul className="text-[11px] text-red-800 space-y-1 max-h-32 overflow-y-auto pl-5 list-disc">
                    {importErrors.map((err, idx) => (
                      <li key={idx}>
                        <span className="font-medium">Row {err.rowNumber}:</span> {err.message}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-red-700 italic">
                    Valid rows were accepted; only malformed rows above were skipped to prevent data corruption.
                  </p>
                </div>
              )}

              {/* Import Actions */}
              <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportErrors([]);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-medium border border-cream-300 bg-white hover:bg-cream-200 text-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCSVSubmit}
                  disabled={!csvText.trim() || isImporting}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-sage-700 hover:bg-sage-800 text-cream-50 shadow-xs disabled:opacity-50"
                >
                  {isImporting ? 'Validating & Importing...' : 'Import Menu CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
