import React from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  SearchCheck, 
  DownloadCloud, 
  Info,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab, stats }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'menu',
      label: 'Menu Items',
      icon: UtensilsCrossed,
      badge: stats?.totalItems || null
    },
    {
      id: 'findings',
      label: 'Findings & Review',
      icon: SearchCheck,
      badge: stats?.totalIssues > 0 ? stats.totalIssues : null,
      badgeAlert: stats?.highPriorityCount > 0
    },
    {
      id: 'export',
      label: 'Improve & Export',
      icon: DownloadCloud,
      badge: stats?.resolvedCount > 0 ? `${stats.resolvedCount} fixed` : null
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-cream-50 border-r border-cream-300 flex flex-col justify-between p-4 flex-shrink-0">
      <div className="space-y-6">
        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sage-700 text-cream-50 shadow-xs'
                    : 'text-charcoal-700 hover:bg-cream-200 hover:text-charcoal-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cream-200' : 'text-charcoal-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-sage-900 text-cream-100'
                        : item.badgeAlert
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-cream-200 text-charcoal-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Audit Layer Summary Widget */}
        <div className="bg-white border border-cream-300 rounded-lg p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-800">
            <ShieldCheck className="w-4 h-4 text-sage-600" />
            <span>Dual-Layer Auditing</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-charcoal-600">
            <div className="flex items-center justify-between border-b border-cream-200 pb-1">
              <span>Layer 1: Deterministic</span>
              <span className="font-medium text-sage-700">Rules Engine</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Layer 2: Language</span>
              <span className="font-medium text-sage-700">Backboard AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-cream-300 text-[11px] text-charcoal-500 space-y-1">
        <p className="font-medium text-charcoal-700">Hacktoberfest 2026</p>
        <p>Best Use of Backboard Category</p>
        <p className="text-[10px] text-charcoal-400">Deterministic + Open-Weight Model Verification</p>
      </div>
    </aside>
  );
}
