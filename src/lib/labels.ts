/**
 * Human labels for directory enums, plus deadline maths.
 * Shared by every public page so wording stays consistent.
 */

export function stageLabel(stage?: string | null): string {
  switch (stage) {
    case 'BOOTSTRAPPED':
      return 'Bootstrapped';
    case 'PRE_SEED':
      return 'Pre-seed';
    case 'SEED':
      return 'Seed';
    case 'SERIES_A':
      return 'Series A';
    case 'SERIES_B':
      return 'Series B';
    case 'SERIES_B_PLUS':
      return 'Series B+';
    case 'SERIES_C':
      return 'Series C+';
    case 'GROWTH':
      return 'Growth';
    default:
      return stage ? titleCase(stage) : '—';
  }
}

export function opportunityTypeLabel(category?: string | null): string {
  switch (category) {
    case 'GRANT':
      return 'Grant';
    case 'ACCELERATOR':
      return 'Accelerator';
    case 'INCUBATOR':
      return 'Incubator';
    case 'SUBSIDY':
      return 'Subsidy';
    case 'GOVERNMENT_PROGRAM':
      return 'Government programme';
    case 'SUBSIDIZED_PERK':
      return 'Credits & perks';
    case 'HACKATHON':
      return 'Hackathon';
    default:
      return category ? titleCase(category) : '—';
  }
}

export function investorTypeLabel(type?: string | null): string {
  switch (type) {
    case 'VENTURE_CAPITAL':
      return 'Venture capital';
    case 'CORPORATE_VC':
      return 'Corporate VC';
    case 'GOVERNMENT_FUND':
      return 'Government fund';
    case 'FAMILY_OFFICE':
      return 'Family office';
    case 'ANGEL_NETWORK':
      return 'Angel network';
    default:
      return type ? titleCase(type) : '—';
  }
}

export function businessModelLabel(model?: string | null): string {
  if (!model) return '—';
  return model === 'MARKETPLACE' ? 'Marketplace' : model;
}

export function titleCase(raw: string): string {
  const s = raw.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Whole days from now until `iso`. Negative when past. */
export function daysUntil(iso?: string | Date | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}

export type DeadlineInfo = {
  /** e.g. "12 Dec" or "Rolling" */
  date: string;
  /** e.g. "7 days left", "Closed", "Open all year" */
  note: string;
  /** true when ≤ 14 days remain — render in clay */
  urgent: boolean;
  closed: boolean;
};

export function deadlineInfo(deadline?: string | Date | null, status?: string | null): DeadlineInfo {
  if (status === 'ROLLING' || !deadline) {
    return { date: 'Rolling', note: 'Applications open year-round', urgent: false, closed: status === 'CLOSED' };
  }
  const d = daysUntil(deadline)!;
  const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Riyadh' }).format(
    new Date(deadline)
  );
  if (d < 0 || status === 'CLOSED') return { date, note: 'Closed', urgent: false, closed: true };
  if (d === 0) return { date, note: 'Closes today', urgent: true, closed: false };
  if (d === 1) return { date, note: '1 day left', urgent: true, closed: false };
  return { date, note: `${d} days left`, urgent: d <= 14, closed: false };
}

/** Condense an equity description to a figure: "0% Equity (Zero Dilution)" → "0%". */
export function shortEquity(raw: string | null | undefined): string {
  if (!raw) return '—';
  const m = raw.match(/\d+(\.\d+)?\s*%/);
  if (m) return m[0].replace(/\s/g, '');
  if (/none|zero|non-dilutive/i.test(raw)) return '0%';
  return raw;
}
