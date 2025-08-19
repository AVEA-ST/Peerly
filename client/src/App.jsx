import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import './App.css'
import ProfileSetup from './pages/ProfileSetup'
import Users from './pages/Users'
import Chat from './pages/Chat'

function RequireProfile({ children }) {
  const stored = localStorage.getItem('ic_user')
  if (!stored) return <Navigate to="/profile" replace />
  return children
}

function Layout({ children }) {
  const navigate = useNavigate()
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('ic_user')) } catch { return null }
  })()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '8px 12px', borderBottom: '1px solid #eee', display:'flex', alignItems:'center', gap:12 }}>
        <strong>Infinity Community</strong>
        <nav style={{ display:'flex', gap:12, marginLeft:12 }}>
          <Link to="/users">Users</Link>
        </nav>
        <div style={{ marginLeft: 'auto', display:'flex', alignItems:'center', gap:8 }}>
          {user && (
            <>
              <span title={user.username}>Hi, {user.displayName}</span>
              <button onClick={() => navigate('/profile')}>Edit Profile</button>
            </>
          )}
        </div>
      </header>
      <main style={{ flex: 1, minHeight: 0 }}>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/profile" element={<Layout><ProfileSetup /></Layout>} />
      <Route path="/users" element={<Layout><RequireProfile><Users /></RequireProfile></Layout>} />
      <Route path="/chat/:conversationId" element={<Layout><RequireProfile><Chat /></RequireProfile></Layout>} />
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  )
}
