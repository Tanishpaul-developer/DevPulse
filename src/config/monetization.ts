/**
 * Centralized Hybrid Monetization Configuration for DevPulse AI
 * - Indian UPI Support via Chai4Me
 * - Global Crypto Donations via NOWPayments (300+ Coins)
 * - Contextual Tool-Specific Affiliate Injection (Hostinger, DigitalOcean, BrightData)
 * - Self-Serve Bento Grid Sponsorship Slot ($49/mo)
 */

export const CHAI4ME_UPI_URL = 'https://chai4.me/YOUR_USERNAME';
export const CHAI4ME_LIVE_URL = 'https://www.chai4.me/blueauric';

export const NOWPAYMENTS_PUBLIC_KEY = '821c59c8-dc1e-446c-ac4d-f3035b462fc8';
export const NOWPAYMENTS_DONATE_URL =
  'https://nowpayments.io/donation?api_key=821c59c8-dc1e-446c-ac4d-f3035b462fc8';
export const NOWPAYMENTS_WIDGET_URL =
  'https://nowpayments.io/embeds/donation-widget?api_key=821c59c8-dc1e-446c-ac4d-f3035b462fc8';
export const NOWPAYMENTS_OFFICIAL_BUTTON_SVG =
  'https://nowpayments.io/images/embeds/donation-button-black.svg';

export const AFFILIATE_LINKS = {
  hosting: 'https://hostinger.in?REFERRALCODE=YOUR_CODE', // Used in UI Sandbox, Vision Clone, ROI Calculator
  database: 'https://m.do.co/c/YOUR_CODE', // Used in AI SQL Architect, JSON to TS, Free Templates
  apiSecurity: 'https://get.brightdata.com/YOUR_CODE', // Used in cURL to Code, REST Client, JWT Decoder
} as const;

export type AffiliateCategoryKey = keyof typeof AFFILIATE_LINKS;

export interface ChaiSupportTier {
  id: 'chai-1' | 'chai-3' | 'chai-pro';
  label: string;
  amountInr: number;
  badge: string;
  description: string;
}

export const CHAI_SUPPORT_TIERS: readonly ChaiSupportTier[] = [
  {
    id: 'chai-1',
    label: '1 Chai ₹49',
    amountInr: 49,
    badge: 'Quick Boost',
    description: 'Fuels 500+ free zero-login AI UI & SQL generations for fellow indie devs.',
  },
  {
    id: 'chai-3',
    label: '3 Chais ₹149',
    amountInr: 149,
    badge: 'Most Popular',
    description: 'Covers a full day of high-speed multi-model inference & edge bandwidth.',
  },
  {
    id: 'chai-pro',
    label: 'Pro Supporter ₹499',
    amountInr: 499,
    badge: 'Community Hero',
    description: 'Directly sponsors server uptime and keeps DevPulse AI 100% free & ad-light.',
  },
] as const;

export interface ContextualAffiliateConfig {
  category: AffiliateCategoryKey;
  badge: string;
  headline: string;
  ctaText: string;
  url: string;
  partnerName: string;
}

const DATABASE_TOOL_SLUGS = new Set([
  'ai-sql-generator',
  'json-to-typescript',
  'free-templates',
  'tool-sql',
  'tool-json',
  'studio-gallery',
]);

const API_SECURITY_TOOL_SLUGS = new Set([
  'curl-to-code',
  'jwt-decoder',
  'regex-generator',
  'error-explainer',
  'cron-expression',
  'tool-rest-curl',
  'tool-jwt-base64',
  'tool-regex-cron',
  'tool-stacktrace',
]);

/**
 * Dynamically resolves the contextual affiliate CTA badge, text, and referral URL
 * based on the currently active tool route or workspace navigation ID.
 */
export function getContextualAffiliateForTool(
  toolSlugOrNavId: string | undefined | null
): ContextualAffiliateConfig {
  const key = (toolSlugOrNavId || 'ai-ui-generator').toLowerCase().trim();

  if (DATABASE_TOOL_SLUGS.has(key)) {
    return {
      category: 'database',
      badge: 'Managed Cloud DB Partner',
      headline: 'Deploy Managed PostgreSQL, Redis & Node Clusters with $200 Free Credit',
      ctaText: 'Claim $200 Cloud DB Credit',
      url: AFFILIATE_LINKS.database,
      partnerName: 'DigitalOcean Cloud',
    };
  }

  if (API_SECURITY_TOOL_SLUGS.has(key)) {
    return {
      category: 'apiSecurity',
      badge: 'API Proxy & Security Partner',
      headline: 'Scale Web Scraping, Residential Proxies & Zero-Trust API Testing Globally',
      ctaText: 'Try API Proxy Network Free',
      url: AFFILIATE_LINKS.apiSecurity,
      partnerName: 'BrightData API Network',
    };
  }

  return {
    category: 'hosting',
    badge: 'Global Edge Hosting Partner',
    headline: 'Deploy Your Generated Tailwind UI, React & Next.js Apps in 1 Click ($2.99/mo)',
    ctaText: 'Deploy Live ($2.99/mo)',
    url: AFFILIATE_LINKS.hosting,
    partnerName: 'Hostinger Cloud Edge',
  };
}
