import { useState, useEffect } from 'preact/hooks';

interface Cuisine {
  id: number;
  name: string;
}

export function AdminCuisines() {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const loadCuisines = () => {
    fetch('/api/admin/cuisines')
      .then(r => r.json())
      .then(setCuisines)
      .catch(() => setError('Failed to load cuisines'));
  };

  useEffect(loadCuisines, []);

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    const res = await fetch('/api/admin/cuisines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName('');
      loadCuisines();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to create cuisine');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    setError('');
    const res = await fetch(`/api/admin/cuisines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditName('');
      loadCuisines();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to update cuisine');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this cuisine?')) return;
    setError('');
    const res = await fetch(`/api/admin/cuisines/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadCuisines();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to delete cuisine');
    }
  };

  const startEdit = (cuisine: Cuisine) => {
    setEditingId(cuisine.id);
    setEditName(cuisine.name);
  };

  return (
    <div>
      <h2>Cuisines</h2>
      {error && <p class="admin-error">{error}</p>}

      <form onSubmit={handleCreate} style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={newName}
          onInput={(e) => setNewName((e.target as HTMLInputElement).value)}
          placeholder="New cuisine type..."
          required
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
        />
        <button type="submit" class="admin-btn admin-btn--primary">Add</button>
      </form>

      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cuisines.map(c => (
            <tr key={c.id}>
              <td>
                {editingId === c.id ? (
                  <input
                    type="text"
                    value={editName}
                    onInput={(e) => setEditName((e.target as HTMLInputElement).value)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '3px' }}
                  />
                ) : (
                  c.name
                )}
              </td>
              <td class="admin-actions">
                {editingId === c.id ? (
                  <>
                    <button class="admin-btn admin-btn--primary" onClick={() => handleUpdate(c.id)}>Save</button>
                    <button class="admin-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button class="admin-btn" onClick={() => startEdit(c)}>Edit</button>
                    <button class="admin-btn admin-btn--danger" onClick={() => handleDelete(c.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
