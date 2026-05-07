import React, { useState, useEffect } from 'react'
import { adminAPI } from '../api'

export default function ShareAccess() {
  const [sharedWith, setSharedWith] = useState([])
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('view')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSharedAccess()
  }, [])

  const fetchSharedAccess = async () => {
    try {
      // Note: This would need an API endpoint to fetch shared access
      // For now, we'll initialize with empty state
      setSharedWith([])
    } catch (err) {
      console.error('Failed to fetch shared access:', err)
    }
  }

  const handleShare = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // Note: This would call an API endpoint to share access
      // For now, we'll simulate success
      const newShare = {
        email,
        permission,
        shared_at: new Date().toISOString()
      }

      setSharedWith([...sharedWith, newShare])
      setEmail('')
      setPermission('view')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to share access')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveShare = (idx) => {
    setSharedWith(sharedWith.filter((_, i) => i !== idx))
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#333'
      }}>
        🔗 Share Your Family Tree
      </h2>

      {/* Share Form */}
      <form onSubmit={handleShare} style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#333'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="user@example.com"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#333'
            }}>
              Permission Level
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                background: '#fafafa'
              }}
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              marginTop: '22px'
            }}
          >
            {loading ? 'Sharing...' : '✓ Share'}
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '15px'
          }}>
            ✓ Family tree shared successfully!
          </div>
        )}
      </form>

      {/* Shared List */}
      <div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#333'
        }}>
          Shared With ({sharedWith.length})
        </h3>

        {sharedWith.length === 0 ? (
          <div style={{
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '6px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ margin: '0' }}>Your family tree is not currently shared with anyone</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '10px'
          }}>
            {sharedWith.map((share, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                    margin: '0 0 5px 0'
                  }}>
                    {share.email}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: '0'
                  }}>
                    {share.permission === 'view' && '📖 View Only'}
                    {share.permission === 'edit' && '✏️ Can Edit'}
                    {share.permission === 'admin' && '👑 Admin'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveShare(idx)}
                  style={{
                    padding: '6px 12px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
