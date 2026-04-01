import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import snarkdown from 'snarkdown';
import { usePageTitle, useMetaDescription, useCanonical } from '../hooks/usePageMeta';

export function About() {
  const { route } = useLocation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  usePageTitle('About');
  useMetaDescription('About SF Cravings Forecast — a curated San Francisco restaurant guide styled after the 90s Weather Channel.');
  useCanonical('/about');

  useEffect(() => {
    fetch('/api/pages/about')
      .then(r => r.json())
      .then(data => { setContent(data.content || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div class="screen bg-single-panel">
      <div class="about-page">
        <button class="restaurant-detail__close" onClick={() => route('/')} type="button">
          Close X
        </button>
        {loading ? (
          <p class="screen-subtitle">Loading...</p>
        ) : (
          <div
            class="about-page__content"
            dangerouslySetInnerHTML={{ __html: snarkdown(content.replace(/\n/g, '  \n')) }}
          />
        )}
      </div>
    </div>
  );
}
