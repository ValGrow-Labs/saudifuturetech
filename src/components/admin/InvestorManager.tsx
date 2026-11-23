'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';
import { investorTypeLabel } from '@/lib/labels';
import { PageHeading } from '@/components/ui/PageHeading';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { StatusDot, Note, type Tone } from '@/components/ui/StatusDot';
import {
  saveInvestorAction,
  verifyInvestorLicenseAction,
  toggleInvestorPublishAction,
  deleteInvestorAction,
  InvestorFormData
} from '@/actions/founder-admin';

interface InvestorManagerProps {
  initialInvestors: any[];
}

export const InvestorManager: React.FC<InvestorManagerProps> = ({ initialInvestors }) => {
  const [isPending, startTransition] = useTransition();
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [regFilter, setRegFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [publishFilter, setPublishFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState<InvestorFormData>({
    name: '',
    slug: '',
    type: 'VENTURE_CAPITAL' as any,
    hqLocation: 'Riyadh, KSA',
    logoUrl: '',
    websiteUrl: '',
    pitchUrl: '',
    isCmaAuthorized: false,
    cmaLicenseNumber: '',
    isSvcPartner: false,
    svcProgramDetails: '',
    regulatoryCategory: '',
    isActiveInvesting: true,
    isPublished: true,
    isFeatured: false,
    targetStages: [],
    targetSectors: [],
    checkSizeRange: '',
    portfolioHighlights: [],
    description: '',
    thesisSummary: '',
    sourceName: '',
    sourceUrl: '',
  });

  const [stagesText, setStagesText] = useState('');
  const [sectorsText, setSectorsText] = useState('');
  const [portfolioText, setPortfolioText] = useState('');

  // Filtered List
  const filteredInvestors = useMemo(() => {
    return initialInvestors.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.name.toLowerCase().includes(q) ||
        inv.description.toLowerCase().includes(q) ||
        inv.hqLocation.toLowerCase().includes(q) ||
        (inv.cmaLicenseNumber && inv.cmaLicenseNumber.toLowerCase().includes(q));

      const matchesType = typeFilter === 'ALL' || inv.type === typeFilter;

      const matchesReg =
        regFilter === 'ALL' ||
        (regFilter === 'CMA_ONLY' && inv.isCmaAuthorized) ||
        (regFilter === 'SVC_ONLY' && inv.isSvcPartner) ||
        (regFilter === 'UNREGULATED' && !inv.isCmaAuthorized && !inv.isSvcPartner);

      const matchesActive =
        activeFilter === 'ALL' ||
        (activeFilter === 'ACTIVE' && inv.isActiveInvesting) ||
        (activeFilter === 'CLOSED' && !inv.isActiveInvesting);

      const matchesPub =
        publishFilter === 'ALL' ||
        (publishFilter === 'PUBLISHED' && inv.isPublished) ||
        (publishFilter === 'DRAFT' && !inv.isPublished);

      return matchesSearch && matchesType && matchesReg && matchesActive && matchesPub;
    });
  }, [initialInvestors, searchQuery, typeFilter, regFilter, activeFilter, publishFilter]);

  // Metrics
  const totalCount = initialInvestors.length;
  const cmaCount = initialInvestors.filter((i) => i.isCmaAuthorized).length;
  const svcCount = initialInvestors.filter((i) => i.isSvcPartner).length;
  const liveCount = initialInvestors.filter((i) => i.isPublished).length;

  const handleOpenCreateModal = () => {
    setEditingInvestor(null);
    setFormData({
      name: '',
      slug: '',
      type: 'VENTURE_CAPITAL' as any,
      hqLocation: 'Riyadh, KSA',
      logoUrl: '',
      websiteUrl: '',
      pitchUrl: '',
      isCmaAuthorized: false,
      cmaLicenseNumber: '',
      isSvcPartner: false,
      svcProgramDetails: '',
      regulatoryCategory: 'CMA-Authorized Capital Market Institution',
      isActiveInvesting: true,
      isPublished: true,
      isFeatured: false,
      targetStages: ['Seed', 'Series A'],
      targetSectors: ['FinTech', 'AI & Deep Tech'],
      checkSizeRange: '$500K – $3M',
      portfolioHighlights: [],
      description: '',
      thesisSummary: '',
      sourceName: 'Capital Market Authority / Official Disclosure',
      sourceUrl: 'https://cma.org.sa',
    });
    setStagesText('Seed, Series A');
    setSectorsText('FinTech, AI & Deep Tech');
    setPortfolioText('');
    setActiveMessage(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inv: any) => {
    setEditingInvestor(inv);
    const stages = Array.isArray(inv.targetStages) ? (inv.targetStages as string[]) : [];
    const sectors = Array.isArray(inv.targetSectors) ? (inv.targetSectors as string[]) : [];
    const portfolio = Array.isArray(inv.portfolioHighlights) ? (inv.portfolioHighlights as string[]) : [];

    setFormData({
      name: inv.name,
      slug: inv.slug,
      type: inv.type,
      hqLocation: inv.hqLocation,
      logoUrl: inv.logoUrl || '',
      websiteUrl: inv.websiteUrl,
      pitchUrl: inv.pitchUrl || '',
      isCmaAuthorized: Boolean(inv.isCmaAuthorized),
      cmaLicenseNumber: inv.cmaLicenseNumber || '',
      isSvcPartner: Boolean(inv.isSvcPartner),
      svcProgramDetails: inv.svcProgramDetails || '',
      regulatoryCategory: inv.regulatoryCategory || '',
      isActiveInvesting: Boolean(inv.isActiveInvesting),
      isPublished: Boolean(inv.isPublished),
      isFeatured: Boolean(inv.isFeatured),
      targetStages: stages,
      targetSectors: sectors,
      checkSizeRange: inv.checkSizeRange || '',
      portfolioHighlights: portfolio,
      description: inv.description,
      thesisSummary: inv.thesisSummary || '',
      sourceName: inv.sourceName || '',
      sourceUrl: inv.sourceUrl || '',
    });

    setStagesText(stages.join(', '));
    setSectorsText(sectors.join(', '));
    setPortfolioText(portfolio.join(', '));
    setActiveMessage(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveMessage(null);
    setErrorMessage(null);

    const stages = stagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const sectors = sectorsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const portfolio = portfolioText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: InvestorFormData = {
      ...formData,
      targetStages: stages,
      targetSectors: sectors,
      portfolioHighlights: portfolio,
    };

    startTransition(async () => {
      const res = await saveInvestorAction(payload, editingInvestor?.id);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setActiveMessage(
          editingInvestor ? `Saved "${formData.name}".` : `Created "${formData.name}".`
        );
        setIsModalOpen(false);
      }
    });
  };

  const handleTogglePublish = (id: string) => {
    setActiveMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      const res = await toggleInvestorPublishAction(id);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setActiveMessage('Visibility changed.');
      }
    });
  };

  const handleVerifyLicense = (id: string) => {
    setActiveMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      const res = await verifyInvestorLicenseAction(id);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setActiveMessage('Marked as checked today.');
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
      return;
    }
    setActiveMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      const res = await deleteInvestorAction(id);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setActiveMessage(`Deleted "${name}".`);
      }
    });
  };

  const typeOptions = ['VENTURE_CAPITAL', 'GOVERNMENT_FUND', 'CORPORATE_VC', 'ANGEL_NETWORK', 'FAMILY_OFFICE', 'ACCELERATOR_FUND'];

  return (
    <div className="space-y-6">
      <PageHeading
        title="Investors"
        description="Funds, angel networks and family offices listed in the investor directory."
      >
        <Button type="button" onClick={handleOpenCreateModal}>
          Add investor
        </Button>
      </PageHeading>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 max-w-3xl">
        <StatCard label="Listed" value={String(totalCount)} change="" trend="neutral" description="" />
        <StatCard label="CMA authorised" value={String(cmaCount)} change="" trend="neutral" description="" />
        <StatCard label="SVC partners" value={String(svcCount)} change="" trend="neutral" description="" />
        <StatCard label="Published" value={String(liveCount)} change="" trend="neutral" description="" />
      </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-3">
        <div>
          <label htmlFor="inv-search" className="field-label">
            Search
          </label>
          <input
            id="inv-search"
            type="search"
            placeholder="Name, city or CMA licence"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="inv-type" className="field-label">
            Type
          </label>
          <select id="inv-type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="field">
            <option value="ALL">All types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {investorTypeLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="inv-reg" className="field-label">
            Regulation
          </label>
          <select id="inv-reg" value={regFilter} onChange={(e) => setRegFilter(e.target.value)} className="field">
            <option value="ALL">All</option>
            <option value="CMA_ONLY">CMA authorised</option>
            <option value="SVC_ONLY">SVC partners</option>
            <option value="UNREGULATED">Neither</option>
          </select>
        </div>
        <div>
          <label htmlFor="inv-active" className="field-label">
            Investing
          </label>
          <select id="inv-active" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="field">
            <option value="ALL">All</option>
            <option value="ACTIVE">Actively investing</option>
            <option value="CLOSED">Not investing</option>
          </select>
        </div>
        <div>
          <label htmlFor="inv-published" className="field-label">
            Visibility
          </label>
          <select id="inv-published" value={publishFilter} onChange={(e) => setPublishFilter(e.target.value)} className="field">
            <option value="ALL">Published and drafts</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Drafts</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="meta">
          {filteredInvestors.length} of {totalCount} investors
        </p>
        {isPending && <p className="meta">Saving…</p>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table min-w-[960px]">
          <thead>
            <tr>
              <th>Investor</th>
              <th>Type</th>
              <th>Cheque size</th>
              <th>Regulation</th>
              <th>Last checked</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvestors.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10">
                  <p className="font-serif text-lg text-ink">No investors match these filters.</p>
                  <p className="mt-1 text-sm text-ink-3">Clear the search or add an investor.</p>
                </td>
              </tr>
            ) : (
              filteredInvestors.map((inv) => (
                <tr key={inv.id}>
                  <td className="min-w-[220px] max-w-xs">
                    <div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(inv)}
                        className="font-serif text-[1.0625rem] leading-snug text-ink text-left hover:text-clay transition-colors"
                      >
                        {inv.name}
                      </button>
                      {inv.isFeatured && <span className="ml-2 font-sans text-[0.6875rem] text-clay whitespace-nowrap">Featured</span>}
                    </div>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-3">{inv.hqLocation}</p>
                    <p className="mt-0.5 whitespace-nowrap font-sans text-[0.71875rem] text-ink-4">/{inv.slug}</p>
                  </td>

                  <td className="whitespace-nowrap text-ink-2">{investorTypeLabel(inv.type)}</td>

                  <td className="max-w-[180px]">
                    <p className="font-sans tabular text-[0.8125rem] text-ink">{inv.checkSizeRange || '—'}</p>
                  </td>

                  <td className="whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      {inv.isCmaAuthorized && <StatusDot tone="moss">CMA authorised</StatusDot>}
                      {inv.isSvcPartner && <StatusDot tone="moss">SVC partner</StatusDot>}
                      {!inv.isCmaAuthorized && !inv.isSvcPartner && (
                        <span className="text-[0.8125rem] text-ink-3 whitespace-normal max-w-[180px]">
                          {inv.regulatoryCategory || 'Not regulated'}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="whitespace-nowrap">
                    <p className="whitespace-nowrap font-sans tabular text-[0.8125rem] text-ink-2">
                      {inv.verifiedAt ? formatDate(inv.verifiedAt) : '—'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleVerifyLicense(inv.id)}
                      disabled={isPending}
                      className="row-action block mt-1 disabled:opacity-50"
                    >
                      Mark checked
                    </button>
                  </td>

                  <td className="whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(inv.id)}
                        disabled={isPending}
                        title={inv.isPublished ? 'Click to unpublish' : 'Click to publish'}
                        className="disabled:opacity-50 hover:opacity-70 transition-opacity"
                      >
                        <StatusDot tone={inv.isPublished ? 'moss' : 'ink'}>{inv.isPublished ? 'Published' : 'Draft'}</StatusDot>
                      </button>
                      {!inv.isActiveInvesting && <StatusDot tone="ink">Not investing</StatusDot>}
                    </div>
                  </td>

                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(inv)}
                        disabled={isPending}
                        className="row-action disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <Link href={`/investor/${inv.slug}`} target="_blank" className="row-action">
                        View ↗
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(inv.id, inv.name)}
                        disabled={isPending}
                        className="row-action-danger disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
            aria-labelledby="inv-modal-title"
            className="bg-paper-sheet border border-rule shadow-lift rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-rule">
              <h2 id="inv-modal-title" className="font-serif text-[1.5rem] leading-tight text-ink">
                {editingInvestor ? `Edit ${editingInvestor.name}` : 'Add investor'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="row-action">
                Close
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {errorMessage && (
                <Note tone="error" onDismiss={() => setErrorMessage(null)}>
                  {errorMessage}
                </Note>
              )}

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Organisation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inv-name" className="field-label">
                      Name
                    </label>
                    <input
                      id="inv-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="STV"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="inv-slug" className="field-label">
                      Slug
                    </label>
                    <input
                      id="inv-slug"
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="stv"
                      className="field font-sans"
                    />
                    <p className="field-hint">Leave blank to generate from the name.</p>
                  </div>
                  <div>
                    <label htmlFor="inv-type-f" className="field-label">
                      Type
                    </label>
                    <select
                      id="inv-type-f"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="field"
                    >
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>
                          {investorTypeLabel(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="inv-hq" className="field-label">
                      Headquarters
                    </label>
                    <input
                      id="inv-hq"
                      type="text"
                      required
                      value={formData.hqLocation}
                      onChange={(e) => setFormData({ ...formData, hqLocation: e.target.value })}
                      placeholder="Riyadh, KSA"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="inv-website" className="field-label">
                      Website
                    </label>
                    <input
                      id="inv-website"
                      type="url"
                      required
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      placeholder="https://stv.vc"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="inv-pitch" className="field-label">
                      Pitch link
                    </label>
                    <input
                      id="inv-pitch"
                      type="url"
                      value={formData.pitchUrl || ''}
                      onChange={(e) => setFormData({ ...formData, pitchUrl: e.target.value })}
                      placeholder="https://stv.vc/founders"
                      className="field"
                    />
                    <p className="field-hint">Leave blank if they only take referrals.</p>
                  </div>
                </div>
              </section>

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Regulation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isCmaAuthorized}
                        onChange={(e) => setFormData({ ...formData, isCmaAuthorized: e.target.checked })}
                        className="accent-[#0B6E45]"
                      />
                      Authorised by the CMA
                    </label>
                    {formData.isCmaAuthorized && (
                      <div>
                        <label htmlFor="inv-cma" className="field-label">
                          CMA licence number
                        </label>
                        <input
                          id="inv-cma"
                          type="text"
                          placeholder="17188-37"
                          value={formData.cmaLicenseNumber || ''}
                          onChange={(e) => setFormData({ ...formData, cmaLicenseNumber: e.target.value })}
                          className="field font-sans tabular"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isSvcPartner}
                        onChange={(e) => setFormData({ ...formData, isSvcPartner: e.target.checked })}
                        className="accent-[#0B6E45]"
                      />
                      SVC partner or co-investee
                    </label>
                    {formData.isSvcPartner && (
                      <div>
                        <label htmlFor="inv-svc" className="field-label">
                          SVC programme
                        </label>
                        <input
                          id="inv-svc"
                          type="text"
                          placeholder="Investment in Funds Program"
                          value={formData.svcProgramDetails || ''}
                          onChange={(e) => setFormData({ ...formData, svcProgramDetails: e.target.value })}
                          className="field"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="inv-regcat" className="field-label">
                    Regulatory category
                  </label>
                  <input
                    id="inv-regcat"
                    type="text"
                    value={formData.regulatoryCategory || ''}
                    onChange={(e) => setFormData({ ...formData, regulatoryCategory: e.target.value })}
                    placeholder="CMA-authorised fund manager"
                    className="field"
                  />
                </div>
              </section>

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Investing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inv-check" className="field-label">
                      Cheque size
                    </label>
                    <input
                      id="inv-check"
                      type="text"
                      value={formData.checkSizeRange || ''}
                      onChange={(e) => setFormData({ ...formData, checkSizeRange: e.target.value })}
                      placeholder="$2M – $20M"
                      className="field font-sans tabular"
                    />
                  </div>
                  <div>
                    <label htmlFor="inv-stages" className="field-label">
                      Stages
                    </label>
                    <input
                      id="inv-stages"
                      type="text"
                      value={stagesText}
                      onChange={(e) => setStagesText(e.target.value)}
                      placeholder="Seed, Series A, Series B"
                      className="field"
                    />
                    <p className="field-hint">Separate with commas.</p>
                  </div>
                  <div>
                    <label htmlFor="inv-sectors" className="field-label">
                      Sectors
                    </label>
                    <input
                      id="inv-sectors"
                      type="text"
                      value={sectorsText}
                      onChange={(e) => setSectorsText(e.target.value)}
                      placeholder="FinTech, AI & Deep Tech"
                      className="field"
                    />
                    <p className="field-hint">Separate with commas.</p>
                  </div>
                  <div>
                    <label htmlFor="inv-portfolio" className="field-label">
                      Portfolio highlights
                    </label>
                    <input
                      id="inv-portfolio"
                      type="text"
                      value={portfolioText}
                      onChange={(e) => setPortfolioText(e.target.value)}
                      placeholder="Jahez, Tamara, Lucidya"
                      className="field"
                    />
                    <p className="field-hint">Separate with commas.</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="inv-description" className="field-label">
                    Description
                  </label>
                  <textarea
                    id="inv-description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Fund size, main backers and what they invest in."
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="inv-thesis" className="field-label">
                    Investment thesis
                  </label>
                  <textarea
                    id="inv-thesis"
                    rows={2}
                    value={formData.thesisSummary || ''}
                    onChange={(e) => setFormData({ ...formData, thesisSummary: e.target.value })}
                    placeholder="One or two sentences on what they look for."
                    className="field"
                  />
                </div>
              </section>

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Source and visibility</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inv-source-name" className="field-label">
                      Source
                    </label>
                    <input
                      id="inv-source-name"
                      type="text"
                      required
                      value={formData.sourceName}
                      onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                      placeholder="CMA directory"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="inv-source-url" className="field-label">
                      Source URL
                    </label>
                    <input
                      id="inv-source-url"
                      type="url"
                      value={formData.sourceUrl || ''}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://cma.org.sa"
                      className="field"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                  <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActiveInvesting}
                      onChange={(e) => setFormData({ ...formData, isActiveInvesting: e.target.checked })}
                      className="accent-[#0B6E45]"
                    />
                    Actively investing
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="accent-[#0B6E45]"
                    />
                    Featured
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="accent-[#0B6E45]"
                    />
                    Published
                  </label>
                </div>
              </section>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving…' : editingInvestor ? 'Save changes' : 'Create investor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
