import { useState, useEffect } from 'preact/hooks';
import { useRoute, useLocation } from 'preact-iso';
import { RestaurantTable } from '../components/ui/RestaurantTable';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { REGIONS } from './NeighborhoodMap';
import { usePageTitle, useMetaDescription, useCanonical, useJsonLd } from '../hooks/usePageMeta';

interface Restaurant {
  id: number;
  name: string;
  link: string | null;
  neighborhood: string;
  cuisine_type: string | null;
  conditions: string[];
}

export function NeighborhoodList() {
  const { params } = useRoute();
  const regionId = params.region;
  const { route } = useLocation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Find region data from REGIONS constant
  const region = REGIONS.find(r => r.id === regionId);
  const regionName = region?.name || regionId;
  const neighborhoods = region?.neighborhoods || [];

  usePageTitle(`${regionName} Restaurants — San Francisco`);
  useMetaDescription(`Restaurant recommendations in ${regionName}, San Francisco. Curated picks from a local's guide to SF dining.`);
  useCanonical(`/neighborhoods/${regionId}`);

  useJsonLd(restaurants.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${regionName} Restaurants — San Francisco`,
    numberOfItems: restaurants.length,
    itemListElement: restaurants.slice(0, 50).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://example.com/restaurant/${r.id}`,
      name: r.name,
    })),
  } : null);

  useEffect(() => {
    if (neighborhoods.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch restaurants for each neighborhood in this region, then deduplicate
    Promise.all(
      neighborhoods.map(n =>
        fetch(`/api/restaurants?neighborhood=${encodeURIComponent(n)}`)
          .then(r => r.json())
      )
    )
      .then(results => {
        // Flatten and deduplicate by restaurant id
        const seen = new Set<number>();
        const all: Restaurant[] = results.flat().filter((r: Restaurant) => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
        // Sort alphabetically by name
        all.sort((a, b) => a.name.localeCompare(b.name));
        setRestaurants(all);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [regionId]);

  return (
    <div class="screen bg-full-width">
      <button class="screen-close" onClick={() => route('/neighborhoods')} type="button">Close X</button>
      <div class="neighborhood-list-header">
        <button
          class="neighborhood-list-back"
          onClick={() => route('/neighborhoods')}
          type="button"
        >
          &larr; Back to Map
        </button>
        <h1 class="screen-title">{regionName}</h1>
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <RestaurantTable restaurants={restaurants} showConditionIcons={true} />
      )}
    </div>
  );
}
