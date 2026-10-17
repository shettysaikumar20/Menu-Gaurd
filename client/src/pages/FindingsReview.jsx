import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Check, 
  X, 
  Edit2, 
  Save, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  Layers, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { 
  ISSUE_CATEGORIES, 
  SEVERITIES, 
  FINDING_STATUS, 
  ANALYSIS_LAYERS 
} from '../shared/constants.js';

export default function FindingsReview({
  activeAudit,
  onUpdateFindingStatus,
  onApplyApprovedCorrections,
  isApplying,
  onRunAudit,
  isAuditing
}) {
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedLayer, setSelectedLayer] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // State for in-line editing of proposed corrections and manager notes
  const [editingFindingId, setEditingFindingId] = useState(null);
  const [editCorrectionText, setEditCorrectionText] = useState('');
  const [editNotesText, setEditNotesText] = useState('');

  const findings = activeAudit?.findings || [];

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      const matchSev = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
      const matchLayer = selectedLayer === 'ALL' || f.layer === selectedLayer;
      const matchStatus = selectedStatus === 'ALL' || f.status === selectedStatus;
      const matchCat = selectedCategory === 'ALL' || f.category === selectedCategory;
      return matchSev && matchLayer && matchStatus && matchCat;
    });
  }, [findings, selectedSeverity, selectedLayer, selectedStatus, selectedCategory]);

  // Counts
  const approvedCount = findings.filter(f => f.status === FINDING_STATUS.APPROVED).length;
  const pendingCount = findings.filter(f => f.status === FINDING_STATUS.PENDING).length;
  const resolvedCount = findings.filter(f => f.status === FINDING_STATUS.RESOLVED).length;

  const handleStartEdit = (finding) => {
    setEditingFindingId(finding.id);
    setEditCorrectionText(finding.suggestedCorrection || '');
    setEditNotesText(finding.humanNotes || '');
  };

  const handleSaveEdit = async (finding) => {
    await onUpdateFindingStatus(finding.id, {
      suggestedCorrection: editCorrectionText,
      humanNotes: editNotesText
    });
    setEditingFindingId(null);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case SEVERITIES.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case SEVERITIES.HIGH:
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case SEVERITIES.MEDIUM:
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case SEVERITIES.LOW:
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case SEVERITIES.INFO:
      default:
        return 'bg-cream-200 text-charcoal-700 border-cream-300';
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case FINDING_STATUS.APPROVED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case FINDING_STATUS.RESOLVED:
        return 'bg-sage-100 text-sage-800 border-sage-300';
      case FINDING_STATUS.REJECTED:
        return 'bg-charcoal-100 text-charcoal-600 border-charcoal-300 line-through';
      case FINDING_STATUS.PENDING:
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  if (!activeAudit) {
    return (
      <div className="bg-white border border-cream-300 rounded-xl p-12 text-center space-y-4 shadow-xs">
        <AlertTriangle className="w-12 h-12 text-charcoal-400 mx-auto stroke-1" />
        <h2 className="font-serif font-bold text-xl text-charcoal-900">No Active Audit Selected</h2>
        <p className="text-xs text-charcoal-500 max-w-md mx-auto">
          Run an audit from the top navigation or load the demo cafe menu to evaluate quality and review findings.
        </p>
        <button
          onClick={onRunAudit}
          disabled={isAuditing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-sage-700 hover:bg-sage-800 text-cream-50 transition-all shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAuditing ? 'Auditing Menu...' : 'Run Menu Audit Now'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header with Title & Audit Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-charcoal-900">Audit Review & Findings</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              activeAudit.isMock 
                ? 'bg-cream-200 text-charcoal-700' 
                : 'bg-sage-100 text-sage-800 border border-sage-200'
            }`}>
              {activeAudit.isMock ? 'Mock Analysis' : 'Live Backboard'}
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Audit ID: <code className="font-mono text-charcoal-700 text-[11px]">{activeAudit.id}</code> — 
            Total issues: <span className="font-semibold text-charcoal-800">{activeAudit.totalIssues}</span> ({activeAudit.highPriorityCount} high priority)
          </p>
        </div>

        {/* Re-run Audit button */}
        <button
          onClick={onRunAudit}
          disabled={isAuditing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-cream-300 hover:border-sage-500 text-charcoal-800 transition-colors shadow-2xs disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 text-sage-700 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing...' : 'Re-run Audit'}</span>
        </button>
      </div>

      {/* Prominent Action Banner for Applying Approved Changes */}
      {approvedCount > 0 && (
        <div className="bg-sage-100 border border-sage-300 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sage-700 text-cream-50 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-sage-950">
                {approvedCount} Correction{approvedCount > 1 ? 's' : ''} Approved for Menu Application
              </h3>
              <p className="text-xs text-sage-800">
                MenuGuard AI never silently modifies your live menu. Click to commit verified changes into the menu catalog.
              </p>
            </div>
          </div>

          <button
            onClick={onApplyApprovedCorrections}
            disabled={isApplying}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-sage-800 hover:bg-sage-900 text-cream-50 transition-all shadow-xs whitespace-nowrap disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-cream-200" />
            <span>{isApplying ? 'Applying Corrections...' : `Apply ${approvedCount} Changes to Menu`}</span>
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-cream-300 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-700">
          <Filter className="w-3.5 h-3.5 text-sage-600" />
          <span>Filter Findings:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Severity Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-charcoal-500 uppercase mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-cream-50 border border-cream-300 rounded-lg text-charcoal-800 focus:outline-none focus:border-sage-500"
            >
              <option value="ALL">All Severities</option>
              <option value={SEVERITIES.CRITICAL}>Critical Only</option>
              <option value={SEVERITIES.HIGH}>High Only</option>
              <option value={SEVERITIES.MEDIUM}>Medium</option>
              <option value={SEVERITIES.LOW}>Low</option>
              <option value={SEVERITIES.INFO}>Info / Advisory</option>
            </select>
          </div>

          {/* Layer Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-charcoal-500 uppercase mb-1">Audit Layer</label>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-cream-50 border border-cream-300 rounded-lg text-charcoal-800 focus:outline-none focus:border-sage-500"
            >
              <option value="ALL">All Layers</option>
              <option value={ANALYSIS_LAYERS.DETERMINISTIC}>Layer 1: Deterministic JS</option>
              <option value={ANALYSIS_LAYERS.AI_BACKBOARD}>Layer 2: Backboard AI</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-charcoal-500 uppercase mb-1">Review Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-cream-50 border border-cream-300 rounded-lg text-charcoal-800 focus:outline-none focus:border-sage-500"
            >
              <option value="ALL">All Statuses ({findings.length})</option>
              <option value={FINDING_STATUS.PENDING}>Pending ({pendingCount})</option>
              <option value={FINDING_STATUS.APPROVED}>Approved ({approvedCount})</option>
              <option value={FINDING_STATUS.RESOLVED}>Resolved ({resolvedCount})</option>
              <option value={FINDING_STATUS.REJECTED}>Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-charcoal-500 uppercase mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-cream-50 border border-cream-300 rounded-lg text-charcoal-800 focus:outline-none focus:border-sage-500"
            >
              <option value="ALL">All Categories</option>
              {Object.keys(ISSUE_CATEGORIES).map(catKey => (
                <option key={catKey} value={ISSUE_CATEGORIES[catKey]}>{catKey.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="bg-white border border-cream-300 rounded-xl p-12 text-center space-y-2 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-sage-600 mx-auto" />
            <h3 className="font-serif font-bold text-base text-charcoal-900">No Findings Match Your Filters</h3>
            <p className="text-xs text-charcoal-500">
              Clear or change your filters above to view other audit items.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const isEditing = editingFindingId === finding.id;
            const isDeterministic = finding.layer === ANALYSIS_LAYERS.DETERMINISTIC;

            return (
              <div 
                key={finding.id}
                className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs transition-all space-y-4 hover:border-cream-400"
              >
                {/* Top Badges & Status Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Severity Badge */}
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getSeverityBadge(finding.severity)}`}>
                      {finding.severity}
                    </span>

                    {/* Layer Badge */}
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                      isDeterministic
                        ? 'bg-cream-100 text-charcoal-700 border-cream-300'
                        : 'bg-sage-50 text-sage-800 border-sage-200'
                    }`}>
                      {isDeterministic ? <ShieldCheck className="w-3 h-3 text-charcoal-500" /> : <Cpu className="w-3 h-3 text-sage-600" />}
                      <span>{isDeterministic ? 'Deterministic Layer 1' : 'Backboard AI Layer 2'}</span>
                    </span>

                    {/* Category */}
                    <span className="text-[11px] font-semibold text-charcoal-800 bg-cream-100 px-2.5 py-0.5 rounded">
                      {finding.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Status Pill & Action Buttons */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(finding.status)}`}>
                      {finding.status}
                    </span>

                    {/* Review Actions */}
                    <button
                      onClick={() => onUpdateFindingStatus(finding.id, { status: FINDING_STATUS.APPROVED })}
                      disabled={finding.status === FINDING_STATUS.APPROVED}
                      className="p-1.5 rounded-md text-xs font-medium border border-cream-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors disabled:opacity-40"
                      title="Approve proposed correction"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => onUpdateFindingStatus(finding.id, { status: FINDING_STATUS.REJECTED })}
                      disabled={finding.status === FINDING_STATUS.REJECTED}
                      className="p-1.5 rounded-md text-xs font-medium border border-cream-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors disabled:opacity-40"
                      title="Reject finding"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                    <button
                      onClick={() => onUpdateFindingStatus(finding.id, { status: FINDING_STATUS.RESOLVED })}
                      disabled={finding.status === FINDING_STATUS.RESOLVED}
                      className="p-1.5 rounded-md text-xs font-medium border border-cream-300 hover:bg-sage-50 hover:text-sage-700 hover:border-sage-300 transition-colors disabled:opacity-40"
                      title="Mark as manually resolved"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sage-600" />
                    </button>
                  </div>
                </div>

                {/* Finding Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
                      <span>Affected Item:</span>
                      <span className="font-serif text-base text-sage-900 font-semibold">{finding.menuItemName}</span>
                    </h3>
                    <p className="text-xs text-charcoal-700 mt-1 leading-relaxed">
                      {finding.explanation}
                    </p>
                  </div>

                  {/* Verbatim Evidence Box */}
                  <div className="bg-cream-50 border-l-4 border-sage-600 rounded-r-lg p-3 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-charcoal-800 text-[11px] uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-sage-700" />
                      <span>Verbatim Input Evidence:</span>
                    </div>
                    <blockquote className="font-mono text-[11px] text-charcoal-700 bg-white p-2 rounded border border-cream-200 select-all">
                      {finding.evidence}
                    </blockquote>
                    <p className="text-[10px] text-charcoal-500 italic">
                      Verified extracted directly from input menu and kitchen records.
                    </p>
                  </div>

                  {/* Side-by-Side Comparison: Original vs Proposed Corrected */}
                  <div className="bg-cream-50/70 border border-cream-300 rounded-lg p-3.5 text-xs space-y-2">
                    <span className="font-semibold text-charcoal-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sage-600" />
                      <span>Side-by-Side Field Comparison:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Left: Original Value */}
                      <div className="bg-white border border-red-200 rounded-md p-2.5 space-y-1">
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                          Current / Original Value
                        </span>
                        <div className="text-[11px] text-charcoal-800 space-y-0.5">
                          <p><span className="text-charcoal-500">Name:</span> {finding.originalItemSnapshot?.name || finding.menuItemName}</p>
                          <p><span className="text-charcoal-500">Price:</span> {finding.originalItemSnapshot?.price !== null && finding.originalItemSnapshot?.price !== undefined ? `$${Number(finding.originalItemSnapshot.price).toFixed(2)}` : <span className="text-red-600 italic">None</span>}</p>
                          {finding.originalItemSnapshot?.dietaryLabels?.length > 0 && (
                            <p><span className="text-charcoal-500">Labels:</span> {finding.originalItemSnapshot.dietaryLabels.join(', ')}</p>
                          )}
                          {finding.originalItemSnapshot?.description && (
                            <p className="line-clamp-2"><span className="text-charcoal-500">Desc:</span> {finding.originalItemSnapshot.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Proposed Correction */}
                      <div className="bg-white border border-emerald-200 rounded-md p-2.5 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Proposed Corrected Value
                        </span>
                        <div className="text-[11px] text-charcoal-800 space-y-0.5">
                          <p><span className="text-charcoal-500">Name:</span> {finding.correctedItemSnapshot?.name || finding.menuItemName}</p>
                          <p><span className="text-charcoal-500">Price:</span> {finding.correctedItemSnapshot?.price !== null && finding.correctedItemSnapshot?.price !== undefined ? `$${Number(finding.correctedItemSnapshot.price).toFixed(2)}` : <span className="text-charcoal-500 italic">Unchanged</span>}</p>
                          {finding.correctedItemSnapshot?.dietaryLabels && (
                            <p><span className="text-charcoal-500">Labels:</span> {finding.correctedItemSnapshot.dietaryLabels.length > 0 ? finding.correctedItemSnapshot.dietaryLabels.join(', ') : <span className="text-charcoal-500 italic">Badges removed</span>}</p>
                          )}
                          {finding.correctedItemSnapshot?.description && (
                            <p className="line-clamp-2"><span className="text-charcoal-500">Desc:</span> {finding.correctedItemSnapshot.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proposed Correction & Diff View */}
                  <div className="bg-white border border-cream-300 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                        <span>Proposed Actionable Correction:</span>
                      </span>

                      {!isEditing ? (
                        <button
                          onClick={() => handleStartEdit(finding)}
                          className="flex items-center gap-1 text-[11px] text-charcoal-600 hover:text-sage-700 font-medium"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Proposal</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSaveEdit(finding)}
                          className="flex items-center gap-1 text-[11px] text-sage-700 hover:text-sage-900 font-semibold"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Correction</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows="2"
                          value={editCorrectionText}
                          onChange={(e) => setEditCorrectionText(e.target.value)}
                          className="w-full text-xs p-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-sage-500"
                        />
                        <div>
                          <label className="block text-[10px] font-semibold text-charcoal-600 mb-0.5">Manager Notes:</label>
                          <input
                            type="text"
                            value={editNotesText}
                            onChange={(e) => setEditNotesText(e.target.value)}
                            placeholder="Add reason for approval/rejection..."
                            className="w-full text-xs px-2 py-1 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-sage-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-charcoal-700 bg-sage-50/60 p-2.5 rounded border border-sage-100 font-medium">
                        {finding.suggestedCorrection}
                      </p>
                    )}

                    {/* Human Notes Display if present */}
                    {finding.humanNotes && !isEditing && (
                      <div className="text-[11px] text-charcoal-600 pt-1 flex items-center gap-1">
                        <span className="font-semibold text-charcoal-700">Manager Note:</span>
                        <span>{finding.humanNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
