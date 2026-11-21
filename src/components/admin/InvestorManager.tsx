'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  Trash2, 
  Loader2, 
  Check, 
  X,
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Eye, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  Landmark,
  Layers,
  TrendingUp,
  FileText
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
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
          editingInvestor ? 'Investor updated successfully.' : 'New investor profile created.'
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
        setActiveMessage('Publication status updated.');
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
        setActiveMessage('Investor license verification re-attested.');
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete '${name}'? This action cannot be undone.`)) {
      return;
    }
    setActiveMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      const res = await deleteInvestorAction(id);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setActiveMessage(`Investor '${name}' deleted successfully.`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Global Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-editorial-pure p-4 rounded-none border border-editorial-hairline shadow-xs">
          <div className="text-2xl font-bold font-heading text-ink-high">{totalCount}</div>
          <div className="text-xs text-ink-muted">Total Funds Tracked</div>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-none border border-emerald-200 shadow-xs">
          <div className="text-2xl font-bold font-heading text-emerald-900">{cmaCount}</div>
          <div className="text-xs text-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>CMA Authorized</span>
          </div>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-none border border-amber-200 shadow-xs">
          <div className="text-2xl font-bold font-heading text-amber-900">{svcCount}</div>
          <div className="text-xs text-amber-800 flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5 text-amber-700" />
            <span>SVC Partner Funds</span>
          </div>
        </div>

        <div className="bg-brand-oasis/10 p-4 rounded-none border border-brand-oasis/20 shadow-xs">
          <div className="text-2xl font-bold font-heading text-brand-oasis">{liveCount}</div>
          <div className="text-xs text-brand-oasis font-medium flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Publicly Live Dossiers</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {activeMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{activeMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Search & Controls Bar */}
      <div className="bg-editorial-pure p-4 rounded-none border border-editorial-hairline shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search investors by name, HQ, CMA license, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-editorial-sand/40 border border-editorial-hairline rounded-none text-ink-high focus:outline-none focus:border-brand-navy"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-opacity-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Investor</span>
          </button>
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-editorial-hairline text-xs">
          <div className="flex items-center gap-1 text-ink-muted">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Typology */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2 py-1 bg-editorial-pure border border-editorial-hairline text-xs text-ink-high rounded-none"
          >
            <option value="ALL">All Typologies</option>
            <option value="VENTURE_CAPITAL">Venture Capital</option>
            <option value="GOVERNMENT_FUND">Sovereign / Gov Fund</option>
            <option value="CORPORATE_VC">Corporate VC (CVC)</option>
            <option value="ANGEL_NETWORK">Angel Syndicate</option>
            <option value="FAMILY_OFFICE">Family Office</option>
            <option value="ACCELERATOR_FUND">Accelerator Fund</option>
          </select>

          {/* Regulatory */}
          <select
            value={regFilter}
            onChange={(e) => setRegFilter(e.target.value)}
            className="px-2 py-1 bg-editorial-pure border border-editorial-hairline text-xs text-ink-high rounded-none"
          >
            <option value="ALL">All Regulatory Standings</option>
            <option value="CMA_ONLY">CMA Authorized Only</option>
            <option value="SVC_ONLY">SVC Partners Only</option>
            <option value="UNREGULATED">Non-CMA / Syndicates</option>
          </select>

          {/* Active Status */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-2 py-1 bg-editorial-pure border border-editorial-hairline text-xs text-ink-high rounded-none"
          >
            <option value="ALL">All Deployment Mandates</option>
            <option value="ACTIVE">Actively Deploying</option>
            <option value="CLOSED">Closed Allocations</option>
          </select>

          {/* Publish */}
          <select
            value={publishFilter}
            onChange={(e) => setPublishFilter(e.target.value)}
            className="px-2 py-1 bg-editorial-pure border border-editorial-hairline text-xs text-ink-high rounded-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published Live</option>
            <option value="DRAFT">Draft / Hidden</option>
          </select>
        </div>
      </div>

      {/* 3. Table of Investors */}
      <div className="bg-editorial-pure rounded-none border border-editorial-hairline shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-editorial-hairline bg-editorial-sand/30 text-ink-muted uppercase font-bold tracking-wider text-[10px]">
              <th className="py-3 px-4">Organization &amp; Mandate</th>
              <th className="py-3 px-3">Typology</th>
              <th className="py-3 px-3">Check Size</th>
              <th className="py-3 px-3">Regulatory Standing</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-editorial-hairline">
            {filteredInvestors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink-muted">
                  No investors found matching the selected criteria.
                </td>
              </tr>
            ) : (
              filteredInvestors.map((inv) => (
                <tr key={inv.id} className="hover:bg-editorial-sand/20 transition-colors">
                  {/* Name & Slug */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/investor/${inv.slug}`}
                        target="_blank"
                        className="font-bold text-ink-high hover:text-brand-navy hover:underline flex items-center gap-1"
                      >
                        <span>{inv.name}</span>
                        <ExternalLink className="w-3 h-3 text-ink-faint" />
                      </Link>
                      {inv.isFeatured && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-brand-desertGold/15 text-brand-navy">
                          Anchor
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-faint flex items-center gap-2 pt-0.5">
                      <span>/{inv.slug}</span>
                      <span>•</span>
                      <span>{inv.hqLocation}</span>
                    </div>
                  </td>

                  {/* Typology */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-sand text-brand-navy">
                      {inv.type}
                    </span>
                  </td>

                  {/* Check Size */}
                  <td className="py-3 px-3 font-medium text-ink-high">
                    {inv.checkSizeRange || 'Unspecified'}
                  </td>

                  {/* Regulatory Badges */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      {inv.isCmaAuthorized ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>CMA Authorized</span>
                        </span>
                      ) : null}

                      {inv.isSvcPartner ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Landmark className="w-3 h-3 text-amber-700" />
                          <span>SVC Partner</span>
                        </span>
                      ) : null}

                      {!inv.isCmaAuthorized && !inv.isSvcPartner && (
                        <span className="text-[10px] text-ink-faint italic">
                          {inv.regulatoryCategory || 'Private Syndicate'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Publication Toggle */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleTogglePublish(inv.id)}
                      disabled={isPending}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold transition-all',
                        inv.isPublished
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-editorial-sand text-ink-muted hover:bg-editorial-sand/80'
                      )}
                    >
                      {inv.isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleVerifyLicense(inv.id)}
                        disabled={isPending}
                        title="Re-verify license and provenance"
                        className="p-1 rounded text-ink-muted hover:text-emerald-700 hover:bg-editorial-sand"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(inv)}
                        disabled={isPending}
                        title="Edit dossier"
                        className="p-1 rounded text-ink-muted hover:text-ink-high hover:bg-editorial-sand"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(inv.id, inv.name)}
                        disabled={isPending}
                        title="Delete investor"
                        className="p-1 rounded text-ink-muted hover:text-red-700 hover:bg-editorial-sand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-editorial-pure rounded-lg border border-editorial-hairline shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-editorial-hairline flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-ink-high">
                  {editingInvestor ? `Edit Investor: ${editingInvestor.name}` : 'Register New Institutional Investor'}
                </h3>
                <p className="text-xs text-ink-muted">
                  Strict regulatory classification: verify CMA license and SVC participation separately.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-ink-muted hover:text-ink-high"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Organization Name */}
                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Organization Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. STV (Saudi Technology Ventures)"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. stv-vc (leave empty to auto-generate)"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high font-mono"
                  />
                </div>

                {/* Typology */}
                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Institutional Typology <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 bg-editorial-pure border border-editorial-hairline rounded text-ink-high"
                  >
                    <option value="VENTURE_CAPITAL">Venture Capital</option>
                    <option value="GOVERNMENT_FUND">Sovereign Wealth / Government Fund</option>
                    <option value="CORPORATE_VC">Corporate Venture Capital (CVC)</option>
                    <option value="ANGEL_NETWORK">Angel Syndicate</option>
                    <option value="FAMILY_OFFICE">Family Office</option>
                    <option value="ACCELERATOR_FUND">Accelerator Seed Fund</option>
                  </select>
                </div>

                {/* HQ Location */}
                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Headquarters Location <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hqLocation}
                    onChange={(e) => setFormData({ ...formData, hqLocation: e.target.value })}
                    placeholder="e.g. Riyadh, KSA"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>

                {/* Official Website */}
                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Official Website URL <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://stv.vc"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>

                {/* Pitch URL */}
                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Public Pitch Link (Omit if private/referral-only)
                  </label>
                  <input
                    type="url"
                    value={formData.pitchUrl || ''}
                    onChange={(e) => setFormData({ ...formData, pitchUrl: e.target.value })}
                    placeholder="https://stv.vc/founders"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>
              </div>

              {/* Strict Regulatory Section */}
              <div className="p-4 bg-emerald-50/50 rounded border border-emerald-200/80 space-y-3">
                <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-950 block">
                  Regulatory Classification &amp; Evidence
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CMA Authorized */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 font-bold text-emerald-900">
                      <input
                        type="checkbox"
                        checked={formData.isCmaAuthorized}
                        onChange={(e) => setFormData({ ...formData, isCmaAuthorized: e.target.checked })}
                        className="rounded border-emerald-300"
                      />
                      <span>CMA-Authorized Capital Market Institution</span>
                    </label>
                    {formData.isCmaAuthorized && (
                      <input
                        type="text"
                        placeholder="CMA License No. (e.g. License No. 17188-37)"
                        value={formData.cmaLicenseNumber || ''}
                        onChange={(e) => setFormData({ ...formData, cmaLicenseNumber: e.target.value })}
                        className="w-full p-2 bg-white border border-emerald-300 rounded font-mono text-emerald-900 text-xs"
                      />
                    )}
                  </div>

                  {/* SVC Partner */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 font-bold text-emerald-900">
                      <input
                        type="checkbox"
                        checked={formData.isSvcPartner}
                        onChange={(e) => setFormData({ ...formData, isSvcPartner: e.target.checked })}
                        className="rounded border-emerald-300"
                      />
                      <span>SVC Partner / Co-Investment Recipient</span>
                    </label>
                    {formData.isSvcPartner && (
                      <input
                        type="text"
                        placeholder="SVC Program (e.g. Investment in Funds Program)"
                        value={formData.svcProgramDetails || ''}
                        onChange={(e) => setFormData({ ...formData, svcProgramDetails: e.target.value })}
                        className="w-full p-2 bg-white border border-emerald-300 rounded text-emerald-900 text-xs"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">
                    Regulatory Category Descriptor
                  </label>
                  <input
                    type="text"
                    value={formData.regulatoryCategory || ''}
                    onChange={(e) => setFormData({ ...formData, regulatoryCategory: e.target.value })}
                    placeholder="e.g. CMA-Authorized Fund Manager / Sovereign Fund-of-Funds"
                    className="w-full p-2 bg-white border border-emerald-300 rounded text-emerald-900"
                  />
                </div>
              </div>

              {/* Investment Mandates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Disclosed Check Size Range
                  </label>
                  <input
                    type="text"
                    value={formData.checkSizeRange || ''}
                    onChange={(e) => setFormData({ ...formData, checkSizeRange: e.target.value })}
                    placeholder="e.g. $2M – $20M (Disclosed Lead Ticket)"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Target Stages (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={stagesText}
                    onChange={(e) => setStagesText(e.target.value)}
                    placeholder="Seed, Series A, Series B, Growth"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Sectors &amp; Sovereign Pillars (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={sectorsText}
                    onChange={(e) => setSectorsText(e.target.value)}
                    placeholder="FinTech, AI & Deep Tech, Clean Energy"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Verified Portfolio Highlights (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={portfolioText}
                    onChange={(e) => setPortfolioText(e.target.value)}
                    placeholder="Jahez, Tamara, Lucidya, Unifonic"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-ink-high block mb-1">
                  Institutional Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive institutional overview of the fund, fund size, anchor LPs, and market position."
                  className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                />
              </div>

              {/* Thesis Summary */}
              <div>
                <label className="font-bold text-ink-high block mb-1">
                  Investment Thesis &amp; Sovereign Mandate
                </label>
                <textarea
                  rows={2}
                  value={formData.thesisSummary || ''}
                  onChange={(e) => setFormData({ ...formData, thesisSummary: e.target.value })}
                  placeholder="High-conviction investment thesis aligned with Saudi Vision 2030 digital economy targets."
                  className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                />
              </div>

              {/* Provenance & Source URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Provenance Source Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sourceName}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                    placeholder="e.g. Capital Market Authority (CMA) Directory"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-high block mb-1">
                    Source Provenance URL
                  </label>
                  <input
                    type="url"
                    value={formData.sourceUrl || ''}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    placeholder="https://cma.org.sa"
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded text-ink-high"
                  />
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-editorial-hairline">
                <label className="flex items-center gap-2 font-bold text-ink-high">
                  <input
                    type="checkbox"
                    checked={formData.isActiveInvesting}
                    onChange={(e) => setFormData({ ...formData, isActiveInvesting: e.target.checked })}
                    className="rounded"
                  />
                  <span>Actively Investing (Active Mandate)</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-ink-high">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <span>Featured Anchor Fund</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-ink-high">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  <span>Publicly Published</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-editorial-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-editorial-hairline text-ink-high hover:bg-editorial-sand font-medium rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-brand-navy hover:bg-opacity-95 text-white font-bold rounded flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingInvestor ? 'Save Changes' : 'Create Investor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
