/**
 * Google Analytics 4 (GA4) & Microsoft Clarity Heatmap Configuration
 * Tracks high-intent developer conversion events (Affiliate clicks, Sponsor inquiries, AI generations).
 */

export interface AnalyticsConfig {
  ga4MeasurementId: string;
  clarityProjectId: string;
  enabled: boolean;
}

export const ANALYTICS_CONFIG: AnalyticsConfig = {
  ga4MeasurementId: import.meta.env.VITE_GA4_ID || 'G-DEVPULSE2026',
  clarityProjectId: import.meta.env.VITE_CLARITY_ID || 'devpulse_clarity_2026',
  enabled: true
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function initAnalyticsAndHeatmaps(): void {
  if (typeof window === 'undefined' || !ANALYTICS_CONFIG.enabled) return;

  // Initialize dataLayer and gtag safe stub
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function (...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_CONFIG.ga4MeasurementId, {
      send_page_view: true,
      anonymize_ip: true
    });
  }

  // Initialize Microsoft Clarity safe stub
  if (!window.clarity) {
    window.clarity = function (...args: unknown[]) {
      (window.clarity as unknown as { q?: unknown[] }).q =
        (window.clarity as unknown as { q?: unknown[] }).q || [];
      (window.clarity as unknown as { q?: unknown[] }).q?.push(args);
    };
  }
}

export type ConversionEventName =
  | 'affiliate_hosting_click'
  | 'sponsor_modal_open'
  | 'sponsor_lead_submit'
  | 'ai_artifact_generate'
  | 'seo_indexnow_ping'
  | 'template_download'
  | 'crypto_donate_click'
  | 'crypto_donate_modal_open';

export function trackConversionEvent(
  eventName: ConversionEventName,
  metadata: Record<string, string | number | boolean> = {}
): void {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...metadata,
        timestamp: Date.now()
      });
    }
    if (typeof window.clarity === 'function') {
      window.clarity('set', eventName, String(metadata.label || metadata.tool || 'true'));
    }
  } catch {
    // Ignore tracking blockers
  }
}
