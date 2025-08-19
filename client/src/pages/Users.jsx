import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchUsers, startOrGetDM } from '../lib/api'

function getMe() {
  try { return JSON.parse(localStorage.getItem('ic_user')) } catch { return null }
}

export default function Users() {
  const [q, setQ] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const me = useMemo(() => getMe(), [])

  useEffect(() => {
    let ignore = false
    const run = async () => {
      setLoading(true); setError('')
      try {
        const users = await searchUsers(q)
        if (!ignore) setList(users)
      } catch (e) {
        if (!ignore) setError('Failed to load users')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [q])

  const startChat = async (other) => {
    if (!me?._id) return alert('Please create your profile first')
    try {
      const convo = await startOrGetDM(me._id, other._id)
      navigate(`/chat/${convo._id}`)
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to start chat')
    }
  }

  return (
    <div style={{ display:'grid', gridTemplateRows:'auto 1fr', height:'100%' }}>
      <div style={{ padding:12, borderBottom:'1px solid #eee' }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search users by name or username" style={{ width: '100%', maxWidth: 520 }} />
      </div>
      <div style={{ padding:12, overflow:'auto' }}>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color:'red' }}>{error}</div>}
        <ul style={{ listStyle:'none', padding:0, margin:0, display:'grid', gap:8 }}>
          {list.filter(u => u._id !== me?._id).map(u => (
            <li key={u._id} style={{ display:'flex', alignItems:'center', gap:12, border:'1px solid #eee', padding:8, borderRadius:8 }}>
              <img src={u.avatarUrl || 'https://placehold.co/40x40'} width={40} height={40} style={{ borderRadius:'50%' }} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{u.displayName}</div>
                <div style={{ color:'#777' }}>@{u.username}</div>
              </div>
              <button onClick={() => startChat(u)}>Message</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
