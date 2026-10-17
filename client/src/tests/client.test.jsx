import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../pages/Dashboard.jsx';
import MenuManager from '../pages/MenuManager.jsx';
import FindingsReview from '../pages/FindingsReview.jsx';
import MenuExport from '../pages/MenuExport.jsx';
import { DEMO_MENU_ITEMS, DEMO_RESTAURANT } from '../shared/demoMenu.js';
import { ISSUE_CATEGORIES, SEVERITIES, FINDING_STATUS, ANALYSIS_LAYERS } from '../shared/constants.js';

describe('Dashboard Component', () => {
  it('renders restaurant name and live metric cards', () => {
    const stats = {
      totalItems: 24,
      totalIssues: 5,
      highPriorityCount: 3,
      resolvedCount: 2,
      unresolvedCount: 3
    };

    render(
      <Dashboard
        restaurant={DEMO_RESTAURANT}
        stats={stats}
        auditHistory={[]}
        storageStatus={{ mode: 'in-memory', label: 'In-Memory Demo' }}
        onRunAudit={vi.fn()}
        isAuditing={false}
        onNavigateTab={vi.fn()}
        onSelectAudit={vi.fn()}
        onResetDemo={vi.fn()}
        isResetting={false}
      />
    );

    expect(screen.getByText(DEMO_RESTAURANT.name)).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument(); // total items
    expect(screen.getByText('5')).toBeInTheDocument(); // total issues
    expect(screen.getByText('3')).toBeInTheDocument(); // high priority
  });
});

describe('FindingsReview Component: Approving & Rejecting Findings', () => {
  it('allows approving and rejecting findings with callbacks', () => {
    const mockFinding = {
      id: 'f-1',
      category: ISSUE_CATEGORIES.PRICE_CONFLICT,
      severity: SEVERITIES.CRITICAL,
      layer: ANALYSIS_LAYERS.DETERMINISTIC,
      menuItemId: 'demo-item-03',
      menuItemName: 'Truffle Wild Mushroom Risotto',
      explanation: 'Conflicting prices across menu sections ($24 vs $28).',
      evidence: 'Mains: $24.00 vs Specials: $28.00',
      suggestedCorrection: 'Align prices to $24.00.',
      status: FINDING_STATUS.PENDING
    };

    const mockAudit = {
      id: 'audit-123',
      totalIssues: 1,
      highPriorityCount: 1,
      resolvedCount: 0,
      unresolvedCount: 1,
      isMock: true,
      findings: [mockFinding]
    };

    const onUpdateStatus = vi.fn();
    const onApply = vi.fn();

    render(
      <FindingsReview
        activeAudit={mockAudit}
        onUpdateFindingStatus={onUpdateStatus}
        onApplyApprovedCorrections={onApply}
        isApplying={false}
        onRunAudit={vi.fn()}
        isAuditing={false}
      />
    );

    // Finding card should display
    expect(screen.getAllByText('Truffle Wild Mushroom Risotto')[0]).toBeInTheDocument();
    expect(screen.getByText('Mains: $24.00 vs Specials: $28.00')).toBeInTheDocument();

    // Click Approve button
    const approveBtn = screen.getByTitle('Approve proposed correction');
    fireEvent.click(approveBtn);
    expect(onUpdateStatus).toHaveBeenCalledWith('f-1', { status: FINDING_STATUS.APPROVED });

    // Click Reject button
    const rejectBtn = screen.getByTitle('Reject finding');
    fireEvent.click(rejectBtn);
    expect(onUpdateStatus).toHaveBeenCalledWith('f-1', { status: FINDING_STATUS.REJECTED });
  });
});

describe('MenuManager Component', () => {
  it('filters menu items by search query and category', () => {
    render(
      <MenuManager
        menuItems={DEMO_MENU_ITEMS}
        onCreateItem={vi.fn()}
        onUpdateItem={vi.fn()}
        onDeleteItem={vi.fn()}
        onImportCSV={vi.fn()}
        onResetDemo={vi.fn()}
        isResetting={false}
      />
    );

    // Filter by search
    const searchInput = screen.getByPlaceholderText(/Search by item name/i);
    fireEvent.change(searchInput, { target: { value: 'Croissant' } });

    expect(screen.getByText('Classic Butter Croissant')).toBeInTheDocument();
    expect(screen.queryByText('Wild Alaskan Salmon Filet')).not.toBeInTheDocument();
  });
});

describe('MenuExport Component', () => {
  it('renders clean menu preview and export action triggers', () => {
    const notify = vi.fn();
    render(
      <MenuExport
        restaurant={DEMO_RESTAURANT}
        menuItems={DEMO_MENU_ITEMS.slice(0, 3)}
        activeAudit={{
          id: 'audit-test',
          timestamp: new Date().toISOString(),
          totalItems: 3,
          totalIssues: 1,
          highPriorityCount: 1,
          resolvedCount: 1,
          unresolvedCount: 0,
          engineModel: 'Backboard AI',
          isMock: true,
          findings: []
        }}
        onNotify={notify}
      />
    );

    expect(screen.getByText('Export Clean CSV')).toBeInTheDocument();
    expect(screen.getByText('Export Markdown')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
    expect(screen.getByText('Compliance & Factual Integrity Guarantee')).toBeInTheDocument();
  });
});
