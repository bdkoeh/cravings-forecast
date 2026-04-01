import { useEffect } from 'preact/hooks';

const SITE_NAME = 'SF Cravings Forecast';
const DEFAULT_DESCRIPTION = 'Curated San Francisco restaurant recommendations matched to the weather. Foggy day comfort food, sunny day patios, late night eats — a local\'s guide to SF dining.';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — San Francisco Restaurant Guide by Weather`;
    return () => {
      document.title = `${SITE_NAME} — San Francisco Restaurant Guide by Weather`;
    };
  }, [title]);
}

export function useMetaDescription(description?: string) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (meta) {
      meta.content = description || DEFAULT_DESCRIPTION;
    }
    return () => {
      if (meta) meta.content = DEFAULT_DESCRIPTION;
    };
  }, [description]);
}

export function useJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | null) {
  useEffect(() => {
    if (!data) return;
    // Support single object or array of schemas
    const schemas = Array.isArray(data) ? data : [data];
    const scripts: HTMLScriptElement[] = [];
    // Remove any existing ones first
    document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
    for (const schema of schemas) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', '');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      scripts.push(script);
    }
    return () => { scripts.forEach(s => s.remove()); };
  }, [data]);
}

export function useCanonical(path: string) {
  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const url = `https://example.com${path}`;
    if (link) {
      link.href = url;
    }
    return () => {
      if (link) link.href = 'https://example.com/';
    };
  }, [path]);
}
