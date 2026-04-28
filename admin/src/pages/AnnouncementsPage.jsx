import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function AnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', is_active: true });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const load = async () => {
    try { const r = await api.get('/announcements'); setItems(r.data.announcements || []); }
    catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    if (!form.title.trim()) return setErr('Title required');
    try {
      await api.post('/announcements', form);
      setForm({ title: '', body: '', is_active: true }); setMsg('Posted'); await load();
    } catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete announcement?')) return;
    await api.delete(`/announcements/${id}`); await load();
  };

  return (
    <div>
      <h2>Announcements</h2>

      <div className="card">
        <h3>Post announcement</h3>
        <form onSubmit={submit}>
          <label>Title *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label>Body</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <label>
            <input type="checkbox" checked={form.is_active}
                   onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            {' '}Show on home
          </label>
          <div><button className="btn" style={{ marginTop: 10 }}>Post</button></div>
          {msg && <div className="ok" style={{ marginTop: 8 }}>{msg}</div>}
          {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
        </form>
      </div>

      <div className="card">
        <h3>All announcements ({items.length})</h3>
        <table>
          <thead><tr><th>Title</th><th>Body</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} style={{ color: '#999' }}>None yet.</td></tr>}
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td style={{ color: '#666' }}>{(a.body || '').slice(0, 80)}{(a.body || '').length > 80 ? '…' : ''}</td>
                <td>{a.is_active ? 'Yes' : 'No'}</td>
                <td><button className="btn danger" onClick={() => remove(a.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
