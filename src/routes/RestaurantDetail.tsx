import { useState, useEffect } from 'preact/hooks';
import { useRoute, useLocation } from 'preact-iso';
import { ConditionIcon } from '../components/ui/ConditionIcon';
import pickStar from '../assets/images/icons/pick-star.png';
import { usePageTitle, useMetaDescription, useCanonical, useJsonLd } from '../hooks/usePageMeta';

interface Restaurant {
  id: number;
  name: string;
  link: string | null;
  neighborhood: string;
  cuisine_type: string | null;
  description: string | null;
  conditions: string[];
  highlighted?: number;
}

export function RestaurantDetail() {
  const { params } = useRoute();
  const { route } = useLocation();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/restaurants/${params.id}`)
      .then(r => r.json())
      .then(data => { setRestaurant(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  usePageTitle(restaurant ? `${restaurant.name} — ${restaurant.neighborhood}` : undefined);
  useMetaDescription(
    restaurant
      ? `${restaurant.name} in ${restaurant.neighborhood}, San Francisco${restaurant.cuisine_type ? ` — ${restaurant.cuisine_type} cuisine` : ''}. ${restaurant.description || 'A curated pick from SF Cravings Forecast.'}`
      : undefined
  );
  useCanonical(`/restaurant/${params.id}`);
  useJsonLd(
    restaurant
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            name: restaurant.name,
            url: restaurant.link || `https://example.com/restaurant/${restaurant.id}`,
            ...(restaurant.cuisine_type && { servesCuisine: restaurant.cuisine_type }),
            ...(restaurant.description && { description: restaurant.description }),
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'San Francisco',
              addressRegion: 'CA',
              addressCountry: 'US',
              ...(restaurant.neighborhood && { streetAddress: restaurant.neighborhood }),
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
              { '@type': 'ListItem', position: 2, name: 'All Restaurants', item: 'https://example.com/all' },
              { '@type': 'ListItem', position: 3, name: restaurant.name },
            ],
          },
        ]
      : null
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      route('/all');
    }
  };

  if (loading) {
    return (
      <div class="screen bg-single-panel">
        <p class="screen-subtitle">Loading...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div class="screen bg-single-panel">
        <p class="screen-subtitle">Restaurant not found</p>
      </div>
    );
  }

  return (
    <div class="screen bg-single-panel">
      <div class="restaurant-detail">
        <button class="restaurant-detail__close" onClick={handleBack} type="button">
          Close X
        </button>

        <div class="restaurant-detail__columns">
          <div class="restaurant-detail__left">
            {restaurant.conditions.length > 0 && (
              <div class="restaurant-detail__conditions">
                <span class="restaurant-detail__label">Conditions</span>
                <div class="restaurant-detail__condition-icons">
                  {restaurant.conditions.map(c => (
                    <ConditionIcon key={c} condition={c} size="large" />
                  ))}
                </div>
              </div>
            )}

            <div class="restaurant-detail__fields">
              <div class="restaurant-detail__field">
                <span class="restaurant-detail__label">Neighborhood</span>
                <span class="restaurant-detail__value">{restaurant.neighborhood}</span>
              </div>
              {restaurant.cuisine_type && (
                <div class="restaurant-detail__field">
                  <span class="restaurant-detail__label">Cuisine</span>
                  <span class="restaurant-detail__value">{restaurant.cuisine_type}</span>
                </div>
              )}
            </div>
          </div>

          <div class="restaurant-detail__right">
            {restaurant.description && (
              <div class="restaurant-detail__forecast">
                <span class="restaurant-detail__label">Forecast</span>
                <p class="restaurant-detail__description">{restaurant.description}</p>
              </div>
            )}

            {restaurant.link && (
              <a
                class="restaurant-detail__link"
                href={restaurant.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Website &rarr;
              </a>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
