'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentSessionUser, canManageTaxonomy } from '@/lib/auth/guard';
import { OpportunityCategory, OpportunityStatus, StartupStage, BusinessModel, InvestorType } from '@prisma/client';

export interface AdminActionState {
  success?: boolean;
  error?: string;
  id?: string;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function safeRevalidate(path: string) {
  try {
    safeRevalidate(path);
  } catch {
    // Graceful fallback for non-HTTP request contexts (e.g. test harness)
  }
}

// -----------------------------------------------------------------------------
// OPPORTUNITY ACTIONS
// -----------------------------------------------------------------------------

export interface OpportunityFormData {
  title: string;
  slug?: string;
  organization: string;
  category: OpportunityCategory;
  categoryId?: string | null;
  fundingAmount?: string | null;
  equityTaken?: string | null;
  location?: string | null;
  description: string;
  eligibilitySummary?: string | null;
  eligibilityCriteria?: string[];
  benefits?: string[];
  requirements?: string[];
  status: OpportunityStatus;
  deadline?: string | null;
  applicationUrl: string;
  sourceName: string;
  sourceUrl?: string | null;
  isFeatured?: boolean;
  isPublished?: boolean;
}

export async function verifyOpportunityAction(id: string): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can verify programs.' };
  }

  try {
    const opp = await prisma.opportunity.findUnique({ where: { id } });
    if (!opp) return { error: 'Opportunity not found.' };

    if (!opp.sourceName || !opp.applicationUrl) {
      return { error: 'Cannot verify: Official Source Name and Application URL are required.' };
    }

    await prisma.opportunity.update({
      where: { id },
      data: {
        verifiedAt: new Date(),
        verifiedBy: user.name || user.email || 'SFT Editorial Staff',
      },
    });

    safeRevalidate('/admin/opportunities');
    safeRevalidate('/opportunities');
    safeRevalidate(`/opportunity/${opp.slug}`);
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to verify opportunity.' };
  }
}

export async function toggleOpportunityPublishAction(id: string): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can publish programs.' };
  }

  try {
    const opp = await prisma.opportunity.findUnique({ where: { id } });
    if (!opp) return { error: 'Opportunity not found.' };

    const willPublish = !opp.isPublished;

    // Strict validation before publishing
    if (willPublish) {
      if (!opp.applicationUrl || !opp.applicationUrl.startsWith('http')) {
        return { error: 'Cannot publish: A valid http/https application URL is required.' };
      }
      if (!opp.sourceName || opp.sourceName.trim().length === 0) {
        return { error: 'Cannot publish: Official issuing source name is required for verification.' };
      }
      if (!opp.sourceUrl || !opp.sourceUrl.startsWith('http')) {
        return { error: 'Cannot publish: A valid official source URL is mandatory for public provenance.' };
      }
    }

    await prisma.opportunity.update({
      where: { id },
      data: {
        isPublished: willPublish,
        updatedAt: new Date(),
      },
    });

    safeRevalidate('/admin/opportunities');
    safeRevalidate('/opportunities');
    safeRevalidate(`/opportunity/${opp.slug}`);
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle publication status.' };
  }
}

