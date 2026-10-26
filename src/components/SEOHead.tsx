import { useEffect } from 'react';
import {
  SeoToolDefinition,
  getCanonicalToolPath,
  buildToolJsonLdSchema
} from '../data/seoToolsCatalog';

interface SEOHeadProps {
  tool: SeoToolDefinition;
}

export default function SEOHead({ tool }: SEOHeadProps) {
  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://devpulse.ai';
    const canonicalPath = getCanonicalToolPath(tool.slug);
    const canonicalUrl = `${origin}${canonicalPath}`;

    // 1. Update Document Title
    document.title = tool.metaTitle;

    // Helper to upsert meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Meta Description & Social OpenGraph / Twitter Cards
    setMetaTag('name', 'description', tool.metaDescription);
    setMetaTag('property', 'og:title', tool.metaTitle);
    setMetaTag('property', 'og:description', tool.metaDescription);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', 'DevPulse AI');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', tool.metaTitle);
    setMetaTag('name', 'twitter:description', tool.metaDescription);

    // 3. Canonical Link Tag pointing to dedicated /tools/:slug URL
    let canonicalLink = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Dynamic JSON-LD Structured Data (SoftwareApplication + WebApplication + HowTo + WebSite + BreadcrumbList + FAQPage)
    const jsonLdPayload = buildToolJsonLdSchema(tool, origin);

    let scriptEl = document.getElementById('devpulse-jsonld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'devpulse-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLdPayload, null, 2);
  }, [tool]);

  return null;
}
