import React from 'react';
import { ShieldCheck, Sparkles, Database, RefreshCw, Cpu } from 'lucide-react';

export default function Navbar({ 
  restaurant, 
  storageStatus, 
  onRunAudit, 
  isAuditing, 
  onResetDemo,
  isResetting,
  activeAudit
}) {
  return (
    <header className="bg-cream-50 border-b border-cream-300 px-6 py-3 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Branding & Restaurant Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sage-700 flex items-center justify-center text-cream-50 shadow-sm flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-cream-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-charcoal-900 text-base tracking-tight">MenuGuard AI</span>
              <span className="text-[11px] font-medium bg-sage-100 text-sage-800 px-2 py-0.5 rounded-full border border-sage-200">
                Hacktoberfest 2026
              </span>
            </div>
            <p className="text-xs text-charcoal-500 font-sans">
              {restaurant?.name || 'Artisan Hearth Cafe & Bakery'} — <span className="text-charcoal-600 font-medium">{restaurant?.menuName || 'Active Menu'}</span>
            </p>
          </div>
        </div>

        {/* Right: Engine Pills & Action CTAs */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Storage Mode Pill */}
          <div 
            title={storageStatus?.label || 'In-Memory Store'} 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-white text-charcoal-600 border-cream-300"
          >
            <Database className="w-3.5 h-3.5 text-sage-600" />
            <span className="truncate max-w-[130px]">
              In-Memory Store
            </span>
          </div>

          {/* AI Mode Pill */}
          <div 
            title={activeAudit?.engineModel || 'Backboard AI Engine'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-white text-charcoal-600 border-cream-300"
          >
            <Cpu className="w-3.5 h-3.5 text-sage-600" />
            <span className="truncate max-w-[160px]">
              {activeAudit?.isMock ? 'Backboard (Mock)' : 'Backboard (Live)'}
            </span>
          </div>

          {/* Quick Demo Reset */}
          <button
            onClick={onResetDemo}
            disabled={isResetting || isAuditing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-cream-300 bg-white hover:bg-cream-200 text-charcoal-700 transition-colors disabled:opacity-50"
            title="Reload fictional cafe test menu with intentional audit cases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Menu</span>
          </button>

          {/* Run Audit CTA */}
          <button
            onClick={onRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold bg-sage-700 hover:bg-sage-800 text-cream-50 transition-all shadow-sm active:scale-98 disabled:opacity-60"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-cream-200' : 'text-cream-300'}`} />
            <span>{isAuditing ? 'Auditing Menu...' : 'Run Menu Audit'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