export async function saveOpportunityAction(
  id: string | null,
  data: OpportunityFormData
): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can save programs.' };
  }

  // Basic validation
  if (!data.title?.trim()) {
    return { error: 'Title is required.' };
  }
  if (!data.organization?.trim()) {
    return { error: 'Issuing Organization is required.' };
  }
  if (!data.description?.trim()) {
    return { error: 'Description is required.' };
  }
  if (!data.applicationUrl?.trim() || !data.applicationUrl.startsWith('http')) {
    return { error: 'A valid http/https Application URL is required.' };
  }
  if (!data.sourceName?.trim()) {
    return { error: 'Official Issuing Source name is required.' };
  }
  if (data.sourceUrl && !data.sourceUrl.startsWith('http')) {
    return { error: 'Source URL must start with http:// or https://' };
  }

  const slug = (data.slug?.trim() || generateSlug(data.title)).toLowerCase();

  // Check unique slug if new or changed
  const existingWithSlug = await prisma.opportunity.findUnique({ where: { slug } });
  if (existingWithSlug && (!id || existingWithSlug.id !== id)) {
    return { error: `An opportunity with slug "${slug}" already exists.` };
  }

  const deadlineDate = data.deadline ? new Date(data.deadline) : null;

  try {
    if (id) {
      // Update
      const updated = await prisma.opportunity.update({
        where: { id },
        data: {
          title: data.title.trim(),
          slug,
          organization: data.organization.trim(),
          category: data.category,
          categoryId: data.categoryId || null,
          fundingAmount: data.fundingAmount?.trim() || null,
          equityTaken: data.equityTaken?.trim() || null,
          location: data.location?.trim() || null,
          description: data.description.trim(),
          eligibilitySummary: data.eligibilitySummary?.trim() || null,
          eligibilityCriteria: data.eligibilityCriteria || [],
          benefits: data.benefits || [],
          requirements: data.requirements || [],
          status: data.status,
          deadline: deadlineDate,
          applicationUrl: data.applicationUrl.trim(),
          sourceName: data.sourceName.trim(),
          sourceUrl: data.sourceUrl?.trim() || null,
          isFeatured: Boolean(data.isFeatured),
          isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
          verifiedAt: new Date(),
          verifiedBy: user.name || user.email || 'SFT Editorial Staff',
          updatedAt: new Date(),
        },
      });

      safeRevalidate('/admin/opportunities');
      safeRevalidate('/opportunities');
      safeRevalidate(`/opportunity/${updated.slug}`);
      safeRevalidate('/');
      return { success: true, id: updated.id };
    } else {
      // Create
      const created = await prisma.opportunity.create({
        data: {
          title: data.title.trim(),
          slug,
          organization: data.organization.trim(),
          category: data.category,
          categoryId: data.categoryId || null,
          fundingAmount: data.fundingAmount?.trim() || null,
          equityTaken: data.equityTaken?.trim() || null,
          location: data.location?.trim() || null,
          description: data.description.trim(),
          eligibilitySummary: data.eligibilitySummary?.trim() || null,
          eligibilityCriteria: data.eligibilityCriteria || [],
          benefits: data.benefits || [],
          requirements: data.requirements || [],
          status: data.status,
          deadline: deadlineDate,
          applicationUrl: data.applicationUrl.trim(),
          sourceName: data.sourceName.trim(),
          sourceUrl: data.sourceUrl?.trim() || null,
          isFeatured: Boolean(data.isFeatured),
          isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
          verifiedAt: new Date(),
          verifiedBy: user.name || user.email || 'SFT Editorial Staff',
        },
      });

      safeRevalidate('/admin/opportunities');
      safeRevalidate('/opportunities');
      safeRevalidate(`/opportunity/${created.slug}`);
      safeRevalidate('/');
      return { success: true, id: created.id };
    }
  } catch (err: any) {
    return { error: err.message || 'Failed to save opportunity.' };
  }
}

export async function updateOpportunityStatusAction(
  id: string,
  status: OpportunityStatus
): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied.' };
  }

  try {
    const updated = await prisma.opportunity.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });

    safeRevalidate('/admin/opportunities');
    safeRevalidate('/opportunities');
    safeRevalidate(`/opportunity/${updated.slug}`);
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update opportunity status.' };
  }
}

export async function deleteOpportunityAction(id: string): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied.' };
  }

  try {
    const opp = await prisma.opportunity.findUnique({ where: { id } });
    await prisma.opportunity.delete({ where: { id } });

    safeRevalidate('/admin/opportunities');
    safeRevalidate('/opportunities');
    if (opp?.slug) safeRevalidate(`/opportunity/${opp.slug}`);
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete opportunity.' };
  }
}

// -----------------------------------------------------------------------------
// STARTUP ACTIONS
// -----------------------------------------------------------------------------

export interface StartupFormData {
  name: string;
  slug?: string;
  tagline: string;
  description: string;
  logoUrl?: string | null;
  websiteUrl: string;
  hqCity: string;
  foundingYear: number;
  stage: StartupStage;
  businessModel: BusinessModel;
  categoryId?: string | null;
  crNumber?: string | null;
  crVerified?: boolean;
  sourceName?: string | null;
  sourceUrl?: string | null;
  products?: string[];
  techStack?: string[];
  fundingDisclosed?: string | null;
  investorsDisclosed?: string[];
  keyMetrics?: string | null;
  isFeatured?: boolean;
  isPublished?: boolean;
}

