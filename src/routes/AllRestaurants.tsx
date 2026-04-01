import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { RestaurantTable } from '../components/ui/RestaurantTable';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { usePageTitle, useMetaDescription, useCanonical, useJsonLd } from '../hooks/usePageMeta';

interface Restaurant {
  id: number;
  name: string;
  link: string | null;
  neighborhood: string;
  cuisine_type: string | null;
  conditions: string[];
}

export function AllRestaurants() {
  const { route } = useLocation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  usePageTitle('All San Francisco Restaurants');
  useMetaDescription('Browse all curated San Francisco restaurant recommendations. Filter by weather condition, neighborhood, or cuisine type.');
  useCanonical('/all');
  useJsonLd(restaurants.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'All San Francisco Restaurant Recommendations',
    numberOfItems: restaurants.length,
    itemListElement: restaurants.slice(0, 50).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://example.com/restaurant/${r.id}`,
      name: r.name,
    })),
  } : null);

  useEffect(() => {
    fetch('/api/restaurants')
      .then(r => r.json())
      .then(data => { setRestaurants(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div class="screen bg-full-width">
      <button class="screen-close" onClick={() => route('/')} type="button">Close X</button>
      <h1 class="screen-title">Travel Forecast</h1>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <RestaurantTable restaurants={restaurants} showConditionIcons={true} />
      )}
    </div>
  );
}
