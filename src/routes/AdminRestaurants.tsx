import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';

interface Restaurant {
  id: number;
  name: string;
  neighborhood: string;
  cuisine_type: string | null;
  conditions: string[];
}

export function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const { route } = useLocation();

  const loadRestaurants = () => {
    fetch('/api/restaurants')
      .then(r => r.json())
      .then(setRestaurants)
      .catch(() => {});
  };

  useEffect(loadRestaurants, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/restaurants/${id}`, { method: 'DELETE' });
    if (res.ok) loadRestaurants();
  };

  return (
    <div>
      <div class="admin-header">
        <h2>Restaurants</h2>
        <button class="admin-btn admin-btn--primary" onClick={() => route('/admin/restaurants/new')}>
          + Add Restaurant
        </button>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Neighborhood</th>
            <th>Cuisine</th>
            <th>Conditions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.neighborhood}</td>
              <td>{r.cuisine_type || '-'}</td>
              <td>{r.conditions?.join(', ') || '-'}</td>
              <td class="admin-actions">
                <button class="admin-btn" onClick={() => route(`/admin/restaurants/${r.id}/edit`)}>Edit</button>
                <button class="admin-btn admin-btn--danger" onClick={() => handleDelete(r.id, r.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