export async function saveStartupAction(
  data: StartupFormData,
  id?: string
): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can manage startups.' };
  }

  try {
    if (!data.name || data.name.trim().length === 0) {
      return { error: 'Startup name is required.' };
    }
    if (!data.tagline || data.tagline.trim().length === 0) {
      return { error: 'Tagline is required.' };
    }
    if (!data.description || data.description.trim().length === 0) {
      return { error: 'Description is required.' };
    }
    if (!data.websiteUrl || !data.websiteUrl.startsWith('http')) {
      return { error: 'A valid website URL starting with http:// or https:// is required.' };
    }
    if (data.crVerified && (!data.sourceUrl || !data.sourceUrl.startsWith('http'))) {
      return { error: 'Cannot verify CR: An official ministerial source URL (e.g. MoC Wathiq) is required.' };
    }
    if (data.isPublished && (!data.sourceName || data.sourceName.trim().length === 0)) {
      return { error: 'Official issuing source name is required before publishing.' };
    }

    const slug = data.slug && data.slug.trim().length > 0
      ? generateSlug(data.slug)
      : generateSlug(data.name);

    // Verify slug uniqueness
    const existing = await prisma.startup.findFirst({
      where: {
        slug,
        id: id ? { not: id } : undefined,
      },
    });

    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const payload = {
      name: data.name.trim(),
      slug: finalSlug,
      tagline: data.tagline.trim(),
      description: data.description.trim(),
      logoUrl: data.logoUrl || null,
      websiteUrl: data.websiteUrl.trim(),
      hqCity: data.hqCity?.trim() || 'Riyadh',
      foundingYear: Number(data.foundingYear) || 2024,
      stage: data.stage,
      businessModel: data.businessModel,
      categoryId: data.categoryId || null,
      crNumber: data.crNumber?.trim() || null,
      crVerified: Boolean(data.crVerified),
      verified: Boolean(data.crVerified),
      sourceName: data.sourceName?.trim() || 'Ministry of Commerce / Official Registry',
      sourceUrl: data.sourceUrl?.trim() || null,
      verifiedBy: user.name || user.email || 'SFT Editorial Board',
      products: data.products || [],
      techStack: data.techStack || [],
      fundingDisclosed: data.fundingDisclosed?.trim() || null,
      investorsDisclosed: data.investorsDisclosed || [],
      keyMetrics: data.keyMetrics?.trim() || null,
      isFeatured: Boolean(data.isFeatured),
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      verifiedAt: new Date(),
    };

    let result;
    if (id) {
      result = await prisma.startup.update({
        where: { id },
        data: payload,
      });
    } else {
      result = await prisma.startup.create({
        data: payload,
      });
    }

    safeRevalidate('/admin/startups');
    safeRevalidate('/startups');
    safeRevalidate(`/startup/${result.slug}`);
    safeRevalidate('/');

    return { success: true, id: result.id };
  } catch (err: any) {
    return { error: err.message || 'Failed to save startup.' };
  }
}

export async function verifyStartupCRAction(
  id: string,
  crNumber?: string,
  sourceUrl?: string
): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can verify startups.' };
  }

  try {
    const startup = await prisma.startup.findUnique({ where: { id } });
    if (!startup) return { error: 'Startup not found.' };

    const resolvedSourceUrl = sourceUrl || startup.sourceUrl;
    if (!resolvedSourceUrl || !resolvedSourceUrl.startsWith('http')) {
      return { error: 'Cannot verify CR: A valid official source URL (e.g. MoC Wathiq or SAMA register) is required.' };
    }

    await prisma.startup.update({
      where: { id },
      data: {
        crVerified: true,
        verified: true,
        crNumber: crNumber || startup.crNumber || 'Verified MoC Registry',
        sourceUrl: resolvedSourceUrl,
        verifiedAt: new Date(),
        verifiedBy: user.name || user.email || 'SFT Editorial Board',
      },
    });

    safeRevalidate('/admin/startups');
    safeRevalidate('/startups');
    safeRevalidate(`/startup/${startup.slug}`);
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to verify startup.' };
  }
}

