'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';
import { opportunityTypeLabel, deadlineInfo, shortEquity } from '@/lib/labels';
import { PageHeading } from '@/components/ui/PageHeading';
import { Button } from '@/components/ui/Button';
import {
  verifyOpportunityAction,
  updateOpportunityStatusAction,
  deleteOpportunityAction,
  toggleOpportunityPublishAction,
  saveOpportunityAction,
  OpportunityFormData
} from '@/actions/founder-admin';
import { OpportunityCategory, OpportunityStatus } from '@prisma/client';

import { StatusDot, Note, DOT_BG, type Tone } from '@/components/ui/StatusDot';
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
        setActiveMessage(editingId ? `Saved "${formData.title}".` : `Created "${formData.title}".`);
        setErrorMessage(null);
        setIsModalOpen(false);
      } else {
        setErrorMessage(res.error || "We couldn't save this opportunity. Try again.");
      }
    });
  };

  const handleVerify = (id: string, title: string) => {
    startTransition(async () => {
      const res = await verifyOpportunityAction(id);
      if (res.success) {
        setActiveMessage(`Marked "${title}" as checked today.`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || "We couldn't update the check date. Try again.");
      }
    });
  };

  const handleTogglePublish = (id: string, title: string) => {
    startTransition(async () => {
      const res = await toggleOpportunityPublishAction(id);
      if (res.success) {
        setActiveMessage(`Changed visibility of "${title}".`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || "We couldn't change visibility. Try again.");
      }
    });
  };

  const handleStatusChange = (id: string, status: OpportunityStatus) => {
    startTransition(async () => {
      const res = await updateOpportunityStatusAction(id, status);
      if (res.success) {
        setActiveMessage(`Status changed to ${STATUS_META[status]?.label ?? status}.`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || "We couldn't change the status. Try again.");
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteOpportunityAction(id);
      if (res.success) {
        setActiveMessage(`Deleted "${title}".`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || "We couldn't delete this. Try again.");
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

  const typeOptions: OpportunityCategory[] = [
    OpportunityCategory.GRANT,
    OpportunityCategory.ACCELERATOR,
    OpportunityCategory.INCUBATOR,
    OpportunityCategory.SUBSIDY,
    OpportunityCategory.GOVERNMENT_PROGRAM,
    OpportunityCategory.SUBSIDIZED_PERK,
    OpportunityCategory.HACKATHON,
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        title="Opportunities"
        description="Grants, accelerators, subsidies and programmes listed in the directory."
      >
        <Button type="button" onClick={openCreateModal}>
          Add opportunity
        </Button>
      </PageHeading>

      {activeMessage && (
        <Note tone="success" onDismiss={() => setActiveMessage(null)}>
          {activeMessage}
        </Note>
      )}
      {errorMessage && !isModalOpen && (
        <Note tone="error" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Note>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-3">
        <div>
          <label htmlFor="opp-search" className="field-label">
            Search
          </label>
          <input
            id="opp-search"
            type="search"
            placeholder="Title or organisation"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="opp-type" className="field-label">
            Type
          </label>
          <select id="opp-type" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="field">
            <option value="ALL">All types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {opportunityTypeLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="opp-status" className="field-label">
            Status
          </label>
          <select id="opp-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="field">
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="opp-published" className="field-label">
            Visibility
          </label>
          <select id="opp-published" value={publishFilter} onChange={(e) => setPublishFilter(e.target.value)} className="field">
            <option value="ALL">Published and drafts</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Drafts</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="meta">
          {filteredList.length} of {opportunities.length} opportunities
        </p>
        {isPending && <p className="meta">Saving…</p>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table min-w-[960px]">
          <thead>
            <tr>
              <th>Opportunity</th>
              <th>Type</th>
              <th>Funding</th>
              <th>Deadline</th>
              <th>Last checked</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10">
                  <p className="font-serif text-lg text-ink">No opportunities match these filters.</p>
                  <p className="mt-1 text-sm text-ink-3">Clear the search or choose a different status.</p>
                </td>
              </tr>
            ) : (
              filteredList.map((opp) => {
                const dl = deadlineInfo(opp.deadline, opp.status);
                return (
                  <tr key={opp.id}>
                    <td className="min-w-[220px] max-w-xs">
                      <button
                        type="button"
                        onClick={() => openEditModal(opp)}
                        className="font-serif text-[1.0625rem] leading-snug text-ink text-left hover:text-clay transition-colors"
                      >
                        {opp.title}
                      </button>
                      <p className="mt-0.5 text-[0.8125rem] text-ink-3">{opp.organization}</p>
                    </td>

                    <td className="whitespace-nowrap">
                      <p className="whitespace-nowrap text-ink-2">{opportunityTypeLabel(opp.category)}</p>
                      {opp.categoryRel && <p className="mt-0.5 text-[0.8125rem] text-ink-3">{opp.categoryRel.name}</p>}
                    </td>

                    <td className="max-w-[180px]">
                      <p className="whitespace-nowrap font-sans tabular text-[0.8125rem] text-ink truncate">{opp.fundingAmount || '—'}</p>
                      <p className="mt-0.5 font-sans tabular text-[0.75rem] text-ink-3 truncate">
                        Equity {shortEquity(opp.equityTaken)}
                      </p>
                    </td>

                    <td className="whitespace-nowrap">
                      <p className="whitespace-nowrap font-sans tabular text-[0.8125rem] text-ink">{dl.date}</p>
                      <p className={cn('mt-0.5 whitespace-nowrap font-sans tabular text-[0.75rem]', dl.urgent ? 'text-alert' : 'text-ink-3')}>
                        {opp.deadline ? dl.note : 'Rolling'}
                      </p>
                    </td>

                    <td className="whitespace-nowrap">
                      <p className="whitespace-nowrap font-sans tabular text-[0.8125rem] text-ink-2">
                        {opp.verifiedAt ? formatDate(opp.verifiedAt) : '—'}
                      </p>
                      {opp.verifiedBy && (
                        <p className="mt-0.5 text-[0.75rem] text-ink-3 truncate max-w-[150px]">by {opp.verifiedBy}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => handleVerify(opp.id, opp.title)}
                        disabled={isPending}
                        className="row-action mt-1 disabled:opacity-50"
                      >
                        Mark checked
                      </button>
                    </td>

                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_BG[STATUS_META[opp.status as OpportunityStatus]?.tone ?? 'ink'])}
                          aria-hidden="true"
                        />
                        <select
                          aria-label={`Status for ${opp.title}`}
                          value={opp.status}
                          onChange={(e) => handleStatusChange(opp.id, e.target.value as OpportunityStatus)}
                          disabled={isPending}
                          className="field !w-auto !py-1 !pl-2 !text-[0.8125rem]"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_META[s].label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(opp.id, opp.title)}
                        disabled={isPending}
                        title={opp.isPublished ? 'Click to unpublish' : 'Click to publish'}
                        className="mt-2 disabled:opacity-50 hover:opacity-70 transition-opacity"
                      >
                        <StatusDot tone={opp.isPublished ? 'moss' : 'ink'}>
                          {opp.isPublished ? 'Published' : 'Draft'}
                        </StatusDot>
                      </button>
                    </td>

                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-4">
                        <button type="button" onClick={() => openEditModal(opp)} className="row-action">
                          Edit
                        </button>
                        <Link href={`/opportunity/${opp.slug}`} target="_blank" className="row-action">
                          View ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(opp.id, opp.title)}
                          disabled={isPending}
                          className="row-action-danger disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-ink/40">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="opp-modal-title"
            className="bg-paper-sheet border border-rule shadow-lift rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-rule">
              <h2 id="opp-modal-title" className="font-serif text-[1.5rem] leading-tight text-ink">
                {editingId ? 'Edit opportunity' : 'Add opportunity'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="row-action">
                Close
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
              {errorMessage && (
                <Note tone="error" onDismiss={() => setErrorMessage(null)}>
                  {errorMessage}
                </Note>
              )}

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Basics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="opp-title" className="field-label">
                      Title
                    </label>
                    <input
                      id="opp-title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="NTDP MVPLab Grant"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="opp-org" className="field-label">
                      Organisation
                    </label>
                    <input
                      id="opp-org"
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="NTDP, The Garage, SAMA"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="opp-category" className="field-label">
                      Type
                    </label>
                    <select
                      id="opp-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as OpportunityCategory })}
                      className="field"
                    >
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>
                          {opportunityTypeLabel(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="opp-section" className="field-label">
                      Section
                    </label>
                    <select
                      id="opp-section"
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || null })}
                      className="field"
                    >
                      <option value="">None</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="opp-funding" className="field-label">
                      Funding amount
                    </label>
                    <input
                      id="opp-funding"
                      type="text"
                      value={formData.fundingAmount || ''}
                      onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
                      placeholder="Up to SAR 150,000"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="opp-equity" className="field-label">
                      Equity taken
                    </label>
                    <input
                      id="opp-equity"
                      type="text"
                      value={formData.equityTaken || ''}
                      onChange={(e) => setFormData({ ...formData, equityTaken: e.target.value })}
                      placeholder="0% (Non-Dilutive)"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="opp-location" className="field-label">
                      Location
                    </label>
                    <input
                      id="opp-location"
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Riyadh, KSA (Hybrid)"
                      className="field"
                    />
                  </div>
                </div>
              </section>

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Description and eligibility</h3>
                <div>
                  <label htmlFor="opp-description" className="field-label">
                    Description
                  </label>
                  <textarea
                    id="opp-description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What the programme offers and who runs it."
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="opp-elig-summary" className="field-label">
                    Eligibility summary
                  </label>
                  <input
                    id="opp-elig-summary"
                    type="text"
                    value={formData.eligibilitySummary || ''}
                    onChange={(e) => setFormData({ ...formData, eligibilitySummary: e.target.value })}
                    placeholder="Pre-seed Saudi tech companies with a commercial registration."
                    className="field"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="opp-criteria" className="field-label">
                      Eligibility criteria
                    </label>
                    <textarea
                      id="opp-criteria"
                      rows={5}
                      value={criteriaText}
                      onChange={(e) => setCriteriaText(e.target.value)}
                      placeholder={'Saudi commercial registration\nWorking MVP\nAt least one Saudi founder'}
                      className="field font-sans text-[0.8125rem]"
                    />
                    <p className="field-hint">One per line.</p>
                  </div>
                  <div>
                    <label htmlFor="opp-benefits" className="field-label">
                      Benefits
                    </label>
                    <textarea
                      id="opp-benefits"
                      rows={5}
                      value={benefitsText}
                      onChange={(e) => setBenefitsText(e.target.value)}
                      placeholder={'SAR 150K grant, no equity\nKACST lab access\nMentoring'}
                      className="field font-sans text-[0.8125rem]"
                    />
                    <p className="field-hint">One per line.</p>
                  </div>
                  <div>
                    <label htmlFor="opp-requirements" className="field-label">
                      Requirements
                    </label>
                    <textarea
                      id="opp-requirements"
                      rows={5}
                      value={requirementsText}
                      onChange={(e) => setRequirementsText(e.target.value)}
                      placeholder={'Pitch deck\nArchitecture overview\nIncorporation papers'}
                      className="field font-sans text-[0.8125rem]"
                    />
                    <p className="field-hint">One per line.</p>
                  </div>
                </div>
              </section>

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Applying and source</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="opp-apply-url" className="field-label">
                      Application URL
                    </label>
                    <input
                      id="opp-apply-url"
                      type="url"
                      required
                      value={formData.applicationUrl}
                      onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                      placeholder="https://example.gov.sa/apply"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="opp-deadline" className="field-label">
                      Deadline
                    </label>
                    <input
                      id="opp-deadline"
                      type="date"
                      value={formData.deadline || ''}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="field font-sans tabular"
                    />
                    <p className="field-hint">Leave blank for rolling applications.</p>
                  </div>
                  <div>
                    <label htmlFor="opp-source-name" className="field-label">
                      Source
                    </label>
                    <input
                      id="opp-source-name"
                      type="text"
                      required
                      value={formData.sourceName}
                      onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                      placeholder="NTDP official site"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="opp-source-url" className="field-label">
                      Source URL
                    </label>
                    <input
                      id="opp-source-url"
                      type="url"
                      value={formData.sourceUrl || ''}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://ntdp.gov.sa/initiatives/mvplab"
                      className="field"
                    />
                    <p className="field-hint">Shown to readers as the source link.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                  <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="accent-[#0B6E45]"
                    />
                    Published
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="accent-[#0B6E45]"
                    />
                    Feature on homepage
                  </label>
                </div>
              </section>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving…' : editingId ? 'Save changes' : 'Create opportunity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const STATUS_OPTIONS: OpportunityStatus[] = [
  OpportunityStatus.OPEN,
  OpportunityStatus.CLOSING_SOON,
  OpportunityStatus.ROLLING,
  OpportunityStatus.CLOSED,
];

const STATUS_META: Record<OpportunityStatus, { label: string; tone: Tone }> = {
  OPEN: { label: 'Open', tone: 'moss' },
  CLOSING_SOON: { label: 'Closing soon', tone: 'clay' },
  ROLLING: { label: 'Rolling', tone: 'moss' },
  CLOSED: { label: 'Closed', tone: 'ink' },
};
