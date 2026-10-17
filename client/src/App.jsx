import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Toast from './components/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MenuManager from './pages/MenuManager.jsx';
import FindingsReview from './pages/FindingsReview.jsx';
import MenuExport from './pages/MenuExport.jsx';
import { api } from './services/api.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [restaurant, setRestaurant] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [auditHistory, setAuditHistory] = useState([]);
  const [activeAudit, setActiveAudit] = useState(null);
  
  // Loading flags
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [restRes, itemsRes, auditsRes] = await Promise.all([
        api.getRestaurant().catch(() => ({ restaurant: null, storage: null })),
        api.getMenuItems().catch(() => ({ items: [] })),
        api.getAudits().catch(() => ({ audits: [] }))
      ]);

      if (restRes?.restaurant) setRestaurant(restRes.restaurant);
      if (restRes?.storage) setStorageStatus(restRes.storage);
      if (itemsRes?.items) setMenuItems(itemsRes.items);
      
      const audits = auditsRes?.audits || [];
      setAuditHistory(audits);
      if (audits.length > 0) {
        setActiveAudit(audits[0]);
      }
    } catch (err) {
      addToast({
        title: 'Connection Notice',
        message: 'Could not connect to backend server. Running in local state.',
        type: 'warning'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Run Menu Audit
  const handleRunAudit = async () => {
    try {
      setIsAuditing(true);
      const res = await api.runAudit();
      if (res.success && res.audit) {
        setActiveAudit(res.audit);
        setAuditHistory(prev => [res.audit, ...prev]);
        addToast({
          title: 'Audit Complete',
          message: `Identified ${res.audit.totalIssues} issue${res.audit.totalIssues === 1 ? '' : 's'} (${res.audit.highPriorityCount} high priority).`,
          type: 'success'
        });
      }
    } catch (err) {
      addToast({
        title: 'Audit Failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // Reset to Demo Menu
  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      const res = await api.resetDemoMenu();
      if (res.success && res.items) {
        setMenuItems(res.items);
        addToast({
          title: 'Demo Menu Restored',
          message: 'Loaded 24-item Artisan Hearth Cafe menu with intentional audit cases.',
          type: 'success'
        });
        // Automatically trigger fresh audit on the demo items
        const auditRes = await api.runAudit();
        if (auditRes.success && auditRes.audit) {
          setActiveAudit(auditRes.audit);
          setAuditHistory(prev => [auditRes.audit, ...prev]);
        }
      }
    } catch (err) {
      addToast({
        title: 'Reset Failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Menu Items CRUD
  const handleCreateItem = async (itemData) => {
    try {
      const res = await api.createMenuItem(itemData);
      if (res.success && res.item) {
        setMenuItems(prev => [...prev, res.item]);
        addToast({ title: 'Item Created', message: `Added "${res.item.name}" to menu.`, type: 'success' });
      }
    } catch (err) {
      addToast({ title: 'Create Failed', message: err.message, type: 'error' });
    }
  };

  const handleUpdateItem = async (id, itemData) => {
    try {
      const res = await api.updateMenuItem(id, itemData);
      if (res.success && res.item) {
        setMenuItems(prev => prev.map(i => i.id === id ? res.item : i));
        addToast({ title: 'Item Updated', message: `Updated "${res.item.name}".`, type: 'success' });
      }
    } catch (err) {
      addToast({ title: 'Update Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await api.deleteMenuItem(id);
      if (res.success) {
        setMenuItems(prev => prev.filter(i => i.id !== id));
        addToast({ title: 'Item Deleted', message: 'Menu item removed.', type: 'info' });
      }
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  const handleImportCSV = async (csvText, mode) => {
    const res = await api.importCSV(csvText, mode);
    if (res.success) {
      const itemsRes = await api.getMenuItems();
      if (itemsRes?.items) setMenuItems(itemsRes.items);
      addToast({
        title: 'Import Completed',
        message: `Imported ${res.importedCount} items (${res.invalidRowCount} invalid rows rejected).`,
        type: res.invalidRowCount > 0 ? 'warning' : 'success'
      });
    }
    return res;
  };

  // Update Finding Review Status (Approve / Reject / Notes)
  const handleUpdateFindingStatus = async (findingId, updates) => {
    if (!activeAudit) return;
    try {
      const res = await api.updateFinding(findingId, {
        auditId: activeAudit.id,
        ...updates
      });
      if (res.success && res.finding) {
        setActiveAudit(prev => {
          if (!prev) return prev;
          const updatedFindings = prev.findings.map(f => f.id === findingId ? res.finding : f);
          return {
            ...prev,
            ...res.auditSummary,
            findings: updatedFindings
          };
        });
        setAuditHistory(prev => prev.map(a => a.id === activeAudit.id ? { ...a, ...res.auditSummary } : a));
        addToast({
          title: 'Review Updated',
          message: `Finding marked as ${res.finding.status}.`,
          type: 'success'
        });
      }
    } catch (err) {
      addToast({ title: 'Action Failed', message: err.message, type: 'error' });
    }
  };

  // Apply Approved Corrections to Menu
  const handleApplyApprovedCorrections = async () => {
    if (!activeAudit) return;
    try {
      setIsApplying(true);
      const res = await api.applyApprovedCorrections(activeAudit.id);
      if (res.success) {
        addToast({
          title: 'Corrections Committed',
          message: res.message,
          type: 'success'
        });
        // Refresh items and audit report
        const [itemsRes, auditRes] = await Promise.all([
          api.getMenuItems(),
          api.getAuditById(activeAudit.id)
        ]);
        if (itemsRes?.items) setMenuItems(itemsRes.items);
        if (auditRes?.audit) setActiveAudit(auditRes.audit);
      }
    } catch (err) {
      addToast({ title: 'Application Failed', message: err.message, type: 'error' });
    } finally {
      setIsApplying(false);
    }
  };

  // Select an audit from history
  const handleSelectAudit = async (auditId) => {
    try {
      const res = await api.getAuditById(auditId);
      if (res.success && res.audit) {
        setActiveAudit(res.audit);
      }
    } catch (err) {
      addToast({ title: 'Error Loading Audit', message: err.message, type: 'error' });
    }
  };

  // Compute live stats
  const stats = {
    totalItems: menuItems.length,
    totalIssues: activeAudit?.totalIssues || 0,
    highPriorityCount: activeAudit?.highPriorityCount || 0,
    resolvedCount: activeAudit?.resolvedCount || 0,
    unresolvedCount: activeAudit?.unresolvedCount || 0
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 font-sans selection:bg-sage-200">
      {/* Top Navigation */}
      <Navbar
        restaurant={restaurant}
        storageStatus={storageStatus}
        activeAudit={activeAudit}
        onRunAudit={handleRunAudit}
        isAuditing={isAuditing}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main App Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          stats={stats}
        />

        {/* Content View */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              restaurant={restaurant}
              stats={stats}
              activeAudit={activeAudit}
              auditHistory={auditHistory}
              storageStatus={storageStatus}
              onRunAudit={handleRunAudit}
              isAuditing={isAuditing}
              onNavigateTab={setCurrentTab}
              onSelectAudit={handleSelectAudit}
              onResetDemo={handleResetDemo}
              isResetting={isResetting}
            />
          )}

          {currentTab === 'menu' && (
            <MenuManager
              menuItems={menuItems}
              onCreateItem={handleCreateItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onImportCSV={handleImportCSV}
              onResetDemo={handleResetDemo}
              isResetting={isResetting}
            />
          )}

          {currentTab === 'findings' && (
            <FindingsReview
              activeAudit={activeAudit}
              onUpdateFindingStatus={handleUpdateFindingStatus}
              onApplyApprovedCorrections={handleApplyApprovedCorrections}
              isApplying={isApplying}
              onRunAudit={handleRunAudit}
              isAuditing={isAuditing}
            />
          )}

          {currentTab === 'export' && (
            <MenuExport
              restaurant={restaurant}
              menuItems={menuItems}
              activeAudit={activeAudit}
              onUpdateItem={handleUpdateItem}
              onNotify={addToast}
            />
          )}
        </main>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
