import { useEffect, useState } from 'react'
import { createUser, updateUser } from '../lib/api'

export default function ProfileSetup() {
  const [form, setForm] = useState({ displayName: '', username: '', bio: '', avatarUrl: '' })
  const [existing, setExisting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ic_user'))
      if (stored) {
        setExisting(stored)
        setForm({ displayName: stored.displayName || '', username: stored.username || '', bio: stored.bio || '', avatarUrl: stored.avatarUrl || '' })
      }
    } catch {}
  }, [])

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let user
      if (existing?._id) {
        user = await updateUser(existing._id, { displayName: form.displayName, bio: form.bio, avatarUrl: form.avatarUrl })
        // username immutable for simplicity
      } else {
        user = await createUser(form)
      }
      localStorage.setItem('ic_user', JSON.stringify(user))
      setExisting(user)
      alert('Profile saved')
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '24px auto', padding: 16 }}>
      <h2>{existing ? 'Edit Profile' : 'Create Profile'}</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div>Display Name</div>
          <input name="displayName" value={form.displayName} onChange={onChange} required placeholder="Your name" />
        </label>
        <label>
          <div>Username</div>
          <input name="username" value={form.username} onChange={onChange} required placeholder="unique_username" disabled={!!existing} />
        </label>
        <label>
          <div>Avatar URL</div>
          <input name="avatarUrl" value={form.avatarUrl} onChange={onChange} placeholder="https://..." />
        </label>
        <label>
          <div>Bio</div>
          <textarea name="bio" value={form.bio} onChange={onChange} rows={3} placeholder="Say something about you" />
        </label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  )
}
