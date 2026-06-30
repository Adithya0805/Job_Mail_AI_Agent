// Anonymous Client UUID session observer hook (No login required)
import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let uuid = localStorage.getItem('client_uuid')
    if (!uuid) {
      // Generate a persistent random anonymous user ID
      uuid = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('client_uuid', uuid)
    }
    
    setUser({
      uid: uuid,
      displayName: 'Guest User',
      email: 'guest@jobmailai.com'
    })
    setLoading(false)
  }, [])

  return { user, loading }
}
