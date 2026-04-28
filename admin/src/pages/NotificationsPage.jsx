import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', image_url: '', link_type: '', link_value: '' });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const load = async () => {
    try { const r = await api.get('/notifications'); setItems(r.data.notifications || []); }
    catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    if (!form.title.trim()) return setErr('Title required');
    if (!confirm('Send this notification to ALL devices?')) return;
    try {
      await api.post('/notifications', form);
      setForm({ title: '', body: '', image_url: '', link_type: '', link_value: '' });
      setMsg('Sent'); await load();
    } catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this notification record?')) return;
    await api.delete(`/notifications/${id}`); await load();
  };

  return (
    <div>
      <h2>Push notifications</h2>

      <div className="card">
        <h3>Send notification</h3>
        <form onSubmit={submit}>
          <label>Title *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label>Body</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <label>Image URL (optional)</label>
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <div className="row">
            <div>
              <label>Link type</label>
              <select value={form.link_type}
                      onChange={(e) => setForm({ ...form, link_type: e.target.value })}>
                <option value="">— none —</option>
                <option value="video">Video</option>
                <option value="live">Live</option>
                <option value="event">Event</option>
                <option value="url">URL</option>
              </select>
            </div>
            <div>
              <label>Link value</label>
              <input value={form.link_value}
                     onChange={(e) => setForm({ ...form, link_value: e.target.value })} />
            </div>
          </div>
          <div><button className="btn" style={{ marginTop: 12 }}>Send to everyone</button></div>
          {msg && <div className="ok" style={{ marginTop: 8 }}>{msg}</div>}
          {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
        </form>
      </div>

      <div className="card">
        <h3>Recent ({items.length})</h3>
        <table>
          <thead><tr><th>Title</th><th>Body</th><th>Sent at</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} style={{ color: '#999' }}>None yet.</td></tr>}
            {items.map((n) => (
              <tr key={n.id}>
                <td>{n.title}</td>
                <td style={{ color: '#666' }}>{(n.body || '').slice(0, 80)}</td>
                <td>{n.sent_at ? new Date(n.sent_at).toLocaleString() : '—'}</td>
                <td><button className="btn danger" onClick={() => remove(n.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
