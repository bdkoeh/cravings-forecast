import { useState, useEffect } from 'preact/hooks';

export function AdminPages() {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages/about')
      .then(r => r.json())
      .then(data => setContent(data.content || ''))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/pages/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div class="admin-section">
      <h2>About Page</h2>
      <p class="admin-hint">Supports Markdown: **bold**, *italic*, [links](url), # headings, etc.</p>
      <textarea
        class="admin-page-editor"
        value={content}
        onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
        rows={16}
      />
      <div class="admin-page-actions">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saved && <span class="admin-saved">Saved!</span>}
      </div>
    </div>
  );
}
