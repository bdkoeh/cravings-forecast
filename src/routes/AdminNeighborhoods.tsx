import { useState, useEffect } from 'preact/hooks';

interface Neighborhood {
  id: number;
  name: string;
}

export function AdminNeighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const loadNeighborhoods = () => {
    fetch('/api/admin/neighborhoods')
      .then(r => r.json())
      .then(setNeighborhoods)
      .catch(() => setError('Failed to load neighborhoods'));
  };

  useEffect(loadNeighborhoods, []);

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    const res = await fetch('/api/admin/neighborhoods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName('');
      loadNeighborhoods();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to create neighborhood');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    setError('');
    const res = await fetch(`/api/admin/neighborhoods/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditName('');
      loadNeighborhoods();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to update neighborhood');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this neighborhood?')) return;
    setError('');
    const res = await fetch(`/api/admin/neighborhoods/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadNeighborhoods();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to delete neighborhood');
    }
  };

  const startEdit = (neighborhood: Neighborhood) => {
    setEditingId(neighborhood.id);
    setEditName(neighborhood.name);
  };

  return (
    <div>
      <h2>Neighborhoods</h2>
      {error && <p class="admin-error">{error}</p>}

      <form onSubmit={handleCreate} style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={newName}
          onInput={(e) => setNewName((e.target as HTMLInputElement).value)}
          placeholder="New neighborhood..."
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
          {neighborhoods.map(n => (
            <tr key={n.id}>
              <td>
                {editingId === n.id ? (
                  <input
                    type="text"
                    value={editName}
                    onInput={(e) => setEditName((e.target as HTMLInputElement).value)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '3px' }}
                  />
                ) : (
                  n.name
                )}
              </td>
              <td class="admin-actions">
                {editingId === n.id ? (
                  <>
                    <button class="admin-btn admin-btn--primary" onClick={() => handleUpdate(n.id)}>Save</button>
                    <button class="admin-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button class="admin-btn" onClick={() => startEdit(n)}>Edit</button>
                    <button class="admin-btn admin-btn--danger" onClick={() => handleDelete(n.id)}>Delete</button>
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
