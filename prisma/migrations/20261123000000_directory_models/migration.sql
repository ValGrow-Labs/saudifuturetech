-- CreateEnum
CREATE TYPE "OpportunityCategory" AS ENUM ('GRANT', 'ACCELERATOR', 'INCUBATOR', 'SUBSIDY', 'GOVERNMENT_PROGRAM', 'SUBSIDIZED_PERK', 'HACKATHON');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('OPEN', 'CLOSING_SOON', 'ROLLING', 'CLOSED');

-- CreateEnum
CREATE TYPE "StartupStage" AS ENUM ('BOOTSTRAPPED', 'PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'SERIES_B_PLUS', 'GROWTH');

-- CreateEnum
CREATE TYPE "BusinessModel" AS ENUM ('B2B', 'B2C', 'B2B2C', 'B2G', 'MARKETPLACE');

-- CreateEnum
CREATE TYPE "InvestorType" AS ENUM ('VENTURE_CAPITAL', 'CORPORATE_VC', 'GOVERNMENT_FUND', 'FAMILY_OFFICE', 'ANGEL_NETWORK', 'ACCELERATOR_FUND');

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "category" "OpportunityCategory" NOT NULL DEFAULT 'GRANT',
    "fundingAmount" TEXT,
    "equityTaken" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "eligibilitySummary" TEXT,
    "eligibilityCriteria" JSONB,
    "benefits" JSONB,
    "requirements" JSONB,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'OPEN',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "deadline" TIMESTAMP(3),
    "applicationUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Startup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "hqCity" TEXT NOT NULL DEFAULT 'Riyadh',
    "foundingYear" INTEGER NOT NULL DEFAULT 2024,
    "stage" "StartupStage" NOT NULL DEFAULT 'SEED',
    "businessModel" "BusinessModel" NOT NULL DEFAULT 'B2B',
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "crNumber" TEXT,
    "crVerified" BOOLEAN NOT NULL DEFAULT false,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "products" JSONB,
    "fundingDisclosed" TEXT,
    "investorsDisclosed" JSONB,
    "techStack" JSONB,
    "keyMetrics" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Startup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "InvestorType" NOT NULL DEFAULT 'VENTURE_CAPITAL',
    "hqLocation" TEXT NOT NULL DEFAULT 'Riyadh, KSA',
    "logoUrl" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "pitchUrl" TEXT,
    "isCmaAuthorized" BOOLEAN NOT NULL DEFAULT false,
    "cmaLicenseNumber" TEXT,
    "isSvcPartner" BOOLEAN NOT NULL DEFAULT false,
    "svcProgramDetails" TEXT,
    "regulatoryCategory" TEXT,
    "saudiRegulated" BOOLEAN NOT NULL DEFAULT true,
    "licenseDetails" TEXT,
    "isActiveInvesting" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "targetStages" JSONB,
    "targetSectors" JSONB,
    "checkSizeRange" TEXT,
    "portfolioHighlights" JSONB,
    "description" TEXT NOT NULL,
    "thesisSummary" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_slug_key" ON "Opportunity"("slug");

-- CreateIndex
CREATE INDEX "Opportunity_slug_idx" ON "Opportunity"("slug");

-- CreateIndex
CREATE INDEX "Opportunity_status_deadline_idx" ON "Opportunity"("status", "deadline");

-- CreateIndex
CREATE INDEX "Opportunity_category_status_idx" ON "Opportunity"("category", "status");

-- CreateIndex
CREATE INDEX "Opportunity_isFeatured_status_idx" ON "Opportunity"("isFeatured", "status");

-- CreateIndex
CREATE INDEX "Opportunity_isPublished_status_idx" ON "Opportunity"("isPublished", "status");

-- CreateIndex
CREATE INDEX "Opportunity_categoryId_idx" ON "Opportunity"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Startup_slug_key" ON "Startup"("slug");

-- CreateIndex
CREATE INDEX "Startup_slug_idx" ON "Startup"("slug");

-- CreateIndex
CREATE INDEX "Startup_stage_verified_idx" ON "Startup"("stage", "verified");

-- CreateIndex
CREATE INDEX "Startup_businessModel_idx" ON "Startup"("businessModel");

-- CreateIndex
CREATE INDEX "Startup_categoryId_idx" ON "Startup"("categoryId");

-- CreateIndex
CREATE INDEX "Startup_isFeatured_idx" ON "Startup"("isFeatured");

-- CreateIndex
CREATE INDEX "Startup_isPublished_idx" ON "Startup"("isPublished");

-- CreateIndex
CREATE INDEX "Startup_hqCity_idx" ON "Startup"("hqCity");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_slug_key" ON "Investor"("slug");

-- CreateIndex
CREATE INDEX "Investor_slug_idx" ON "Investor"("slug");

-- CreateIndex
CREATE INDEX "Investor_type_idx" ON "Investor"("type");

-- CreateIndex
CREATE INDEX "Investor_isPublished_type_idx" ON "Investor"("isPublished", "type");

-- CreateIndex
CREATE INDEX "Investor_isCmaAuthorized_idx" ON "Investor"("isCmaAuthorized");

-- CreateIndex
CREATE INDEX "Investor_isSvcPartner_idx" ON "Investor"("isSvcPartner");

-- CreateIndex
CREATE INDEX "Investor_isActiveInvesting_idx" ON "Investor"("isActiveInvesting");

-- CreateIndex
CREATE INDEX "Investor_isFeatured_idx" ON "Investor"("isFeatured");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Startup" ADD CONSTRAINT "Startup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

