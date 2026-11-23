/**
 * Arabic names used alongside the English across the site.
 * Render inside an element with `lang="ar" dir="rtl"` so the Arabic font
 * (IBM Plex Sans Arabic) and right-to-left shaping apply.
 */

export const SITE_NAME_AR = 'تقنية المستقبل السعودية';

export const SECTION_NAMES_AR: Record<string, string> = {
  'ai-deep-tech': 'الذكاء الاصطناعي والتقنيات العميقة',
  govtech: 'التقنية الحكومية',
  cybersecurity: 'الأمن السيبراني',
  'smart-cities-infra': 'المدن الذكية والبنية التحتية',
  fintech: 'التقنية المالية',
  'clean-energy': 'الطاقة النظيفة',
};

/** Today in the Umm al-Qura calendar (the Kingdom's official Hijri calendar), in English. */
export function hijriDate(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-GB-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Riyadh',
    }).format(d);
  } catch {
    return '';
  }
}
