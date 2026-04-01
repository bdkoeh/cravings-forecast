import { useState, useEffect } from 'preact/hooks';
import { useRoute, useLocation } from 'preact-iso';
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

export function ConditionList() {
  const { params } = useRoute();
  const { route } = useLocation();
  const condition = params.condition;
  const CONDITION_LABELS: Record<string, string> = {
    foggy: 'Foggy Day',
    sunny: 'Sunny Day',
    night: 'Late Night',
  };
  const label = CONDITION_LABELS[condition] || condition;

  usePageTitle(`${label} Restaurants in San Francisco`);
  useMetaDescription(`San Francisco restaurant recommendations for ${label.toLowerCase()} weather. Curated picks from a local's guide to SF dining.`);
  useCanonical(`/condition/${condition}`);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useJsonLd(restaurants.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${label} Restaurants in San Francisco`,
    numberOfItems: restaurants.length,
    itemListElement: restaurants.slice(0, 50).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://example.com/restaurant/${r.id}`,
      name: r.name,
    })),
  } : null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/restaurants?condition=${condition}`)
      .then(r => r.json())
      .then(data => { setRestaurants(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [condition]);

  return (
    <div class="screen bg-full-width">
      <button class="screen-close" onClick={() => route('/')} type="button">Close X</button>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <RestaurantTable restaurants={restaurants} showConditionIcons={false} />
      )}
    </div>
  );
}
