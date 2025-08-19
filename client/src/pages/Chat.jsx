import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getConversation, listMessages, sendMessage } from '../lib/api'
import { getSocket } from '../lib/socket'

function getMe() {
  try { return JSON.parse(localStorage.getItem('ic_user')) } catch { return null }
}

export default function Chat() {
  const { conversationId } = useParams()
  const [convo, setConvo] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const me = useMemo(() => getMe(), [])
  const bottomRef = useRef(null)

  useEffect(() => {
    let ignore = false
    const run = async () => {
      setLoading(true); setError('')
      try {
        const [c, m] = await Promise.all([
          getConversation(conversationId),
          listMessages(conversationId),
        ])
        if (!ignore) {
          setConvo(c)
          setMsgs(m)
        }
      } catch (e) {
        if (!ignore) setError('Failed to load chat')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [conversationId])

  useEffect(() => {
    const socket = getSocket()

    const join = () => socket.emit('conversation:join', conversationId)
    // Join now, and on every future reconnect
    join()
    socket.on('connect', join)
    socket.on('reconnect', join)
    const onNew = (message) => {
      if (message.conversationId === conversationId) {
        setMsgs(prev => [...prev, message])
        scrollBottom()
      }
    }
    socket.on('message:new', onNew)
    return () => {
      socket.off('message:new', onNew)
      socket.off('connect', join)
      socket.off('reconnect', join)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  useEffect(() => { scrollBottom() }, [msgs.length])

  const scrollBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  const onSend = async (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    try {
      const msg = await sendMessage(conversationId, { senderId: me._id, text: t })
      setMsgs(prev => [...prev, msg])
      setText('')
    } catch (e) {
      alert('Failed to send')
    }
  }

  const other = useMemo(() => {
    if (!convo || !me) return null
    return (convo.participants || []).find(p => p._id !== me._id)
  }, [convo, me])

  return (
    <div style={{ height:'100%', display:'grid', gridTemplateRows:'auto 1fr auto' }}>
      <div style={{ padding:12, borderBottom:'1px solid #eee' }}>
        {other ? (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <img src={other.avatarUrl || 'https://placehold.co/32x32'} width={32} height={32} style={{ borderRadius:'50%' }} />
            <div>
              <div style={{ fontWeight:600 }}>{other.displayName}</div>
              <div style={{ color:'#777' }}>@{other.username}</div>
            </div>
          </div>
        ) : <strong>Chat</strong>}
      </div>

      <div style={{ overflow:'auto', padding:12, display:'flex', flexDirection:'column', gap:8 }}>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color:'red' }}>{error}</div>}
        {msgs.map(m => (
          <div key={m._id} style={{ alignSelf: m.senderId?._id === me?._id ? 'flex-end' : 'flex-start',
            background: m.senderId?._id === me?._id ? '#daf1ff' : '#f3f3f3', borderRadius:8, padding:'8px 10px', maxWidth:'70%' }}>
            <div style={{ fontSize:12, color:'#666' }}>{m.senderId?.displayName || 'Unknown'}</div>
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSend} style={{ display:'flex', gap:8, padding:12, borderTop:'1px solid #eee' }}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" style={{ flex:1 }} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
