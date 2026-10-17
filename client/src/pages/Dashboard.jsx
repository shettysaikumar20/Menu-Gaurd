import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  UtensilsCrossed, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Cpu, 
  RefreshCw,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({
  restaurant,
  stats,
  activeAudit,
  auditHistory = [],
  storageStatus,
  onRunAudit,
  isAuditing,
  onNavigateTab,
  onSelectAudit,
  onResetDemo,
  isResetting
}) {
  const resolvedPercent = stats?.totalIssues > 0 
    ? Math.round((stats.resolvedCount / stats.totalIssues) * 100) 
    : 100;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome Banner */}
      <div className="bg-cream-50 border border-cream-300 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sage-100 text-sage-800 border border-sage-200">
            <span>Verified Quality Control</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal-900">
            {restaurant?.name || 'Artisan Hearth Cafe & Bakery'}
          </h1>
          <p className="text-sm text-charcoal-600">
            Active Menu: <span className="font-medium text-charcoal-800">{restaurant?.menuName || 'Fall & Winter All-Day Menu'}</span>. 
            Auditing consistency, pricing conflicts, allergen clarity, and ingredient compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-sage-700 hover:bg-sage-800 text-cream-50 transition-all shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing Menu...' : 'Run Menu Audit'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Items */}
        <div 
          onClick={() => onNavigateTab('menu')}
          className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs hover:border-sage-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Total Menu Items</span>
            <div className="w-8 h-8 rounded-lg bg-cream-200 flex items-center justify-center text-charcoal-700 group-hover:bg-sage-100 group-hover:text-sage-700 transition-colors">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-charcoal-900">{stats?.totalItems || 0}</span>
            <span className="text-xs text-charcoal-500">items in catalog</span>
          </div>
          <div className="mt-2 text-xs text-sage-700 flex items-center gap-1">
            <span>Manage items</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 2: Total Issues */}
        <div 
          onClick={() => onNavigateTab('findings')}
          className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs hover:border-sage-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Total Issues Detected</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-charcoal-900">{stats?.totalIssues || 0}</span>
            <span className="text-xs text-charcoal-500">needs inspection</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 flex items-center gap-1">
            <span>Review evidence</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 3: High Priority Issues */}
        <div 
          onClick={() => onNavigateTab('findings')}
          className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs hover:border-sage-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">High-Priority Issues</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-700 border border-red-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-red-700">{stats?.highPriorityCount || 0}</span>
            <span className="text-xs text-charcoal-500">critical & high</span>
          </div>
          <div className="mt-2 text-xs text-red-700 flex items-center gap-1">
            <span>Requires urgent review</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 4: Resolution Progress */}
        <div 
          onClick={() => onNavigateTab('export')}
          className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs hover:border-sage-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Resolution Status</span>
            <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center text-sage-700 border border-sage-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-charcoal-900">{stats?.resolvedCount || 0}</span>
            <span className="text-xs text-charcoal-500">/ {stats?.totalIssues || 0} resolved</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-cream-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-sage-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${resolvedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dual Engine & Security State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Storage Engine Status */}
        <div className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cream-200 flex items-center justify-center text-charcoal-700">
              <Database className="w-4 h-4 text-sage-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-charcoal-900">Database & Persistence Engine</h2>
              <p className="text-xs text-charcoal-500">{storageStatus?.label || 'In-Memory Storage'}</p>
            </div>
          </div>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            {storageStatus?.mode === 'mongodb'
              ? 'MenuGuard AI is actively connected to MongoDB with Mongoose schemas. Changes are persisted permanently.'
              : 'Running in high-performance in-memory demo mode. All CRUD operations, audits, and status approvals work seamlessly.'}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-charcoal-500 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Zero dependencies required for demonstration</span>
          </div>
        </div>

        {/* Backboard AI Status */}
        <div className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cream-200 flex items-center justify-center text-charcoal-700">
              <Cpu className="w-4 h-4 text-sage-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-charcoal-900">Backboard AI Engine (Layer 2)</h2>
              <p className="text-xs text-charcoal-500">
                {activeAudit?.isMock 
                  ? 'Simulated Open-Weight Llama-3.1-70B (Mock Mode)'
                  : (activeAudit?.engineModel || 'Backboard AI Integration')}
              </p>
            </div>
          </div>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            {activeAudit?.isMock
              ? 'Credentials not detected or running in test mode. A labelled simulation executes language verification so you can explore the full reviewer workflow without an API key.'
              : 'Connected to Backboard API using verified open-weight model endpoints. Structured JSON output is schema-validated via Zod.'}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-charcoal-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
            <span>Deterministic Layer 1 always runs independently</span>
          </div>
        </div>
      </div>

      {/* Quick Action Helper: Demo Cafe & Intentional Test Cases */}
      <div className="bg-sage-50 border border-sage-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-sage-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sage-700" />
            <span>Demonstration Dataset: Artisan Hearth Cafe & Bakery</span>
          </h3>
          <p className="text-xs text-sage-800 leading-relaxed max-w-3xl">
            This demo includes 24 fictional items with intentional test cases: duplicate items across sections with conflicting prices ($24 vs $28), a missing price on avocado tartine, a French toast marked "Vegan" that lists whole milk and butter, and a description claiming "Wild Alaskan salmon" contradicted by ingredients listing "farm-raised Atlantic salmon".
          </p>
        </div>
        <button
          onClick={onResetDemo}
          disabled={isResetting || isAuditing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-sage-300 text-sage-900 hover:bg-sage-100 transition-colors shadow-2xs whitespace-nowrap disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reload Demo Menu</span>
        </button>
      </div>

      {/* Recent Audit History */}
      <div className="bg-white border border-cream-300 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-charcoal-900">Recent Audit History</h2>
            <p className="text-xs text-charcoal-500">Historical audit runs and verified evidence logs</p>
          </div>
          {auditHistory.length > 0 && (
            <span className="text-xs text-charcoal-500 font-medium">
              {auditHistory.length} audit{auditHistory.length > 1 ? 's' : ''} recorded
            </span>
          )}
        </div>

        {auditHistory.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-charcoal-400 mx-auto stroke-1" />
            <h3 className="text-sm font-semibold text-charcoal-800">No Audits Performed Yet</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              Click the "Run Menu Audit" button above to evaluate your menu against deterministic rules and Backboard AI language checks.
            </p>
            <button
              onClick={onRunAudit}
              disabled={isAuditing}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-sage-700 text-cream-50 hover:bg-sage-800 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run First Audit</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 text-charcoal-600 font-medium border-b border-cream-200">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Menu Name</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total Issues</th>
                  <th className="px-5 py-3">High Priority</th>
                  <th className="px-5 py-3">Resolved</th>
                  <th className="px-5 py-3">Engine</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {auditHistory.map((audit) => {
                  const isCurrent = activeAudit?.id === audit.id;
                  return (
                    <tr 
                      key={audit.id}
                      className={`hover:bg-cream-50 transition-colors ${isCurrent ? 'bg-sage-50/50' : ''}`}
                    >
                      <td className="px-5 py-3.5 font-medium text-charcoal-800 whitespace-nowrap">
                        {new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(audit.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-charcoal-700">
                        {audit.menuName}
                      </td>
                      <td className="px-5 py-3.5 text-charcoal-600">
                        {audit.totalItems}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-charcoal-900">{audit.totalIssues}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {audit.highPriorityCount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            {audit.highPriorityCount}
                          </span>
                        ) : (
                          <span className="text-charcoal-400">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sage-700 font-medium">
                          {audit.resolvedCount || 0} / {audit.totalIssues}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          audit.isMock 
                            ? 'bg-cream-200 text-charcoal-700' 
                            : 'bg-sage-100 text-sage-800 border border-sage-200'
                        }`}>
                          {audit.isMock ? 'Mock Analysis' : 'Live Backboard'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            onSelectAudit(audit.id);
                            onNavigateTab('findings');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white border border-cream-300 text-charcoal-800 hover:border-sage-500 hover:text-sage-700 transition-colors shadow-2xs"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
