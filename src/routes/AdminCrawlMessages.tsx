import { useState, useEffect } from 'preact/hooks';

interface CrawlMessage {
  id: number;
  message: string;
  sort_order: number;
  active: number;
}

export function AdminCrawlMessages() {
  const [messages, setMessages] = useState<CrawlMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [error, setError] = useState('');

  const loadMessages = () => {
    fetch('/api/admin/crawl-messages')
      .then(r => r.json())
      .then(setMessages)
      .catch(() => setError('Failed to load messages'));
  };

  useEffect(loadMessages, []);

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setError('');
    const res = await fetch('/api/admin/crawl-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage.trim(), sort_order: messages.length }),
    });
    if (res.ok) {
      setNewMessage('');
      loadMessages();
    } else {
      setError('Failed to create message');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editMessage.trim()) return;
    setError('');
    const res = await fetch(`/api/admin/crawl-messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: editMessage.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditMessage('');
      loadMessages();
    } else {
      setError('Failed to update message');
    }
  };

  const handleToggleActive = async (msg: CrawlMessage) => {
    await fetch(`/api/admin/crawl-messages/${msg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: msg.active ? 0 : 1 }),
    });
    loadMessages();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this message?')) return;
    const res = await fetch(`/api/admin/crawl-messages/${id}`, { method: 'DELETE' });
    if (res.ok) loadMessages();
  };

  const startEdit = (msg: CrawlMessage) => {
    setEditingId(msg.id);
    setEditMessage(msg.message);
  };

  return (
    <div>
      <h2>Crawl Bar Messages</h2>
      {error && <p class="admin-error">{error}</p>}

      {/* Create new message form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={newMessage}
          onInput={(e) => setNewMessage((e.target as HTMLInputElement).value)}
          placeholder="New crawl bar message..."
          required
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
        />
        <button type="submit" class="admin-btn admin-btn--primary">Add</button>
      </form>

      {/* Message list */}
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Message</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map(msg => (
            <tr key={msg.id}>
              <td>{msg.sort_order}</td>
              <td>
                {editingId === msg.id ? (
                  <input
                    type="text"
                    value={editMessage}
                    onInput={(e) => setEditMessage((e.target as HTMLInputElement).value)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '3px' }}
                  />
                ) : (
                  msg.message
                )}
              </td>
              <td>
                <button
                  class="admin-btn"
                  onClick={() => handleToggleActive(msg)}
                >
                  {msg.active ? 'Yes' : 'No'}
                </button>
              </td>
              <td class="admin-actions">
                {editingId === msg.id ? (
                  <>
                    <button class="admin-btn admin-btn--primary" onClick={() => handleUpdate(msg.id)}>Save</button>
                    <button class="admin-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button class="admin-btn" onClick={() => startEdit(msg)}>Edit</button>
                    <button class="admin-btn admin-btn--danger" onClick={() => handleDelete(msg.id)}>Delete</button>
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
