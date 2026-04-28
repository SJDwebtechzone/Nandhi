import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const emptyForm = {
  title: '',
  description: '',
  youtube_url: '',
  category_id: '',
  is_featured: false,
};

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [v, c] = await Promise.all([api.get('/videos'), api.get('/categories')]);
      setVideos(v.data.videos || []);
      setCats(c.data.categories || []);
    } catch (e) {
      setErr('Failed to load videos / categories. Is the backend running?');
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    const title = form.title.trim();
    const url   = form.youtube_url.trim();
    if (!title)  return setErr('Please enter a title.');
    if (!url)    return setErr('Please paste a YouTube URL or video ID.');

    setBusy(true);
    try {
      const payload = {
        title,
        description: form.description.trim() || null,
        youtube_url: url,
        category_id: form.category_id || null,
        is_featured: !!form.is_featured,
      };
      console.log('[admin] POST /videos →', payload);
      await api.post('/videos', payload);
      setForm(emptyForm);
      setMsg('Video added successfully.');
      await load();
    } catch (e) {
      const apiErr = e.response?.data?.error;
      setErr(apiErr || e.message || 'Failed to add video.');
      console.error('[admin] add video failed', e.response?.status, e.response?.data);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await api.delete(`/videos/${id}`);
      await load();
    } catch (e) {
      setErr(e.response?.data?.error || 'Delete failed.');
    }
  };

  return (
    <div>
      <h2>Videos</h2>

      <div className="card">
        <h3>Add new video</h3>
        <form onSubmit={submit} noValidate>
          <label>
            Title <span style={{ color: '#b71c1c' }}>*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Tirumala Daily Darshan – Morning Aarti"
          />

          <label>
            YouTube URL or 11-char ID <span style={{ color: '#b71c1c' }}>*</span>
          </label>
          <input
            value={form.youtube_url}
            onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=...   /   https://youtu.be/...   /   dQw4w9WgXcQ"
          />
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Supports watch / shorts / live / embed / youtu.be URLs and bare video IDs.
          </div>

          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional"
          />

          <div className="row">
            <div>
              <label>Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">-- none --</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ marginTop: 30 }}>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                {' '}Feature on home
              </label>
            </div>
          </div>

          <button className="btn" type="submit" disabled={busy} style={{ marginTop: 14 }}>
            {busy ? 'Adding…' : 'Add video'}
          </button>

          {msg && <div className="ok"    style={{ marginTop: 10 }}>{msg}</div>}
          {err && <div className="error" style={{ marginTop: 10 }}>{err}</div>}
        </form>
      </div>

      <div className="card">
        <h3>All videos ({videos.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Featured</th>
              <th>Views</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr><td colSpan={5} style={{ color: '#999' }}>No videos yet.</td></tr>
            ) : (
              videos.map((v) => (
                <tr key={v.id}>
                  <td>{v.title}</td>
                  <td>{v.category_name || '-'}</td>
                  <td>{v.is_featured ? 'Yes' : ''}</td>
                  <td>{v.view_count}</td>
                  <td>
                    <button className="btn danger" onClick={() => remove(v.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
