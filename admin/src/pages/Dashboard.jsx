import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [v, e, d, u, t] = await Promise.all([
          api.get('/videos').catch(() => ({ data: { videos: [] } })),
          api.get('/events').catch(() => ({ data: { events: [] } })),
          api.get('/donations').catch(() => ({ data: { donations: [] } })),
          api.get('/users').catch(() => ({ data: { users: [] } })),
          api.get('/temples').catch(() => ({ data: { temples: [] } })),
        ]);
        setStats({
          videos:    v.data.videos?.length || 0,
          events:    e.data.events?.length || 0,
          donations: d.data.donations?.length || 0,
          users:     u.data.users?.length || 0,
          temples:   t.data.temples?.length || 0,
        });
      } catch (e) {
        setErr(e.response?.data?.error || 'Failed to load stats');
      }
    })();
  }, []);

  const totalDonated = 0; // TODO: server can return aggregate

  return (
    <div>
      <h2>Dashboard</h2>
      {err && <div className="error">{err}</div>}
      {!stats ? (
        <p>Loading…</p>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <Stat label="Videos"    value={stats.videos} />
          <Stat label="Temples"   value={stats.temples} />
          <Stat label="Events"    value={stats.events} />
          <Stat label="Donations" value={stats.donations} />
          <Stat label="Users"     value={stats.users} />
        </div>
      )}

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Quick links</h3>
        <ul style={{ lineHeight: 1.9 }}>
          <li><a href="/videos">Add a new video</a></li>
          <li><a href="/live">Set the current live stream</a></li>
          <li><a href="/banners">Update home banners</a></li>
          <li><a href="/announcements">Post an announcement</a></li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6a58', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#C43E00', marginTop: 6 }}>{value}</div>
    </div>
  );
}
