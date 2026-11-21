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
  Code2,
  Search,
  Filter,
  Plus,
  Edit2,
  Eye,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  Coins,
  Package
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { 
  toggleStartupVerifiedAction, 
  toggleStartupPublishAction,
  verifyStartupCRAction,
  saveStartupAction,
  deleteStartupAction,
  StartupFormData
} from '@/actions/founder-admin';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface StartupManagerProps {
  startups: any[];
  categories: CategoryOption[];
}

export const StartupManager: React.FC<StartupManagerProps> = ({ startups, categories }) => {
  const [isPending, startTransition] = useTransition();
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [crFilter, setCrFilter] = useState('ALL');
  const [publishFilter, setPublishFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStartup, setEditingStartup] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState<StartupFormData>({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    hqCity: 'Riyadh',
    foundingYear: 2024,
    stage: 'SEED' as any,
    businessModel: 'B2B' as any,
    categoryId: '',
    crNumber: '',
    crVerified: false,
    sourceName: '',
    sourceUrl: '',
    products: [],
    techStack: [],
    fundingDisclosed: '',
    investorsDisclosed: [],
    keyMetrics: '',
    isFeatured: false,
    isPublished: true,
  });

  const [productsText, setProductsText] = useState('');
  const [techStackText, setTechStackText] = useState('');
  const [investorsText, setInvestorsText] = useState('');

  // Filtered List
  const filteredStartups = useMemo(() => {
    return startups.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.hqCity.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'ALL' || s.categoryId === categoryFilter;
      const matchesStage = stageFilter === 'ALL' || s.stage === stageFilter;
      const matchesCr =
        crFilter === 'ALL' ||
        (crFilter === 'VERIFIED' && s.crVerified) ||
        (crFilter === 'UNVERIFIED' && !s.crVerified);
      const matchesPub =
        publishFilter === 'ALL' ||
        (publishFilter === 'PUBLISHED' && s.isPublished) ||
        (publishFilter === 'DRAFT' && !s.isPublished);

      return matchesSearch && matchesCat && matchesStage && matchesCr && matchesPub;
    });
  }, [startups, searchQuery, categoryFilter, stageFilter, crFilter, publishFilter]);

  // Metric counts
  const totalCount = startups.length;
  const crVerifiedCount = startups.filter((s) => s.crVerified).length;
  const publishedCount = startups.filter((s) => s.isPublished).length;

  const handleOpenCreateModal = () => {
    setEditingStartup(null);
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      websiteUrl: 'https://',
      hqCity: 'Riyadh',
      foundingYear: new Date().getFullYear(),
      stage: 'SEED' as any,
      businessModel: 'B2B' as any,
      categoryId: categories[0]?.id || '',
      crNumber: '',
      crVerified: false,
      sourceName: 'Ministry of Commerce Wathiq / SAMA',
      sourceUrl: '',
      products: [],
      techStack: [],
      fundingDisclosed: '',
      investorsDisclosed: [],
      keyMetrics: '',
      isFeatured: false,
      isPublished: true,
    });
    setProductsText('');
    setTechStackText('');
    setInvestorsText('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (startup: any) => {
    setEditingStartup(startup);
    setFormData({
      name: startup.name,
      slug: startup.slug,
      tagline: startup.tagline,
      description: startup.description,
      websiteUrl: startup.websiteUrl,
      hqCity: startup.hqCity,
      foundingYear: startup.foundingYear,
      stage: startup.stage,
      businessModel: startup.businessModel,
      categoryId: startup.categoryId || '',
      crNumber: startup.crNumber || '',
      crVerified: Boolean(startup.crVerified),
      sourceName: startup.sourceName || '',
      sourceUrl: startup.sourceUrl || '',
      products: Array.isArray(startup.products) ? startup.products : [],
      techStack: Array.isArray(startup.techStack) ? startup.techStack : [],
      fundingDisclosed: startup.fundingDisclosed || '',
      investorsDisclosed: Array.isArray(startup.investorsDisclosed) ? startup.investorsDisclosed : [],
      keyMetrics: startup.keyMetrics || '',
      isFeatured: Boolean(startup.isFeatured),
      isPublished: startup.isPublished !== undefined ? Boolean(startup.isPublished) : true,
    });
    setProductsText(Array.isArray(startup.products) ? startup.products.join('\n') : '');
    setTechStackText(Array.isArray(startup.techStack) ? startup.techStack.join('\n') : '');
    setInvestorsText(Array.isArray(startup.investorsDisclosed) ? startup.investorsDisclosed.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload: StartupFormData = {
        ...formData,
        products: productsText.split('\n').map((s) => s.trim()).filter(Boolean),
        techStack: techStackText.split('\n').map((s) => s.trim()).filter(Boolean),
        investorsDisclosed: investorsText.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await saveStartupAction(payload, editingStartup?.id);
      if (res.success) {
        setActiveMessage(editingStartup ? `Successfully updated "${formData.name}".` : `Successfully created "${formData.name}".`);
        setErrorMessage(null);
        setIsModalOpen(false);
      } else {
        setErrorMessage(res.error || 'Failed to save startup dossier.');
      }
    });
  };

  const handleQuickVerifyCR = (id: string, name: string, currentUrl?: string) => {
    startTransition(async () => {
      const res = await verifyStartupCRAction(id, undefined, currentUrl);
      if (res.success) {
        setActiveMessage(`CR audit verified for "${name}". Timestamp and auditor credentials recorded.`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || 'Failed to verify CR.');
      }
    });
  };

  const handleTogglePublish = (id: string, name: string) => {
    startTransition(async () => {
      const res = await toggleStartupPublishAction(id);
      if (res.success) {
        setActiveMessage(`Toggled publication status for "${name}".`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || 'Failed to update publication status.');
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the Saudi Tech Directory?`)) return;
    startTransition(async () => {
      const res = await deleteStartupAction(id);
      if (res.success) {
        setActiveMessage(`Permanently removed "${name}".`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || 'Failed to delete startup.');
      }
    });
  };

  const formatStage = (st: string) => {
    switch (st) {
      case 'PRE_SEED':
        return 'Pre-Seed';
      case 'SEED':
        return 'Seed';
      case 'SERIES_A':
        return 'Series A';
      case 'SERIES_B':
        return 'Series B';
      case 'SERIES_C':
        return 'Series C+';
      case 'GROWTH':
        return 'Growth / Scale';
      case 'BOOTSTRAPPED':
        return 'Bootstrapped';
      default:
        return st;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-editorial-pure p-4 rounded-lg border border-editorial-hairline shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider">
            Total Ventures
          </span>
          <span className="text-xl font-heading font-black text-ink-high block pt-1">
            {totalCount}
          </span>
          <span className="text-[11px] text-ink-faint block">
            Saudi Tech Registry
          </span>
        </div>

        <div className="bg-editorial-pure p-4 rounded-lg border border-editorial-hairline shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider">
            CR Audited (MoC)
          </span>
          <span className="text-xl font-heading font-black text-brand-oasis block pt-1">
            {crVerifiedCount} / {totalCount}
          </span>
          <span className="text-[11px] text-ink-faint block">
            Verified Wathiq Records
          </span>
        </div>

        <div className="bg-editorial-pure p-4 rounded-lg border border-editorial-hairline shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider">
            Publicly Live
          </span>
          <span className="text-xl font-heading font-black text-brand-navy block pt-1">
            {publishedCount}
          </span>
          <span className="text-[11px] text-ink-faint block">
            Active Directory Index
          </span>
        </div>

        <div className="bg-editorial-pure p-4 rounded-lg border border-editorial-hairline shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider">
            Sovereign Pillars
          </span>
          <span className="text-xl font-heading font-black text-brand-desertGold block pt-1">
            6 Desks
          </span>
          <span className="text-[11px] text-ink-faint block">
            Vision 2030 Aligned
          </span>
        </div>
      </div>

      {/* 2. Feedback Toasts */}
      {activeMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center justify-between shadow-2xs">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{activeMessage}</span>
          </span>
          <button onClick={() => setActiveMessage(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center justify-between shadow-2xs">
          <span className="flex items-center gap-1.5 font-medium">
            <X className="w-4 h-4 text-red-600" />
            <span>{errorMessage}</span>
          </span>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* 3. Search and Action Strip */}
      <div className="bg-editorial-pure p-4 rounded-lg border border-editorial-hairline shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by venture name, tagline, or headquarters city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-editorial-sand/40 border border-editorial-hairline rounded-md text-ink-high placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-oasis"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-brand-navy hover:bg-brand-navy/90 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Startup</span>
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-editorial-hairline text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-ink-muted block mb-1">
              Sector / Pillar
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-editorial-sand/60 border border-editorial-hairline rounded-md px-2.5 py-1.5 text-xs text-ink-high focus:outline-none"
            >
              <option value="ALL">All Sectors</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-ink-muted block mb-1">
              Funding Stage
            </label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full bg-editorial-sand/60 border border-editorial-hairline rounded-md px-2.5 py-1.5 text-xs text-ink-high focus:outline-none"
            >
              <option value="ALL">All Stages</option>
              <option value="BOOTSTRAPPED">Bootstrapped</option>
              <option value="PRE_SEED">Pre-Seed</option>
              <option value="SEED">Seed</option>
              <option value="SERIES_A">Series A</option>
              <option value="SERIES_B">Series B</option>
              <option value="SERIES_C">Series C+</option>
              <option value="GROWTH">Growth</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-ink-muted block mb-1">
              CR Verification State
            </label>
            <select
              value={crFilter}
              onChange={(e) => setCrFilter(e.target.value)}
              className="w-full bg-editorial-sand/60 border border-editorial-hairline rounded-md px-2.5 py-1.5 text-xs text-ink-high focus:outline-none"
            >
              <option value="ALL">All Records</option>
              <option value="VERIFIED">CR Audited (MoC Wathiq)</option>
              <option value="UNVERIFIED">Awaiting Audit</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-ink-muted block mb-1">
              Publication State
            </label>
            <select
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value)}
              className="w-full bg-editorial-sand/60 border border-editorial-hairline rounded-md px-2.5 py-1.5 text-xs text-ink-high focus:outline-none"
            >
              <option value="ALL">All States</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft / Unpublished</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Startups Table */}
      <div className="bg-editorial-pure rounded-lg border border-editorial-hairline overflow-hidden shadow-xs">
        <div className="p-4 border-b border-editorial-hairline flex items-center justify-between bg-editorial-sand/30">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-high">
            Verified Saudi Startups Registry ({filteredStartups.length} of {totalCount})
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
                <th className="py-3 px-4">Startup Venture</th>
                <th className="py-3 px-4">Sector &amp; Pillar</th>
                <th className="py-3 px-4">Stage &amp; Model</th>
                <th className="py-3 px-4">CR Audit Status</th>
                <th className="py-3 px-4">Verification Audit</th>
                <th className="py-3 px-4">Publication</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-hairline">
              {filteredStartups.map((s) => (
                <tr key={s.id} className="hover:bg-editorial-sand/30 transition-colors">
                  {/* Name and Tagline */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-ink-high">
                        <Link
                          href={`/startup/${s.slug}`}
                          className="hover:text-brand-navy hover:underline transition-colors"
                        >
                          {s.name}
                        </Link>
                        {s.isFeatured && (
                          <span className="px-1.5 py-0.2 rounded-xs bg-brand-desertGold/15 text-brand-desertGold text-[9px] font-bold">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted line-clamp-1">
                        {s.tagline}
                      </p>
                      <span className="text-[10px] text-ink-faint">
                        {s.hqCity}, KSA • Est. {s.foundingYear}
                      </span>
                    </div>
                  </td>

                  {/* Sector & Pillar */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-xs bg-brand-sand font-bold text-[10px] text-ink-high border border-editorial-hairline">
                      {s.category?.name || 'General Tech'}
                    </span>
                  </td>

                  {/* Stage & Model */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-brand-navy block">
                        {formatStage(s.stage)}
                      </span>
                      <span className="text-[10px] text-ink-muted block">
                        {s.businessModel}
                      </span>
                    </div>
                  </td>

                  {/* CR Verification Badge */}
                  <td className="py-3.5 px-4">
                    {s.crVerified ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>CR Audited</span>
                        </span>
                        {s.crNumber && (
                          <span className="text-[10px] text-ink-muted font-mono block">
                            #{s.crNumber}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleQuickVerifyCR(s.id, s.name, s.sourceUrl)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Click to audit CR status"
                      >
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>Audit CR Now</span>
                      </button>
                    )}
                  </td>

                  {/* Verification Audit */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-[11px]">
                      <span className="text-ink-high font-medium block">
                        {formatDate(s.verifiedAt)}
                      </span>
                      <span className="text-[10px] text-ink-faint block line-clamp-1">
                        {s.verifiedBy || 'SFT Editorial Staff'}
                      </span>
                      {s.sourceUrl && (
                        <a
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-brand-teal hover:underline inline-flex items-center gap-0.5 pt-0.5"
                        >
                          <span>Official Registry</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Publication Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleTogglePublish(s.id, s.name)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer',
                        s.isPublished
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {s.isPublished ? '● Published' : '○ Draft'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/startup/${s.slug}`}
                        target="_blank"
                        className="p-1 text-ink-muted hover:text-brand-navy transition-colors"
                        title="View Public Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-1 text-ink-muted hover:text-brand-teal transition-colors cursor-pointer"
                        title="Edit Startup Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-1 text-ink-muted hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Startup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Create / Edit Startup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-editorial-pure rounded-lg border border-editorial-hairline shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-editorial-hairline flex items-center justify-between bg-editorial-sand/30">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-teal block">
                  Saudi Tech Registry
                </span>
                <h3 className="font-heading font-black text-lg text-ink-high">
                  {editingStartup ? `Edit Venture: ${editingStartup.name}` : 'Register New Saudi Startup'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-ink-muted hover:text-ink-high rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                    placeholder="e.g. Tamara"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">URL Slug (leave blank to auto-generate)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs font-mono"
                    placeholder="tamara-fintech"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-high block">Tagline / Mission *</label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                  placeholder="e.g. The First Saudi FinTech Unicorn & Shopping Platform"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-high block">Executive Overview &amp; Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                  placeholder="Detailed description of technology, market focus, and regulatory standing..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Sovereign Pillar *</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Funding Stage *</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                  >
                    <option value="BOOTSTRAPPED">Bootstrapped</option>
                    <option value="PRE_SEED">Pre-Seed</option>
                    <option value="SEED">Seed</option>
                    <option value="SERIES_A">Series A</option>
                    <option value="SERIES_B">Series B</option>
                    <option value="SERIES_C">Series C+</option>
                    <option value="GROWTH">Growth / Scale</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Business Model *</label>
                  <select
                    value={formData.businessModel}
                    onChange={(e) => setFormData({ ...formData, businessModel: e.target.value as any })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                  >
                    <option value="B2B">B2B (Enterprise)</option>
                    <option value="B2C">B2C (Consumer)</option>
                    <option value="B2B2C">B2B2C (Hybrid)</option>
                    <option value="B2G">B2G (Government)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">HQ City *</label>
                  <input
                    type="text"
                    required
                    value={formData.hqCity}
                    onChange={(e) => setFormData({ ...formData, hqCity: e.target.value })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                    placeholder="Riyadh"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Founding Year *</label>
                  <input
                    type="number"
                    required
                    value={formData.foundingYear}
                    onChange={(e) => setFormData({ ...formData, foundingYear: Number(e.target.value) })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                    placeholder="2020"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Official Website URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                    placeholder="https://company.sa"
                  />
                </div>
              </div>

              {/* CR Verification Section */}
              <div className="p-4 rounded-md bg-brand-sand/50 border border-editorial-hairline space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-navy block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-oasis" />
                  <span>Commercial Registration (CR) Verification</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-medium text-ink-high block">CR Number</label>
                    <input
                      type="text"
                      value={formData.crNumber || ''}
                      onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                      className="w-full p-2 bg-editorial-pure border border-editorial-hairline rounded-md text-xs font-mono"
                      placeholder="1010XXXXXX"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-ink-high">
                      <input
                        type="checkbox"
                        checked={formData.crVerified || false}
                        onChange={(e) => setFormData({ ...formData, crVerified: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-oasis"
                      />
                      <span>CR Verified with Ministry of Commerce / Wathiq</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Products & Tech Stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Verified Products (one per line)</label>
                  <textarea
                    rows={3}
                    value={productsText}
                    onChange={(e) => setProductsText(e.target.value)}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                    placeholder="FOCAL AML Suite&#10;FOCAL Fraud Engine&#10;OSOS Arabic NLP"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Architectural Tech Stack (one per line)</label>
                  <textarea
                    rows={3}
                    value={techStackText}
                    onChange={(e) => setTechStackText(e.target.value)}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs font-mono"
                    placeholder="Python&#10;PyTorch&#10;PostgreSQL&#10;KSA Sovereign Cloud"
                  />
                </div>
              </div>

              {/* Disclosed Funding & Investors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Disclosed Funding Round</label>
                  <input
                    type="text"
                    value={formData.fundingDisclosed || ''}
                    onChange={(e) => setFormData({ ...formData, fundingDisclosed: e.target.value })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                    placeholder="e.g. Series B (Disclosed)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Disclosed Investors (comma-separated)</label>
                  <input
                    type="text"
                    value={investorsText}
                    onChange={(e) => setInvestorsText(e.target.value)}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                    placeholder="Sanabil Investments, STV, Goldman Sachs"
                  />
                </div>
              </div>

              {/* Data Provenance Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Official Source Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.sourceName || ''}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                    placeholder="Ministry of Commerce Wathiq / SAMA Register"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink-high block">Official Source URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.sourceUrl || ''}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full p-2 bg-editorial-sand/40 border border-editorial-hairline rounded-md text-xs"
                    placeholder="https://mozn.sa"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-ink-high">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-navy"
                  />
                  <span>Published Live on Public Directory</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-ink-high">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-desertGold"
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-editorial-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-editorial-hairline text-xs font-semibold text-ink-muted hover:text-ink-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-brand-navy hover:bg-brand-navy/90 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingStartup ? 'Update Dossier' : 'Create Startup'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
