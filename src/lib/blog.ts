import type { CollectionEntry } from 'astro:content';

export type BlogCategorySlug =
  | 'ruler-fundamentals'
  | 'measuring-without-tools'
  | 'unit-conversions'
  | 'screen-calibration'
  | 'printable-practical';

export interface BlogCategoryMeta {
  readonly slug: BlogCategorySlug;
  readonly code: string;
  readonly name: string;
  readonly shortName: string;
  readonly seoTitle: string;
  readonly description: string;
  readonly intro: string;
  readonly ogImage: string;
  readonly ogImageAlt: string;
  readonly primaryToolHref: string;
  readonly primaryToolLabel: string;
}

export const BLOG_CATEGORIES: readonly BlogCategoryMeta[] = [
  {
    slug: 'ruler-fundamentals',
    code: 'Pillar A',
    name: 'Ruler Fundamentals',
    shortName: 'Fundamentals',
    seoTitle: 'Ruler Fundamentals | How to Read Inches, CM & MM Guides',
    description:
      'Step-by-step guides on reading inch and centimeter rulers, 1/8 to 1/32 tick marks, parallax error, and showing rulers in Word Online and PowerPoint Online.',
    intro:
      'Master how physical and on-screen rulers work: reading 1/16-inch fractions and millimeter graduations, avoiding bezel and parallax errors, and configuring built-in page rulers in browser document editors.',
    ogImage: '/og/blog/cat-ruler-fundamentals.png',
    ogImageAlt: 'Ruler Fundamentals category guide on Online Ruler Plus',
    primaryToolHref: '/how-to-use',
    primaryToolLabel: 'Open Ruler User Manual',
  },
  {
    slug: 'measuring-without-tools',
    code: 'Pillar B',
    name: 'Measuring Without Physical Tools',
    shortName: 'No Physical Ruler',
    seoTitle: 'Measure Without a Ruler | Phones, Cards, Coins & Photos',
    description:
      'Practical methods to measure objects without a physical ruler using calibrated smartphone screens, bank cards, regional coins, and 2-point photo scaling.',
    intro:
      'No tape measure nearby? Learn when a calibrated smartphone screen works reliably, what camera and AR apps get wrong versus 2-point photo measurement, and which everyday objects hold exact standardized sizes.',
    ogImage: '/og/blog/cat-measuring-without-tools.png',
    ogImageAlt: 'Measuring Without Physical Tools category guide on Online Ruler Plus',
    primaryToolHref: '/photo-ruler',
    primaryToolLabel: 'Open Photo & Ctrl+V Ruler',
  },
  {
    slug: 'unit-conversions',
    code: 'Pillar C',
    name: 'Inches, CM and MM Conversions',
    shortName: 'Unit Conversions',
    seoTitle: 'Inches, CM & MM Conversion Charts | NIST & 1/16″ Guides',
    description:
      'Accurate inches-to-cm, mm-to-fractional-inch (1/16″ and 1/32″), and 12-inch ruler conversion guides grounded in exact NIST 25.4 mm definitions.',
    intro:
      'Convert between imperial fractions and metric millimeters with zero rounding guesswork. Every table uses the exact international 25.4 mm per inch definition alongside real-world craft, postal, and hardware examples.',
    ogImage: '/og/blog/cat-unit-conversions.png',
    ogImageAlt: 'Inches, CM and MM Conversions category guide on Online Ruler Plus',
    primaryToolHref: '/inch-ruler',
    primaryToolLabel: 'Open Inches & CM Rulers',
  },
  {
    slug: 'screen-calibration',
    code: 'Pillar D',
    name: 'Screen Ruler and Calibration',
    shortName: 'Screen Calibration',
    seoTitle: 'Screen Ruler Calibration & PPI Guides | Online Ruler Plus',
    description:
      'Understand the 96 CSS PPI fallacy, ISO/IEC 7810 credit card calibration, Windows 125%/150% display scaling, macOS Retina resolution, and browser zoom.',
    intro:
      'Why do uncalibrated web rulers drift by 10% to 35%? Explore display pixel density (PPI), operating-system DPI scaling, and quick verification tests that keep on-screen measurements true to scale.',
    ogImage: '/og/blog/cat-screen-calibration.png',
    ogImageAlt: 'Screen Ruler and Calibration category guide on Online Ruler Plus',
    primaryToolHref: '/calibration-guide',
    primaryToolLabel: 'Open PPI Calibration Guide',
  },
  {
    slug: 'printable-practical',
    code: 'Pillar E',
    name: 'Printable Rulers and Practical Applications',
    shortName: 'Printable & Practical',
    seoTitle: 'Printable Rulers & Practical Measuring Guides | Online Ruler Plus',
    description:
      'Print actual-size rulers at 100% scale without shrinkage, measure shipping parcels for USPS, Royal Mail, Canada Post, and AusPost, and measure angles.',
    intro:
      'From defeating printer shrink-to-fit scaling on US Letter and A4 paper to sizing postal parcels and checking angles with an online protractor, apply calibrated measurement tools to everyday tasks.',
    ogImage: '/og/blog/cat-printable-practical.png',
    ogImageAlt: 'Printable Rulers and Practical Applications category guide on Online Ruler Plus',
    primaryToolHref: '/printable-ruler',
    primaryToolLabel: 'Open 1:1 Printable SVG Ruler',
  },
] as const;

