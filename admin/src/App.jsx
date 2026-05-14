import React from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { getToken, clearToken } from './api.js';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import VideosPage from './pages/VideosPage.jsx';
import LivePage from './pages/LivePage.jsx';
import TemplesPage from './pages/TemplesPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import BannersPage from './pages/BannersPage.jsx';
import AnnouncementsPage from './pages/AnnouncementsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import DonationsPage from './pages/DonationsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

function RequireAuth({ children }) {
  const loc = useLocation();
  if (!getToken()) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

function Shell({ children }) {
  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Nandhi TV</h1>
        <NavLink to="/"               end>Dashboard</NavLink>
        <NavLink to="/videos">           Videos</NavLink>
        <NavLink to="/live">             Live</NavLink>
        <NavLink to="/banners">          Banners</NavLink>
        <NavLink to="/temples">          Temples</NavLink>
        <NavLink to="/events">           Events</NavLink>
        <NavLink to="/announcements">    Announcements</NavLink>
        <NavLink to="/notifications">    Notifications</NavLink>
        <NavLink to="/donations">        Donations</NavLink>
        <NavLink to="/about">            About</NavLink>
        <button
          onClick={() => { clearToken(); window.location.href = `${import.meta.env.BASE_URL}login`; }}
          style={{
            marginTop: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.4)',
            color: 'white', borderRadius: 6, padding: '8px 14px', fontWeight: 600,
          }}
        >
          Log out
        </button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Shell>
              <Routes>
                <Route path="/"               element={<Dashboard />} />
                <Route path="/videos"         element={<VideosPage />} />
                <Route path="/live"           element={<LivePage />} />
                <Route path="/banners"        element={<BannersPage />} />
                <Route path="/temples"        element={<TemplesPage />} />
                <Route path="/events"         element={<EventsPage />} />
                <Route path="/announcements"  element={<AnnouncementsPage />} />
                <Route path="/notifications"  element={<NotificationsPage />} />
                <Route path="/donations"      element={<DonationsPage />} />
                <Route path="/about"          element={<AboutPage />} />
                <Route path="*"               element={<Navigate to="/" replace />} />
              </Routes>
            </Shell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
