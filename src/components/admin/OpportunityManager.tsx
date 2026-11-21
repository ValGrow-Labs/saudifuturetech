'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Coins, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  Trash2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Edit2,
  X,
  Eye,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { 
  verifyOpportunityAction, 
  updateOpportunityStatusAction, 
  deleteOpportunityAction,
  toggleOpportunityPublishAction,
  saveOpportunityAction,
  OpportunityFormData
} from '@/actions/founder-admin';
import { OpportunityCategory, OpportunityStatus } from '@prisma/client';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface OpportunityManagerProps {
  opportunities: any[];
  categories: CategoryOption[];
}

export const OpportunityManager: React.FC<OpportunityManagerProps> = ({ opportunities, categories }) => {
  const [isPending, startTransition] = useTransition();
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [publishFilter, setPublishFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    slug: '',
    organization: '',
    category: OpportunityCategory.GRANT,
    categoryId: categories[0]?.id || null,
    fundingAmount: '',
    equityTaken: '0% (Non-Dilutive)',
    location: 'Riyadh, KSA',
    description: '',
    eligibilitySummary: '',
    eligibilityCriteria: [],
    benefits: [],
    requirements: [],
    status: OpportunityStatus.OPEN,
    deadline: '',
    applicationUrl: '',
    sourceName: '',
    sourceUrl: '',
    isFeatured: false,
    isPublished: true,
  });

  // Multiline Textarea inputs for array fields
  const [criteriaText, setCriteriaText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      organization: '',
      category: OpportunityCategory.GRANT,
      categoryId: categories[0]?.id || null,
      fundingAmount: '',
      equityTaken: '0% (Non-Dilutive)',
      location: 'Riyadh, KSA',
      description: '',
      eligibilitySummary: '',
      eligibilityCriteria: [],
      benefits: [],
      requirements: [],
      status: OpportunityStatus.OPEN,
      deadline: '',
      applicationUrl: '',
      sourceName: '',
      sourceUrl: '',
      isFeatured: false,
      isPublished: true,
    });
    setCriteriaText('');
    setBenefitsText('');
    setRequirementsText('');
    setIsModalOpen(true);
  };

  const openEditModal = (opp: any) => {
    setEditingId(opp.id);
    const deadlineVal = opp.deadline ? new Date(opp.deadline).toISOString().split('T')[0] : '';
    setFormData({
      title: opp.title,
      slug: opp.slug,
      organization: opp.organization,
      category: opp.category,
      categoryId: opp.categoryId || null,
      fundingAmount: opp.fundingAmount || '',
      equityTaken: opp.equityTaken || '',
      location: opp.location || '',
      description: opp.description,
      eligibilitySummary: opp.eligibilitySummary || '',
      status: opp.status,
      deadline: deadlineVal,
      applicationUrl: opp.applicationUrl,
      sourceName: opp.sourceName,
      sourceUrl: opp.sourceUrl || '',
      isFeatured: Boolean(opp.isFeatured),
      isPublished: opp.isPublished !== undefined ? Boolean(opp.isPublished) : true,
    });

    const cList = Array.isArray(opp.eligibilityCriteria) ? (opp.eligibilityCriteria as string[]) : [];
    const bList = Array.isArray(opp.benefits) ? (opp.benefits as string[]) : [];
    const rList = Array.isArray(opp.requirements) ? (opp.requirements as string[]) : [];

    setCriteriaText(cList.join('\n'));
    setBenefitsText(bList.join('\n'));
    setRequirementsText(rList.join('\n'));
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedCriteria = criteriaText.split('\n').map((s) => s.trim()).filter(Boolean);
    const parsedBenefits = benefitsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const parsedRequirements = requirementsText.split('\n').map((s) => s.trim()).filter(Boolean);

    const submissionData: OpportunityFormData = {
      ...formData,
      eligibilityCriteria: parsedCriteria,
      benefits: parsedBenefits,
      requirements: parsedRequirements,
    };

    startTransition(async () => {
      const res = await saveOpportunityAction(editingId, submissionData);
      if (res.success) {
        setActiveMessage(editingId ? `Successfully updated "${formData.title}".` : `Successfully created "${formData.title}".`);
        setErrorMessage(null);
        setIsModalOpen(false);
      } else {
        setErrorMessage(res.error || 'Failed to save opportunity.');
      }
    });
  };

  const handleVerify = (id: string, title: string) => {
    startTransition(async () => {
      const res = await verifyOpportunityAction(id);
      if (res.success) {
        setActiveMessage(`Verified: "${title}" with current editorial timestamp.`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || 'Failed to verify.');
      }
    });
  };

  const handleTogglePublish = (id: string, title: string) => {
    startTransition(async () => {
      const res = await toggleOpportunityPublishAction(id);
      if (res.success) {
        setActiveMessage(`Toggled publication state for "${title}".`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || 'Failed to toggle publication status.');
      }
    });
  };

  const handleStatusChange = (id: string, status: OpportunityStatus) => {
    startTransition(async () => {
      const res = await updateOpportunityStatusAction(id, status);
      if (res.success) {
        setActiveMessage(`Updated status to ${status}.`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || 'Failed to update status.');
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteOpportunityAction(id);
      if (res.success) {
        setActiveMessage(`Deleted "${title}".`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || 'Failed to delete.');
      }
    });
  };

  // Filter list
  const filteredList = opportunities.filter((opp) => {
    const matchesSearch =
      !searchQuery.trim() ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || opp.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || opp.status === statusFilter;
    const matchesPublish =
      publishFilter === 'ALL' ||
      (publishFilter === 'PUBLISHED' && opp.isPublished) ||
      (publishFilter === 'UNPUBLISHED' && !opp.isPublished);

    return matchesSearch && matchesCategory && matchesStatus && matchesPublish;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert Feedback */}
      {activeMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center justify-between animate-in fade-in">
          <span className="font-medium">{activeMessage}</span>
          <button onClick={() => setActiveMessage(null)} className="text-emerald-700 font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center justify-between animate-in fade-in">
          <span className="font-medium">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter and Top Action Bar */}
      <div className="bg-editorial-pure rounded-lg border border-editorial-hairline p-4 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by program title or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs bg-editorial-sand/40 border border-editorial-hairline rounded-md text-ink-high placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-oasis"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-high text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* New Opportunity Button */}
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-navy/90 shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Opportunity</span>
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-editorial-hairline text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-ink-muted block mb-1">Category Type</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-editorial-sand/40 border border-editorial-hairline rounded-md px-2.5 py-1.5 text-xs text-ink-high"
            >
              <option value="ALL">All Categories</option>
              <option value="GRANT">Grants</option>
              <option value="ACCELERATOR">Accelerators</option>
              <option value="INCUBATOR">Incubators</option>
              <option value="SUBSIDY">Subsidies</option>
              <option value="GOVERNMENT_PROGRAM">Regulatory Sandboxes</option>
              <option value="SUBSIDIZED_PERK">Compute Credits</option>
              <option value="HACKATHON">Hackathons</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-ink-muted block mb-1">Cohort Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-editorial-sand/40 border border-editorial-hairline rounded-md px-2.5 py-1.5 text-xs text-ink-high"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSING_SOON">Closing Soon</option>
              <option value="ROLLING">Rolling</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-ink-muted block mb-1">Publication State</label>
            <select
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value)}
              className="w-full bg-editorial-sand/40 border border-editorial-hairline rounded-md px-2.5 py-1.5 text-xs text-ink-high"
            >
              <option value="ALL">All Records</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="UNPUBLISHED">Draft / Unpublished</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-editorial-pure rounded-lg border border-editorial-hairline overflow-hidden shadow-xs">
        <div className="p-4 border-b border-editorial-hairline flex items-center justify-between bg-editorial-sand/30">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-high">
            Verified Opportunities ({filteredList.length} of {opportunities.length})
          </span>
          {isPending && (
            <span className="flex items-center gap-1.5 text-xs text-brand-navy font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving updates...</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink-body">
            <thead className="bg-editorial-sand/60 text-ink-muted uppercase font-bold tracking-wider text-[10px] border-b border-editorial-hairline">
              <tr>
                <th className="py-3 px-4">Program &amp; Issuing Org</th>
                <th className="py-3 px-4">Category &amp; Pillar</th>
                <th className="py-3 px-4">Terms &amp; Capital</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Verification Audit</th>
                <th className="py-3 px-4">Status &amp; Publish</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-hairline font-sans">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-ink-muted">
                    No opportunities match your search or filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((opp) => (
                  <tr key={opp.id} className="hover:bg-editorial-sand/20 transition-colors">
                    {/* Program & Org */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        <Link
                          href={`/opportunity/${opp.slug}`}
                          target="_blank"
                          className="font-bold text-ink-high hover:text-brand-navy hover:underline line-clamp-1 inline-flex items-center gap-1"
                        >
                          <span>{opp.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-ink-muted" />
                        </Link>
                        <div className="text-[11px] text-ink-muted flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-ink-faint" />
                          <span>{opp.organization}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Pillar */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-editorial-sand border border-editorial-hairline text-ink-high">
                          {opp.category}
                        </span>
                        {opp.categoryRel && (
                          <div className="text-[10px] text-brand-oasis font-medium">
                            {opp.categoryRel.name}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Terms & Capital */}
                    <td className="py-3 px-4 max-w-[180px]">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-brand-oasis block truncate">
                          {opp.fundingAmount || 'Non-Cash'}
                        </span>
                        <span className="text-[10px] text-ink-muted block truncate">
                          {opp.equityTaken || '0%'}
                        </span>
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-ink-body">
                        <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                        <span>{opp.deadline ? formatDate(opp.deadline) : 'Rolling'}</span>
                      </div>
                    </td>

                    {/* Verification Audit */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-brand-oasis font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified {formatDate(opp.verifiedAt)}</span>
                        </div>
                        {opp.verifiedBy && (
                          <div className="text-[10px] text-ink-faint truncate max-w-[140px]">
                            By {opp.verifiedBy}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleVerify(opp.id, opp.title)}
                          disabled={isPending}
                          className="text-[10px] text-brand-navy hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Verify Now</span>
                        </button>
                      </div>
                    </td>

                    {/* Status & Publish */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-1.5">
                        {/* Status Dropdown */}
                        <select
                          value={opp.status}
                          onChange={(e) => handleStatusChange(opp.id, e.target.value as OpportunityStatus)}
                          disabled={isPending}
                          className="text-[10px] bg-white border border-editorial-hairline rounded px-1.5 py-0.5 text-ink-high font-medium"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="CLOSING_SOON">CLOSING_SOON</option>
                          <option value="ROLLING">ROLLING</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>

                        {/* Publish State */}
                        <div>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(opp.id, opp.title)}
                            disabled={isPending}
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer block',
                              opp.isPublished
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                            )}
                          >
                            {opp.isPublished ? '● Published' : '○ Draft (Unpublished)'}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/opportunity/${opp.slug}`}
                          target="_blank"
                          title="View Live Dossier"
                          className="p-1.5 rounded-md hover:bg-editorial-sand text-ink-muted hover:text-ink-high transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(opp)}
                          title="Edit Opportunity"
                          className="p-1.5 rounded-md hover:bg-editorial-sand text-ink-muted hover:text-ink-high transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(opp.id, opp.title)}
                          disabled={isPending}
                          title="Delete Opportunity"
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* EDIT / CREATE OPPORTUNITY MODAL                                      */}
      {/* ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-high/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-editorial-pure rounded-lg border border-editorial-hairline shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-editorial-hairline">
              <h3 className="font-heading font-black text-lg text-ink-high">
                {editingId ? 'Edit Opportunity Dossier' : 'Add New Verified Opportunity'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-ink-muted hover:text-ink-high p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              {/* Row 1: Title & Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-high block mb-1">Program Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. NTDP MVPLab Grant"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-high block mb-1">Issuing Authority / Org *</label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. NTDP, The Garage, SAMA"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  />
                </div>
              </div>

              {/* Row 2: Category & Sovereign Pillar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-high block mb-1">Category Classification *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as OpportunityCategory })}
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  >
                    <option value="GRANT">Non-Dilutive Grant</option>
                    <option value="ACCELERATOR">Seed Accelerator</option>
                    <option value="INCUBATOR">Incubator</option>
                    <option value="SUBSIDY">Innovation Subsidy / Voucher</option>
                    <option value="GOVERNMENT_PROGRAM">Regulatory Sandbox / Gov</option>
                    <option value="SUBSIDIZED_PERK">Compute / Cloud Credits</option>
                    <option value="HACKATHON">Hackathon / Challenge</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink-high block mb-1">Sovereign Tech Pillar</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || null })}
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  >
                    <option value="">None / General</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Support Value & Equity Taken */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-ink-high block mb-1">Funding Amount / Value</label>
                  <input
                    type="text"
                    value={formData.fundingAmount || ''}
                    onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
                    placeholder="e.g. Up to SAR 150,000"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-high block mb-1">Equity Required</label>
                  <input
                    type="text"
                    value={formData.equityTaken || ''}
                    onChange={(e) => setFormData({ ...formData, equityTaken: e.target.value })}
                    placeholder="e.g. 0% (Non-Dilutive)"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-high block mb-1">Program Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Riyadh, KSA (Hybrid)"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-ink-high block mb-1">Program Description &amp; Scope *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed editorial description of the initiative..."
                  className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                />
              </div>

              {/* Eligibility Summary */}
              <div>
                <label className="font-bold text-ink-high block mb-1">Eligibility Headline Summary</label>
                <input
                  type="text"
                  value={formData.eligibilitySummary || ''}
                  onChange={(e) => setFormData({ ...formData, eligibilitySummary: e.target.value })}
                  placeholder="e.g. Pre-seed Saudi tech ventures developing proprietary software with commercial registration."
                  className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                />
              </div>

              {/* Multiline Checklists */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-ink-high block mb-1">Eligibility Criteria (1 per line)</label>
                  <textarea
                    rows={4}
                    value={criteriaText}
                    onChange={(e) => setCriteriaText(e.target.value)}
                    placeholder="Saudi Commercial Registration (CR)&#10;Working MVP&#10;At least 1 Saudi founder"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-high block mb-1">Verified Benefits (1 per line)</label>
                  <textarea
                    rows={4}
                    value={benefitsText}
                    onChange={(e) => setBenefitsText(e.target.value)}
                    placeholder="SAR 150K zero-equity grant&#10;KACST lab access&#10;Mentorship from top VCs"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-high block mb-1">Requirements (1 per line)</label>
                  <textarea
                    rows={4}
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    placeholder="Pitch deck with TAM/SAM&#10;Software Architecture&#10;Incorporation papers"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Application URLs & Verification Sources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-editorial-hairline">
                <div>
                  <label className="font-bold text-ink-high block mb-1">Official Application URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.applicationUrl}
                    onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                    placeholder="https://official-portal.gov.sa/apply"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-high block mb-1">Official Source Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.sourceName}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                    placeholder="e.g. NTDP Official Portal"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-high block mb-1">Official Source URL (Required for public verification) *</label>
                  <input
                    type="url"
                    value={formData.sourceUrl || ''}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    placeholder="https://ntdp.gov.sa/initiatives/mvplab"
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-high block mb-1">Application Deadline (Leave blank for rolling)</label>
                  <input
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full p-2 bg-white border border-editorial-hairline rounded-md text-ink-high"
                  />
                </div>
              </div>

              {/* Checkboxes & Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-editorial-hairline">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-bold text-ink-high">Published to Public Hub</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-medium text-ink-muted">Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-editorial-hairline text-ink-muted hover:text-ink-high rounded-md font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 bg-brand-navy text-white rounded-md font-bold uppercase tracking-wider hover:bg-brand-navy/90 flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingId ? 'Save Changes' : 'Create Opportunity'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
