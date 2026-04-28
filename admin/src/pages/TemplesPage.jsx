import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = { name: '', alt_name: '', deity: '', city: '', state: '', image_url: '',
                description: '', sthala_puranam: '', sort_order: 0, is_active: true };

export default function TemplesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const load = async () => {
    try { const r = await api.get('/temples'); setItems(r.data.temples || []); }
    catch (e) { setErr(e.response?.data?.error || 'Failed to load'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    if (!form.name.trim()) return setErr('Name required');
    try {
      if (editId) await api.put(`/temples/${editId}`, form);
      else        await api.post('/temples', form);
      setForm(empty); setEditId(null);
      setMsg(editId ? 'Updated' : 'Added'); await load();
    } catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };

  const startEdit = (t) => { setEditId(t.id); setForm({ ...empty, ...t }); window.scrollTo(0, 0); };
  const remove = async (id) => {
    if (!confirm('Delete temple?')) return;
    await api.delete(`/temples/${id}`); await load();
  };

  return (
    <div>
      <h2>Temples (108 Divya Desam)</h2>

      <div className="card">
        <h3>{editId ? 'Edit temple' : 'Add temple'}</h3>
        <form onSubmit={submit}>
          <div className="row">
            <div>
              <label>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label>Alt name (Tamil / Sanskrit)</label>
              <input value={form.alt_name || ''} onChange={(e) => setForm({ ...form, alt_name: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Deity</label>
              <input value={form.deity || ''} onChange={(e) => setForm({ ...form, deity: e.target.value })} />
            </div>
            <div>
              <label>City / State</label>
              <input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" />
              <input style={{ marginTop: 8 }} value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" />
            </div>
          </div>
          <label>Image URL</label>
          <input value={form.image_url || ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <label>Description</label>
          <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label>Sthala Puranam (legend)</label>
          <textarea value={form.sthala_puranam || ''} onChange={(e) => setForm({ ...form, sthala_puranam: e.target.value })} />
          <div className="row">
            <div>
              <label>Sort order</label>
              <input type="number" value={form.sort_order || 0}
                     onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ marginTop: 30 }}>
                <input type="checkbox" checked={!!form.is_active}
                       onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                {' '}Active
              </label>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn">{editId ? 'Save' : 'Add temple'}</button>
            {editId && <button type="button" className="btn secondary" style={{ marginLeft: 8 }}
                               onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
          {msg && <div className="ok" style={{ marginTop: 8 }}>{msg}</div>}
          {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
        </form>
      </div>

      <div className="card">
        <h3>All temples ({items.length})</h3>
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Deity</th><th>City</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} style={{ color: '#999' }}>No temples yet.</td></tr>}
            {items.map((t) => (
              <tr key={t.id}>
                <td>{t.sort_order || '-'}</td>
                <td>{t.name}<div style={{ fontSize: 11, color: '#999' }}>{t.alt_name}</div></td>
                <td>{t.deity || '-'}</td>
                <td>{t.city || '-'}</td>
                <td>{t.is_active ? 'Yes' : 'No'}</td>
                <td>
                  <button className="btn secondary" onClick={() => startEdit(t)}>Edit</button>
                  {' '}
                  <button className="btn danger" onClick={() => remove(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
