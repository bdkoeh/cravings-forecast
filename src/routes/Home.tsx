import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { ConditionIcon } from '../components/ui/ConditionIcon';
import { usePageTitle, useCanonical, useJsonLd } from '../hooks/usePageMeta';

// Fallbacks if API hasn't loaded yet
const DEFAULT_CONDITIONS = [
  { slug: 'foggy', name: 'Fog-proof Comfort Foods', tag: 'CZY' },
  { slug: 'sunny', name: 'Grab a Spot in the Sun', tag: 'SNY' },
  { slug: 'night', name: 'Evening Out in the City', tag: 'NTE' },
];

interface ConditionMeta {
  condition: string;
  tag: string;
  description: string;
}

interface ConditionStats {
  condition: string;
  spots: number;
  picks: number;
}

export function Home() {
  const { route } = useLocation();
  const [stats, setStats] = useState<ConditionStats[]>([]);
  const [meta, setMeta] = useState<ConditionMeta[]>([]);

  useEffect(() => {
    fetch('/api/condition-stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/condition-meta').then(r => r.json()).then(setMeta).catch(() => {});
  }, []);

  usePageTitle();
  useCanonical('/');
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SF Cravings Forecast',
    url: 'https://example.com/',
    description: 'Curated San Francisco restaurant recommendations matched to the weather.',
  });

  const conditions = DEFAULT_CONDITIONS.map(c => {
    const m = meta.find(m => m.condition === c.slug);
    return m ? { slug: c.slug, name: m.description, tag: m.tag } : c;
  });

  return (
    <div class="screen bg-three-column">
      <div class="condition-picker">
        {conditions.map(c => {
          const s = stats.find(s => s.condition === c.slug);
          return (
            <button
              key={c.slug}
              class="condition-picker__column"
              onClick={() => route(`/condition/${c.slug}`)}
              type="button"
            >
              <span class="condition-picker__tag">{c.tag}</span>
              <ConditionIcon condition={c.slug} size="large" />
              <span class="condition-picker__label">{c.name}</span>
              <div class="condition-picker__stats">
                <div class="condition-picker__stat">
                  <span class="condition-picker__stat-label">SPOTS</span>
                  <span class="condition-picker__stat-value">{s?.spots ?? '—'}</span>
                </div>
                <div class="condition-picker__stat">
                  <span class="condition-picker__stat-label">PICKS</span>
                  <span class="condition-picker__stat-value">{s?.picks ?? '—'}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
