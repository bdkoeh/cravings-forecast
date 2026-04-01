import { useState, useEffect } from 'preact/hooks';

interface ConditionMeta {
  condition: string;
  tag: string;
  description: string;
}

export function AdminConditions() {
  const [conditions, setConditions] = useState<ConditionMeta[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/condition-meta')
      .then(r => r.json())
      .then(setConditions)
      .catch(() => {});
  }, []);

  const handleSave = async (condition: string) => {
    const meta = conditions.find(c => c.condition === condition);
    if (!meta) return;

    setSaving(condition);
    setMessage('');

    const res = await fetch(`/api/admin/condition-meta/${condition}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: meta.tag, description: meta.description }),
    });

    if (res.ok) {
      setMessage(`Updated ${condition}`);
    } else {
      setMessage('Error saving');
    }
    setSaving(null);
  };

  const updateField = (condition: string, field: 'tag' | 'description', value: string) => {
    setConditions(conditions.map(c =>
      c.condition === condition ? { ...c, [field]: value } : c
    ));
  };

  return (
    <div>
      <h1>Manage Conditions</h1>
      {message && <p>{message}</p>}
      <table class="admin-table">
        <thead>
          <tr>
            <th>Condition</th>
            <th>Tag (yellow label)</th>
            <th>Description (white text)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {conditions.map(c => (
            <tr key={c.condition}>
              <td>{c.condition}</td>
              <td>
                <input
                  type="text"
                  value={c.tag}
                  onInput={(e) => updateField(c.condition, 'tag', (e.target as HTMLInputElement).value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={c.description}
                  style="width: 100%;"
                  onInput={(e) => updateField(c.condition, 'description', (e.target as HTMLInputElement).value)}
                />
              </td>
              <td>
                <button
                  onClick={() => handleSave(c.condition)}
                  disabled={saving === c.condition}
                >
                  {saving === c.condition ? 'Saving...' : 'Save'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
