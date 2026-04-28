import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function BannersPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: '', subtitle: '', tint_color: 'rgba(0,0,0,0.4)',
    icon: 'star-four-points', link_type: 'none', link_value: '',
    sort_order: 0, is_active: true,
  });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const load = async () => {
    try { const r = await api.get('/banners'); setItems(r.data.banners || []); }
    catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    if (!form.title.trim()) return setErr('Title required');
    if (!file && !form.image_url) return setErr('Please upload an image');

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== undefined && v !== null && data.append(k, v));
    if (file) data.append('image', file);

    try {
      await api.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ ...form, title: '', subtitle: '' }); setFile(null);
      setMsg('Banner added'); await load();
    } catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete banner?')) return;
    await api.delete(`/banners/${id}`); await load();
  };

  return (
    <div>
      <h2>Home banners</h2>

      <div className="card">
        <h3>Add banner</h3>
        <form onSubmit={submit}>
          <label>Title *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label>Subtitle</label>
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <label>Image (jpg / png, &lt; 5 MB)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="row">
            <div>
              <label>Tint colour (rgba/hex)</label>
              <input value={form.tint_color}
                     onChange={(e) => setForm({ ...form, tint_color: e.target.value })} />
            </div>
            <div>
              <label>Icon (MaterialCommunity)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Link type</label>
              <select value={form.link_type}
                      onChange={(e) => setForm({ ...form, link_type: e.target.value })}>
                <option value="none">None</option>
                <option value="video">Video</option>
                <option value="live">Live</option>
                <option value="temple">Temple list</option>
                <option value="category">Category</option>
                <option value="url">External URL</option>
              </select>
            </div>
            <div>
              <label>Link value (id / url / slug)</label>
              <input value={form.link_value}
                     onChange={(e) => setForm({ ...form, link_value: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Sort order</label>
              <input type="number" value={form.sort_order}
                     onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ marginTop: 30 }}>
                <input type="checkbox" checked={form.is_active}
                       onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                {' '}Active
              </label>
            </div>
          </div>
          <div><button className="btn" style={{ marginTop: 12 }}>Add banner</button></div>
          {msg && <div className="ok" style={{ marginTop: 8 }}>{msg}</div>}
          {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
        </form>
      </div>

      <div className="card">
        <h3>All banners ({items.length})</h3>
        <table>
          <thead><tr><th>Image</th><th>Title</th><th>Link</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} style={{ color: '#999' }}>No banners yet.</td></tr>}
            {items.map((b) => (
              <tr key={b.id}>
                <td>{b.image_url
                      ? <img src={b.image_url} alt="" style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                      : '—'}</td>
                <td>{b.title}<div style={{ fontSize: 11, color: '#999' }}>{b.subtitle}</div></td>
                <td>{b.link_type}{b.link_value ? `: ${b.link_value}` : ''}</td>
                <td>{b.is_active ? 'Yes' : 'No'}</td>
                <td><button className="btn danger" onClick={() => remove(b.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
