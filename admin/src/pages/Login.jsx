import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveToken } from '../api.js';

export default function Login() {
  const [email, setEmail] = useState('admin@nandhitv.com');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveToken(data.token);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginShell">
      <div className="loginGlow glow1" />
      <div className="loginGlow glow2" />

      <div className="loginCard">
        <div className="loginHero">
          <div className="heroOrnamentTop">✦ · ◈ · ✦</div>

          <div className="heroLogo">
            <div className="heroLogoCircle">
              <span className="heroOm">ॐ</span>
            </div>
          </div>

          <h1 className="heroBrand">Nandhi TV</h1>
          <p className="heroOrg">Nandhi Cultural &amp; Charitable Foundation</p>

          <div className="heroDivider">
            <span className="heroDividerLine" />
            <span className="heroDividerGlyph">◈</span>
            <span className="heroDividerLine" />
          </div>

          <p className="heroTagline">Admin Control Center</p>
          <p className="heroSub">
            Manage videos, live streams, temples, events, banners &amp; donations — all in one place.
          </p>

          <ul className="heroList">
            <li><span className="heroDot" /> Curate daily darshans &amp; trending videos</li>
            <li><span className="heroDot" /> Broadcast live aarti &amp; temple events</li>
            <li><span className="heroDot" /> Monitor donations &amp; devotee activity</li>
          </ul>

          <div className="heroOrnamentBottom">✦ · ◈ · ✦</div>
        </div>

        <div className="loginForm">
          <div className="formHead">
            <div className="formBadge">ADMIN PORTAL</div>
            <h2 className="formTitle">Welcome back</h2>
            <p className="formSub">Sign in to continue to the dashboard</p>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label className="fieldLabel" htmlFor="email">Email address</label>
              <div className="inputWrap">
                <span className="inputIcon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nandhitv.com"
                  className="inputField"
                />
              </div>
            </div>

            <div className="field">
              <label className="fieldLabel" htmlFor="password">Password</label>
              <div className="inputWrap">
                <span className="inputIcon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="inputField"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="inputToggle"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.5 21.5 0 0 1 5.06-6" />
                      <path d="M9.9 5.09A10.94 10.94 0 0 1 12 5c7 0 11 8 11 8a21.5 21.5 0 0 1-3.22 4.31" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {err && (
              <div className="errorBanner" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{err}</span>
              </div>
            )}

            <button className="submitBtn" type="submit" disabled={loading || !password}>
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="formFooter">
            <span className="footerDot" /> Authorized personnel only
          </div>
          <div className="formVersion">Nandhi TV Admin · v1.0</div>
        </div>
      </div>
    </div>
  );
}
