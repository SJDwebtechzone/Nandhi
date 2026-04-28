import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = { title: '', description: '', youtube_url: '', is_live: true };

export default function LivePage() {
  const [streams, setStreams] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const load = async () => {
    try { const r = await api.get('/live'); setStreams(r.data.streams || []); }
    catch (e) { setErr(e.response?.data?.error || 'Failed to load'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    if (!form.title.trim()) return setErr('Title required');
    try {
      await api.post('/live', form);
      setForm(empty); setMsg('Live stream added'); await load();
    } catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };

  const setLive = async (id, is_live) => {
    try { await api.put(`/live/${id}`, { is_live }); await load(); }
    catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };
  const remove = async (id) => {
    if (!confirm('Delete this stream?')) return;
    await api.delete(`/live/${id}`); await load();
  };

  return (
    <div>
      <h2>Live streams</h2>

      <div className="card">
        <h3>Add stream</h3>
        <form onSubmit={submit}>
          <label>Title *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label>YouTube URL (live)</label>
          <input
            placeholder="https://www.youtube.com/live/..."
            value={form.youtube_url}
            onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
          />
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label>
            <input type="checkbox" checked={form.is_live}
                   onChange={(e) => setForm({ ...form, is_live: e.target.checked })} />
            {' '}Mark as live now (will replace any existing live)
          </label>
          <div><button className="btn" style={{ marginTop: 10 }}>Add stream</button></div>
          {msg && <div className="ok" style={{ marginTop: 8 }}>{msg}</div>}
          {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
        </form>
      </div>

      <div className="card">
        <h3>All streams ({streams.length})</h3>
        <table>
          <thead><tr><th>Title</th><th>Live</th><th>Started</th><th></th><th></th></tr></thead>
          <tbody>
            {streams.length === 0 && <tr><td colSpan={5} style={{ color: '#999' }}>No streams yet.</td></tr>}
            {streams.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.is_live ? <span className="badge" style={{ background: '#FFEEEE', color: '#b71c1c' }}>LIVE</span> : '—'}</td>
                <td>{s.started_at ? new Date(s.started_at).toLocaleString() : '—'}</td>
                <td>
                  <button className="btn secondary" onClick={() => setLive(s.id, !s.is_live)}>
                    {s.is_live ? 'End' : 'Go live'}
                  </button>
                </td>
                <td><button className="btn danger" onClick={() => remove(s.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
