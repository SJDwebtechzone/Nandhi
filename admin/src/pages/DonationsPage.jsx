import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const STATUS_COLOR = {
  success:  '#2e7d32',
  pending:  '#946800',
  failed:   '#b71c1c',
  refunded: '#5e35b1',
};

export default function DonationsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [err, setErr] = useState('');

  const load = async () => {
    try { const r = await api.get('/donations'); setItems(r.data.donations || []); }
    catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try { await api.put(`/donations/${id}/status`, { status }); await load(); }
    catch (e) { setErr(e.response?.data?.error || 'Failed'); }
  };

  const visible = filter === 'all' ? items : items.filter((d) => d.status === filter);
  const total = visible
    .filter((d) => d.status === 'success')
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <div>
      <h2>Donations</h2>

      <div className="card">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <label style={{ margin: 0 }}>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 160 }}>
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <span className="badge">Total successful: ₹{total.toLocaleString('en-IN')}</span>
        </div>
        {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
      </div>

      <div className="card">
        <h3>{visible.length} record{visible.length === 1 ? '' : 's'}</h3>
        <table>
          <thead>
            <tr>
              <th>When</th><th>Donor</th><th>Amount</th><th>Method</th>
              <th>Status</th><th>Reference</th><th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <tr><td colSpan={7} style={{ color: '#999' }}>No donations to show.</td></tr>}
            {visible.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.created_at).toLocaleString()}</td>
                <td>
                  {d.donor_name || '-'}
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {d.donor_phone || d.donor_email || ''}
                  </div>
                </td>
                <td><strong>₹{Number(d.amount).toLocaleString('en-IN')}</strong></td>
                <td>{d.payment_method}</td>
                <td><span style={{ color: STATUS_COLOR[d.status] || '#666', fontWeight: 700 }}>{d.status}</span></td>
                <td style={{ fontSize: 11, color: '#666' }}>
                  {d.razorpay_payment_id || d.razorpay_order_id || '—'}
                </td>
                <td>
                  {d.status !== 'success'  && <button className="btn"          onClick={() => setStatus(d.id, 'success')}>Mark success</button>}
                  {' '}
                  {d.status !== 'refunded' && <button className="btn secondary" onClick={() => setStatus(d.id, 'refunded')}>Refund</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