export async function toggleStartupPublishAction(id: string): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can publish startups.' };
  }

  try {
    const startup = await prisma.startup.findUnique({ where: { id } });
    if (!startup) return { error: 'Startup not found.' };

    const willPublish = !startup.isPublished;

    // Strict validation before publishing
    if (willPublish) {
      if (!startup.websiteUrl || !startup.websiteUrl.startsWith('http')) {
        return { error: 'Cannot publish: A valid official website URL is required.' };
      }
      if (!startup.description || startup.description.trim().length === 0) {
        return { error: 'Cannot publish: Venture description is mandatory.' };
      }
      if (!startup.sourceName || startup.sourceName.trim().length === 0) {
        return { error: 'Cannot publish: Official audit provenance source name is required.' };
      }
    }

    await prisma.startup.update({
      where: { id },
      data: {
        isPublished: willPublish,
        updatedAt: new Date(),
      },
    });

    safeRevalidate('/admin/startups');
    safeRevalidate('/startups');
    safeRevalidate(`/startup/${startup.slug}`);
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle publication status.' };
  }
}

export async function toggleStartupVerifiedAction(id: string): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors can verify startups.' };
  }

  try {
    const startup = await prisma.startup.findUnique({ where: { id } });
    if (!startup) return { error: 'Startup not found.' };

    await prisma.startup.update({
      where: { id },
      data: {
        verified: !startup.verified,
        crVerified: !startup.verified,
        verifiedAt: new Date(),
        verifiedBy: user.name || user.email || 'SFT Editorial Board',
      },
    });

    safeRevalidate('/admin/startups');
    safeRevalidate('/startups');
    safeRevalidate(`/startup/${startup.slug}`);
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle startup verification.' };
  }
}

export async function deleteStartupAction(id: string): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied.' };
  }

  try {
    const s = await prisma.startup.findUnique({ where: { id }, select: { slug: true } });
    await prisma.startup.delete({ where: { id } });

    safeRevalidate('/admin/startups');
    safeRevalidate('/startups');
    if (s?.slug) {
      safeRevalidate(`/startup/${s.slug}`);
    }
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete startup.' };
  }
}

// -----------------------------------------------------------------------------
// INVESTOR ACTIONS (Institutional Funding & Regulatory Management)
// -----------------------------------------------------------------------------

export interface InvestorFormData {
  name: string;
  slug?: string;
  type: InvestorType;
  hqLocation: string;
  logoUrl?: string | null;
  websiteUrl: string;
  pitchUrl?: string | null;
  isCmaAuthorized: boolean;
  cmaLicenseNumber?: string | null;
  isSvcPartner: boolean;
  svcProgramDetails?: string | null;
  regulatoryCategory?: string | null;
  isActiveInvesting: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  targetStages?: string[];
  targetSectors?: string[];
  checkSizeRange?: string | null;
  portfolioHighlights?: string[];
  description: string;
  thesisSummary?: string | null;
  sourceName: string;
  sourceUrl?: string | null;
}

