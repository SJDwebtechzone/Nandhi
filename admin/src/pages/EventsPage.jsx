import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = {
  title: '', description: '', image_url: '', start_date: '', end_date: '',
  location: '', is_published: true, registration_required: false, registration_link: '',
};

export default function EventsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const load = async () => {
    try { const r = await api.get('/events'); setItems(r.data.events || []); }
    catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    if (!form.title.trim() || !form.start_date) return setErr('Title and start date required');
    try {
      if (editId) await api.put(`/events/${editId}`, form);
      else        await api.post('/events', form);
      setForm(empty); setEditId(null); setMsg(editId ? 'Updated' : 'Added'); await load();
    } catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };

  const startEdit = (it) => {
    setEditId(it.id);
    setForm({
      ...empty,
      ...it,
      start_date: it.start_date ? it.start_date.slice(0, 16) : '',
      end_date:   it.end_date   ? it.end_date.slice(0, 16)   : '',
    });
    window.scrollTo(0, 0);
  };
  const remove = async (id) => {
    if (!confirm('Delete event?')) return;
    await api.delete(`/events/${id}`); await load();
  };

  return (
    <div>
      <h2>Events</h2>

      <div className="card">
        <h3>{editId ? 'Edit event' : 'Add event'}</h3>
        <form onSubmit={submit}>
          <label>Title *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label>Description</label>
          <textarea value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label>Image URL</label>
          <input value={form.image_url || ''}
                 onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <div className="row">
            <div>
              <label>Start *</label>
              <input type="datetime-local" value={form.start_date}
                     onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label>End</label>
              <input type="datetime-local" value={form.end_date || ''}
                     onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <label>Location</label>
          <input value={form.location || ''}
                 onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <div className="row">
            <div>
              <label style={{ marginTop: 30 }}>
                <input type="checkbox" checked={!!form.is_published}
                       onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                {' '}Published
              </label>
            </div>
            <div>
              <label style={{ marginTop: 30 }}>
                <input type="checkbox" checked={!!form.registration_required}
                       onChange={(e) => setForm({ ...form, registration_required: e.target.checked })} />
                {' '}Registration required
              </label>
            </div>
          </div>
          <label>Registration link (optional)</label>
          <input value={form.registration_link || ''}
                 onChange={(e) => setForm({ ...form, registration_link: e.target.value })} />

          <div style={{ marginTop: 12 }}>
            <button className="btn">{editId ? 'Save' : 'Add event'}</button>
            {editId && <button type="button" className="btn secondary" style={{ marginLeft: 8 }}
                               onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
          {msg && <div className="ok" style={{ marginTop: 8 }}>{msg}</div>}
          {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
        </form>
      </div>

      <div className="card">
        <h3>All events ({items.length})</h3>
        <table>
          <thead><tr><th>Title</th><th>Start</th><th>Location</th><th>Pub</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} style={{ color: '#999' }}>No events yet.</td></tr>}
            {items.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.start_date ? new Date(e.start_date).toLocaleString() : '—'}</td>
                <td>{e.location || '—'}</td>
                <td>{e.is_published ? 'Yes' : 'No'}</td>
                <td>
                  <button className="btn secondary" onClick={() => startEdit(e)}>Edit</button>
                  {' '}
                  <button className="btn danger" onClick={() => remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