export const BLOG_CATEGORY_MAP: Readonly<Record<BlogCategorySlug, BlogCategoryMeta>> =
  Object.fromEntries(BLOG_CATEGORIES.map((cat) => [cat.slug, cat])) as Record<
    BlogCategorySlug,
    BlogCategoryMeta
  >;

export function isBlogCategory(value: string): value is BlogCategorySlug {
  return value in BLOG_CATEGORY_MAP;
}

export function estimateReadingTimeMinutes(markdownBody: string | undefined): number {
  if (!markdownBody) return 3;
  const plain = markdownBody
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~-]/g, ' ');
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 215));
}

export function formatEditorialDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function resolveRelatedArticles(
  current: CollectionEntry<'blog'>,
  allPosts: readonly CollectionEntry<'blog'>[],
  limit = 3,
): CollectionEntry<'blog'>[] {
  const byId = new Map(allPosts.map((p) => [p.id, p]));
  const picked: CollectionEntry<'blog'>[] = [];
  const seen = new Set<string>([current.id]);

  for (const slug of current.data.relatedSlugs) {
    const match = byId.get(slug);
    if (match && !seen.has(match.id)) {
      picked.push(match);
      seen.add(match.id);
    }
  }

  if (picked.length < limit) {
    for (const candidate of allPosts) {
      if (seen.has(candidate.id)) continue;
      if (candidate.data.category === current.data.category) {
        picked.push(candidate);
        seen.add(candidate.id);
        if (picked.length >= limit) break;
      }
    }
  }

  if (picked.length < limit) {
    for (const candidate of allPosts) {
      if (seen.has(candidate.id)) continue;
      picked.push(candidate);
      seen.add(candidate.id);
      if (picked.length >= limit) break;
    }
  }

  return picked.slice(0, limit);
}

export interface SpokeGuideLink {
  readonly href: string;
  readonly label: string;
}

export const SPOKE_GUIDE_LINKS: Readonly<Record<string, readonly SpokeGuideLink[]>> = {
  cmRuler: [
    { href: '/blog/cm-to-inches-on-a-ruler-guide', label: 'How to Measure CM Online & Convert to Inches' },
    { href: '/blog/how-many-cm-in-an-inch-and-12-inch-ruler', label: '1 Inch (2.54 cm) to 12 Inches (30.48 cm) Guide' },
  ],
  mmRuler: [
    { href: '/blog/mm-to-inches-fraction-conversion-chart', label: 'MM to Fractional Inches Chart (1/16″ & 1/32″)' },
    { href: '/blog/how-to-calibrate-online-ruler-credit-card', label: 'Credit Card Calibration Guide (85.60 mm)' },
  ],
  inchRuler: [
    { href: '/blog/ruler-tick-marks-explained-1-8-1-16-1-32', label: '1/2, 1/4, 1/8, 1/16 & 1/32 Inch Markings Explained' },
    { href: '/blog/how-many-cm-in-an-inch-and-12-inch-ruler', label: '12-Inch Ruler in CM (30.48 cm) Explained' },
  ],
  horizontalRuler: [
    { href: '/blog/why-online-rulers-need-calibration-96-ppi', label: 'Why 96 CSS Pixels ≠ 1 Physical Inch' },
    { href: '/blog/windows-macos-display-scaling-screen-ruler', label: 'Windows 125%/150% & macOS Retina Scaling Guide' },
  ],
  verticalRuler: [
    { href: '/blog/can-i-use-my-phone-as-a-ruler', label: 'Using Your Phone as a Ruler: Calibration & Limits' },
    { href: '/blog/how-to-read-a-ruler-inches-and-cm', label: 'How to Read a Ruler in Inches & CM' },
  ],
  photoRuler: [
    { href: '/blog/can-you-use-camera-as-a-ruler', label: 'Camera vs. Photo Calibration vs. Screen Glass' },
    { href: '/blog/how-to-measure-without-a-ruler', label: '9 Everyday Reference Objects for Scaling' },
  ],
  protractor: [
    { href: '/blog/how-to-measure-angles-with-online-protractor', label: 'How to Measure Angles With a 360° Online Protractor' },
    { href: '/blog/how-to-print-actual-size-ruler-100-percent-scale', label: 'Printing Rulers & Protractors at 100% Scale' },
  ],
};
