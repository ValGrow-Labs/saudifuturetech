'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';
import { stageLabel, businessModelLabel } from '@/lib/labels';
import { PageHeading } from '@/components/ui/PageHeading';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { StatusDot, Note, type Tone } from '@/components/ui/StatusDot';
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
        setActiveMessage(editingStartup ? `Saved "${formData.name}".` : `Created "${formData.name}".`);
        setErrorMessage(null);
        setIsModalOpen(false);
      } else {
        setErrorMessage(res.error || "We couldn't save this startup. Try again.");
      }
    });
  };

  const handleQuickVerifyCR = (id: string, name: string, currentUrl?: string) => {
    startTransition(async () => {
      const res = await verifyStartupCRAction(id, undefined, currentUrl);
      if (res.success) {
        setActiveMessage(`Marked the CR for "${name}" as confirmed.`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || "We couldn't update the registration. Try again.");
      }
    });
  };

  const handleTogglePublish = (id: string, name: string) => {
    startTransition(async () => {
      const res = await toggleStartupPublishAction(id);
      if (res.success) {
        setActiveMessage(`Changed visibility of "${name}".`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || "We couldn't change visibility. Try again.");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from the directory? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteStartupAction(id);
      if (res.success) {
        setActiveMessage(`Deleted "${name}".`);
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || "We couldn't delete this startup. Try again.");
      }
    });
  };

  const stageOptions = ['BOOTSTRAPPED', 'PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'GROWTH'];

  return (
    <div className="space-y-6">
      <PageHeading
        title="Startups"
        description="Saudi companies listed in the startup directory, with their registration and source details."
      >
        <Button type="button" onClick={handleOpenCreateModal}>
          Add startup
        </Button>
      </PageHeading>

      <div className="grid grid-cols-3 gap-x-8 gap-y-6 max-w-2xl">
        <StatCard label="Listed" value={String(totalCount)} change="" trend="neutral" description="" />
        <StatCard label="CR confirmed" value={`${crVerifiedCount}/${totalCount}`} change="" trend="neutral" description="" />
        <StatCard label="Published" value={String(publishedCount)} change="" trend="neutral" description="" />
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
          <label htmlFor="su-search" className="field-label">
            Search
          </label>
          <input
            id="su-search"
            type="search"
            placeholder="Name, tagline or city"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="su-section" className="field-label">
            Section
          </label>
          <select id="su-section" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="field">
            <option value="ALL">All sections</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="su-stage" className="field-label">
            Stage
          </label>
          <select id="su-stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="field">
            <option value="ALL">All stages</option>
            {stageOptions.map((st) => (
              <option key={st} value={st}>
                {stageLabel(st)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="su-cr" className="field-label">
            Registration
          </label>
          <select id="su-cr" value={crFilter} onChange={(e) => setCrFilter(e.target.value)} className="field">
            <option value="ALL">All</option>
            <option value="VERIFIED">CR confirmed</option>
            <option value="UNVERIFIED">Not confirmed</option>
          </select>
        </div>
        <div>
          <label htmlFor="su-published" className="field-label">
            Visibility
          </label>
          <select id="su-published" value={publishFilter} onChange={(e) => setPublishFilter(e.target.value)} className="field">
            <option value="ALL">Published and drafts</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Drafts</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="meta">
          {filteredStartups.length} of {totalCount} startups
        </p>
        {isPending && <p className="meta">Saving…</p>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table min-w-[960px]">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Section</th>
              <th>Stage</th>
              <th>Registration</th>
              <th>Last checked</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStartups.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10">
                  <p className="font-serif text-lg text-ink">No startups match these filters.</p>
                  <p className="mt-1 text-sm text-ink-3">Clear the search or add a startup.</p>
                </td>
              </tr>
            ) : (
              filteredStartups.map((s) => (
                <tr key={s.id}>
                  <td className="min-w-[220px] max-w-xs">
                    <div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(s)}
                        className="font-serif text-[1.0625rem] leading-snug text-ink text-left hover:text-clay transition-colors"
                      >
                        {s.name}
                      </button>
                      {s.isFeatured && <span className="ml-2 font-sans text-[0.6875rem] text-clay whitespace-nowrap">Featured</span>}
                    </div>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-3 line-clamp-1">{s.tagline}</p>
                    <p className="mt-0.5 whitespace-nowrap font-sans tabular text-[0.71875rem] text-ink-4">
                      {s.hqCity} · Founded {s.foundingYear}
                    </p>
                  </td>

                  <td className="whitespace-nowrap text-ink-2">{s.category?.name || '—'}</td>

                  <td className="whitespace-nowrap">
                    <p className="text-ink-2">{stageLabel(s.stage)}</p>
                    <p className="mt-0.5 font-sans text-[0.75rem] text-ink-3">{businessModelLabel(s.businessModel)}</p>
                  </td>

                  <td className="whitespace-nowrap">
                    {s.crVerified ? (
                      <>
                        <StatusDot tone="moss">CR confirmed</StatusDot>
                        {s.crNumber && (
                          <p className="mt-1 whitespace-nowrap font-sans tabular text-[0.75rem] text-ink-3">{s.crNumber}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <StatusDot tone="clay">Not confirmed</StatusDot>
                        <button
                          type="button"
                          onClick={() => handleQuickVerifyCR(s.id, s.name, s.sourceUrl)}
                          disabled={isPending}
                          className="row-action block mt-1 disabled:opacity-50"
                        >
                          Mark confirmed
                        </button>
                      </>
                    )}
                  </td>

                  <td className="whitespace-nowrap">
                    <p className="whitespace-nowrap font-sans tabular text-[0.8125rem] text-ink-2">
                      {s.verifiedAt ? formatDate(s.verifiedAt) : '—'}
                    </p>
                    {s.verifiedBy && (
                      <p className="mt-0.5 text-[0.75rem] text-ink-3 truncate max-w-[150px]">by {s.verifiedBy}</p>
                    )}
                    {s.sourceUrl && (
                      <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="row-action block mt-1">
                        Source ↗
                      </a>
                    )}
                  </td>

                  <td className="whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(s.id, s.name)}
                      disabled={isPending}
                      title={s.isPublished ? 'Click to unpublish' : 'Click to publish'}
                      className="disabled:opacity-50 hover:opacity-70 transition-opacity"
                    >
                      <StatusDot tone={s.isPublished ? 'moss' : 'ink'}>{s.isPublished ? 'Published' : 'Draft'}</StatusDot>
                    </button>
                  </td>

                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-4">
                      <button type="button" onClick={() => handleOpenEditModal(s)} className="row-action">
                        Edit
                      </button>
                      <Link href={`/startup/${s.slug}`} target="_blank" className="row-action">
                        View ↗
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
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
            aria-labelledby="su-modal-title"
            className="bg-paper-sheet border border-rule shadow-lift rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-rule">
              <h2 id="su-modal-title" className="font-serif text-[1.5rem] leading-tight text-ink">
                {editingStartup ? `Edit ${editingStartup.name}` : 'Add startup'}
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
                <h3 className="panel-title">Company</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="su-name" className="field-label">
                      Name
                    </label>
                    <input
                      id="su-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="field"
                      placeholder="Tamara"
                    />
                  </div>
                  <div>
                    <label htmlFor="su-slug" className="field-label">
                      Slug
                    </label>
                    <input
                      id="su-slug"
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="field font-sans"
                      placeholder="tamara"
                    />
                    <p className="field-hint">Leave blank to generate from the name.</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="su-tagline" className="field-label">
                    Tagline
                  </label>
                  <input
                    id="su-tagline"
                    type="text"
                    required
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="field"
                    placeholder="Buy now, pay later for Saudi shoppers"
                  />
                </div>
                <div>
                  <label htmlFor="su-description" className="field-label">
                    Description
                  </label>
                  <textarea
                    id="su-description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="field"
                    placeholder="What the company builds, who it sells to, and where it operates."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="su-cat" className="field-label">
                      Section
                    </label>
                    <select
                      id="su-cat"
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="field"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="su-stage-f" className="field-label">
                      Stage
                    </label>
                    <select
                      id="su-stage-f"
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                      className="field"
                    >
                      {stageOptions.map((st) => (
                        <option key={st} value={st}>
                          {stageLabel(st)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="su-model" className="field-label">
                      Business model
                    </label>
                    <select
                      id="su-model"
                      value={formData.businessModel}
                      onChange={(e) => setFormData({ ...formData, businessModel: e.target.value as any })}
                      className="field"
                    >
                      <option value="B2B">B2B</option>
                      <option value="B2C">B2C</option>
                      <option value="B2B2C">B2B2C</option>
                      <option value="B2G">B2G</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="su-city" className="field-label">
                      HQ city
                    </label>
                    <input
                      id="su-city"
                      type="text"
                      required
                      value={formData.hqCity}
                      onChange={(e) => setFormData({ ...formData, hqCity: e.target.value })}
                      className="field"
                      placeholder="Riyadh"
                    />
                  </div>
                  <div>
                    <label htmlFor="su-year" className="field-label">
                      Founded
                    </label>
                    <input
                      id="su-year"
                      type="number"
                      required
                      value={formData.foundingYear}
                      onChange={(e) => setFormData({ ...formData, foundingYear: Number(e.target.value) })}
                      className="field font-sans tabular"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label htmlFor="su-website" className="field-label">
                      Website
                    </label>
                    <input
                      id="su-website"
                      type="url"
                      required
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      className="field"
                      placeholder="https://company.sa"
                    />
                  </div>
                </div>
              </section>

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Commercial registration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end">
                  <div>
                    <label htmlFor="su-cr-number" className="field-label">
                      CR number
                    </label>
                    <input
                      id="su-cr-number"
                      type="text"
                      value={formData.crNumber || ''}
                      onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                      className="field font-sans tabular"
                      placeholder="1010XXXXXX"
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={formData.crVerified || false}
                      onChange={(e) => setFormData({ ...formData, crVerified: e.target.checked })}
                      className="accent-[#A63D24]"
                    />
                    CR confirmed with the Ministry of Commerce
                  </label>
                </div>
              </section>

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Products and funding</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="su-products" className="field-label">
                      Products
                    </label>
                    <textarea
                      id="su-products"
                      rows={3}
                      value={productsText}
                      onChange={(e) => setProductsText(e.target.value)}
                      className="field"
                      placeholder={'FOCAL AML Suite\nFOCAL Fraud Engine'}
                    />
                    <p className="field-hint">One per line.</p>
                  </div>
                  <div>
                    <label htmlFor="su-stack" className="field-label">
                      Tech stack
                    </label>
                    <textarea
                      id="su-stack"
                      rows={3}
                      value={techStackText}
                      onChange={(e) => setTechStackText(e.target.value)}
                      className="field font-sans text-[0.8125rem]"
                      placeholder={'Python\nPyTorch\nPostgreSQL'}
                    />
                    <p className="field-hint">One per line.</p>
                  </div>
                  <div>
                    <label htmlFor="su-funding" className="field-label">
                      Disclosed funding
                    </label>
                    <input
                      id="su-funding"
                      type="text"
                      value={formData.fundingDisclosed || ''}
                      onChange={(e) => setFormData({ ...formData, fundingDisclosed: e.target.value })}
                      className="field"
                      placeholder="Series B, SAR 200M"
                    />
                  </div>
                  <div>
                    <label htmlFor="su-investors" className="field-label">
                      Disclosed investors
                    </label>
                    <input
                      id="su-investors"
                      type="text"
                      value={investorsText}
                      onChange={(e) => setInvestorsText(e.target.value)}
                      className="field"
                      placeholder="Sanabil Investments, STV"
                    />
                    <p className="field-hint">Separate with commas.</p>
                  </div>
                </div>
              </section>

              <section className="panel p-5 space-y-4">
                <h3 className="panel-title">Source and visibility</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="su-source-name" className="field-label">
                      Source
                    </label>
                    <input
                      id="su-source-name"
                      type="text"
                      required
                      value={formData.sourceName || ''}
                      onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                      className="field"
                      placeholder="Ministry of Commerce register"
                    />
                  </div>
                  <div>
                    <label htmlFor="su-source-url" className="field-label">
                      Source URL
                    </label>
                    <input
                      id="su-source-url"
                      type="url"
                      required
                      value={formData.sourceUrl || ''}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      className="field"
                      placeholder="https://mozn.sa"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                  <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="accent-[#A63D24]"
                    />
                    Published
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="accent-[#A63D24]"
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
                  {isPending ? 'Saving…' : editingStartup ? 'Save changes' : 'Create startup'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
