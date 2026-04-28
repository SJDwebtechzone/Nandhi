import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = {
  title: '', body: '', vision: '', mission: '',
  contact_email: '', contact_phone: '', contact_address: '',
  website: '', facebook: '', instagram: '', youtube: '', twitter: '',
};

export default function AboutPage() {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/about');
        if (r.data.about) setForm({ ...empty, ...r.data.about });
      } catch (e) { setErr(e.response?.data?.error || 'Failed to load'); }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setBusy(true);
    try {
      await api.put('/about', form);
      setMsg('Saved');
    } catch (e) { setErr(e.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <h2>About Nandhi TV</h2>

      <div className="card">
        <form onSubmit={submit}>
          <label>Title</label>
          <input value={form.title} onChange={set('title')} />

          <label>About body</label>
          <textarea rows={5} value={form.body} onChange={set('body')} />

          <div className="row">
            <div>
              <label>Vision</label>
              <textarea rows={4} value={form.vision} onChange={set('vision')} />
            </div>
            <div>
              <label>Mission</label>
              <textarea rows={4} value={form.mission} onChange={set('mission')} />
            </div>
          </div>

          <h3 style={{ marginTop: 18 }}>Contact</h3>
          <div className="row">
            <div>
              <label>Email</label>
              <input value={form.contact_email} onChange={set('contact_email')} />
            </div>
            <div>
              <label>Phone</label>
              <input value={form.contact_phone} onChange={set('contact_phone')} />
            </div>
          </div>
          <label>Address</label>
          <textarea rows={3} value={form.contact_address} onChange={set('contact_address')} />

          <h3 style={{ marginTop: 18 }}>Social</h3>
          <div className="row">
            <div>
              <label>Website</label>
              <input value={form.website} onChange={set('website')} />
            </div>
            <div>
              <label>YouTube</label>
              <input value={form.youtube} onChange={set('youtube')} />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Facebook</label>
              <input value={form.facebook} onChange={set('facebook')} />
            </div>
            <div>
              <label>Instagram</label>
              <input value={form.instagram} onChange={set('instagram')} />
            </div>
          </div>
          <label>Twitter / X</label>
          <input value={form.twitter} onChange={set('twitter')} />

          <div style={{ marginTop: 14 }}>
            <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
          {msg && <div className="ok" style={{ marginTop: 8 }}>{msg}</div>}
          {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
        </form>
      </div>
    </div>
  );
}
