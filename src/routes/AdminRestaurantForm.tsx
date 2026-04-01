import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';

const CONDITIONS = ['foggy', 'sunny', 'night'];

interface LookupItem {
  id: number;
  name: string;
}

export function AdminRestaurantForm() {
  const { path, route } = useLocation();
  // Extract ID from path: /admin/restaurants/:id/edit
  const editMatch = path.match(/\/admin\/restaurants\/(\d+)\/edit/);
  const editId = editMatch ? editMatch[1] : null;
  const isEditing = Boolean(editId);

  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [neighborhoodId, setNeighborhoodId] = useState<number | ''>('');
  const [cuisineId, setCuisineId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [neighborhoods, setNeighborhoods] = useState<LookupItem[]>([]);
  const [cuisines, setCuisines] = useState<LookupItem[]>([]);

  // Load lookup lists
  useEffect(() => {
    fetch('/api/admin/neighborhoods').then(r => r.json()).then(setNeighborhoods).catch(() => {});
    fetch('/api/admin/cuisines').then(r => r.json()).then(setCuisines).catch(() => {});
  }, []);

  // Load existing restaurant data when editing
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/restaurants/${editId}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setName(data.name || '');
        setLink(data.link || '');
        setNeighborhoodId(data.neighborhood_id || '');
        setCuisineId(data.cuisine_id || '');
        setDescription(data.description || '');
        setConditions(data.conditions || []);
      })
      .catch(() => setError('Failed to load restaurant'));
  }, [editId]);

  const toggleCondition = (condition: string) => {
    setConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (conditions.length === 0) {
      setError('Please select at least one weather condition');
      return;
    }

    setLoading(true);

    const body = {
      name: name.trim(),
      link: link.trim() || null,
      neighborhood_id: Number(neighborhoodId),
      cuisine_id: cuisineId ? Number(cuisineId) : null,
      description: description.trim() || null,
      conditions,
    };

    const url = isEditing
      ? `/api/admin/restaurants/${editId}`
      : '/api/admin/restaurants';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        route('/admin/restaurants');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to save restaurant');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit Restaurant' : 'Add Restaurant'}</h2>
      {error && <p class="admin-error">{error}</p>}
      <form class="admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Name *</span>
          <input
            type="text"
            value={name}
            onInput={e => setName((e.target as HTMLInputElement).value)}
            required
          />
        </label>

        <label>
          <span>Link</span>
          <input
            type="url"
            value={link}
            onInput={e => setLink((e.target as HTMLInputElement).value)}
            placeholder="https://..."
          />
        </label>

        <label>
          <span>Neighborhood *</span>
          <select
            value={neighborhoodId}
            onChange={e => setNeighborhoodId(Number((e.target as HTMLSelectElement).value) || '')}
            required
          >
            <option value="">Select neighborhood...</option>
            {neighborhoods.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Cuisine Type</span>
          <select
            value={cuisineId}
            onChange={e => setCuisineId(Number((e.target as HTMLSelectElement).value) || '')}
          >
            <option value="">None</option>
            {cuisines.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Description</span>
          <textarea
            value={description}
            onInput={e => setDescription((e.target as HTMLTextAreaElement).value)}
            placeholder="What makes this place special..."
          />
        </label>

        <label>
          <span>Weather Conditions *</span>
          <div class="admin-checkbox-group">
            {CONDITIONS.map(c => (
              <label key={c}>
                <input
                  type="checkbox"
                  checked={conditions.includes(c)}
                  onChange={() => toggleCondition(c)}
                />
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </label>
            ))}
          </div>
        </label>

        <div class="admin-form-actions">
          <button
            type="submit"
            class="admin-btn admin-btn--primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Restaurant' : 'Create Restaurant')}
          </button>
          <button
            type="button"
            class="admin-btn"
            onClick={() => route('/admin/restaurants')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