export async function saveInvestorAction(
  data: InvestorFormData,
  id?: string
): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can manage investors.' };
  }

  // Strict Validation
  if (!data.name || data.name.trim().length === 0) {
    return { error: 'Investor organization name is required.' };
  }
  if (!data.websiteUrl || !data.websiteUrl.startsWith('http')) {
    return { error: 'Valid official website URL (http/https) is required.' };
  }
  if (!data.description || data.description.trim().length < 20) {
    return { error: 'Institutional description must be at least 20 characters.' };
  }
  if (!data.sourceName || data.sourceName.trim().length === 0) {
    return { error: 'Official verification source name (e.g. CMA Register, Official Fund Disclosure) is required.' };
  }
  if (data.isCmaAuthorized && (!data.cmaLicenseNumber || data.cmaLicenseNumber.trim().length === 0)) {
    return { error: 'CMA-authorized entities must specify a valid CMA License Number or official structure.' };
  }

  const slug = (data.slug && data.slug.trim().length > 0)
    ? generateSlug(data.slug)
    : generateSlug(data.name);

  try {
    const existingSlug = await prisma.investor.findFirst({
      where: {
        slug,
        ...(id ? { id: { not: id } } : {}),
      },
    });

    if (existingSlug) {
      return { error: `An investor with slug '${slug}' already exists.` };
    }

    const payload = {
      name: data.name.trim(),
      slug,
      type: data.type,
      hqLocation: data.hqLocation.trim(),
      logoUrl: data.logoUrl?.trim() || null,
      websiteUrl: data.websiteUrl.trim(),
      pitchUrl: data.pitchUrl?.trim() || null,
      isCmaAuthorized: Boolean(data.isCmaAuthorized),
      cmaLicenseNumber: data.cmaLicenseNumber?.trim() || null,
      isSvcPartner: Boolean(data.isSvcPartner),
      svcProgramDetails: data.svcProgramDetails?.trim() || null,
      regulatoryCategory: data.regulatoryCategory?.trim() || (data.isCmaAuthorized ? 'CMA-Authorized Capital Market Institution' : 'Institutional Fund'),
      saudiRegulated: Boolean(data.isCmaAuthorized || data.isSvcPartner),
      licenseDetails: data.isCmaAuthorized
        ? (data.cmaLicenseNumber?.trim() || 'CMA Authorized')
        : (data.isSvcPartner ? 'SVC Partner Fund' : 'Institutional Vehicle'),
      isActiveInvesting: Boolean(data.isActiveInvesting),
      isPublished: Boolean(data.isPublished),
      isFeatured: Boolean(data.isFeatured),
      targetStages: data.targetStages || [],
      targetSectors: data.targetSectors || [],
      checkSizeRange: data.checkSizeRange?.trim() || null,
      portfolioHighlights: data.portfolioHighlights || [],
      description: data.description.trim(),
      thesisSummary: data.thesisSummary?.trim() || null,
      sourceName: data.sourceName.trim(),
      sourceUrl: data.sourceUrl?.trim() || null,
      verifiedBy: user.name || user.email || 'SFT Editorial Staff',
      verifiedAt: new Date(),
    };

    let resultId = id;

    if (id) {
      await prisma.investor.update({
        where: { id },
        data: payload,
      });
    } else {
      const created = await prisma.investor.create({
        data: payload,
      });
      resultId = created.id;
    }

    safeRevalidate('/admin/investors');
    safeRevalidate('/funding');
    safeRevalidate(`/investor/${slug}`);
    safeRevalidate('/');

    return { success: true, id: resultId };
  } catch (err: any) {
    return { error: err.message || 'Failed to save investor dossier.' };
  }
}

export async function verifyInvestorLicenseAction(id: string): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors can verify investor licenses.' };
  }

  try {
    const inv = await prisma.investor.findUnique({ where: { id } });
    if (!inv) return { error: 'Investor not found.' };

    await prisma.investor.update({
      where: { id },
      data: {
        verifiedAt: new Date(),
        verifiedBy: user.name || user.email || 'SFT Editorial Board',
      },
    });

    safeRevalidate('/admin/investors');
    safeRevalidate('/funding');
    safeRevalidate(`/investor/${inv.slug}`);
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to verify investor license.' };
  }
}

export async function toggleInvestorPublishAction(id: string): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can publish investors.' };
  }

  try {
    const inv = await prisma.investor.findUnique({ where: { id } });
    if (!inv) return { error: 'Investor not found.' };

    const willPublish = !inv.isPublished;

    // Strict validation before publishing
    if (willPublish) {
      if (!inv.websiteUrl || !inv.websiteUrl.startsWith('http')) {
        return { error: 'Cannot publish: A valid official website URL is required.' };
      }
      if (!inv.description || inv.description.trim().length === 0) {
        return { error: 'Cannot publish: Investor description is mandatory.' };
      }
      if (!inv.sourceName || inv.sourceName.trim().length === 0) {
        return { error: 'Cannot publish: Official provenance source name is required.' };
      }
    }

    await prisma.investor.update({
      where: { id },
      data: {
        isPublished: willPublish,
        updatedAt: new Date(),
      },
    });

    safeRevalidate('/admin/investors');
    safeRevalidate('/funding');
    safeRevalidate(`/investor/${inv.slug}`);
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle publication status.' };
  }
}

export async function deleteInvestorAction(id: string): Promise<AdminActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied.' };
  }

  try {
    const inv = await prisma.investor.findUnique({ where: { id }, select: { slug: true } });
    await prisma.investor.delete({ where: { id } });

    safeRevalidate('/admin/investors');
    safeRevalidate('/funding');
    if (inv?.slug) {
      safeRevalidate(`/investor/${inv.slug}`);
    }
    safeRevalidate('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete investor.' };
  }
}
