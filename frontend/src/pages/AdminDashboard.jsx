import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI, authAPI } from '../api'
import { useAuthStore } from '../store'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [changes, setChanges] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('changes')

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch change logs
      const changesRes = await adminAPI.getAllChanges()
      if (changesRes.data.success) {
        setChanges(changesRes.data.data.changes || [])
      }

      // Fetch users
      const usersRes = await adminAPI.getAllUsers()
      if (usersRes.data.success) {
        setUsers(usersRes.data.data.users || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  if (!user?.is_admin) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚫</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
            Access Denied
          </h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            You do not have permission to view this page
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        color: 'white'
      }}>
        <div style={{ fontSize: '18px' }}>Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🛡️ Admin Dashboard
            </h1>
            <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
              View family tree changes and manage users
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ← Back
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setActiveTab('changes')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'changes' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
              color: activeTab === 'changes' ? 'white' : '#333',
              border: activeTab === 'changes' ? 'none' : '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📋 Change Logs ({changes.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'users' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
              color: activeTab === 'users' ? 'white' : '#333',
              border: activeTab === 'users' ? 'none' : '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            👥 Users ({users.length})
          </button>
        </div>

        {/* Change Logs Tab */}
        {activeTab === 'changes' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {changes.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                <p>No changes recorded yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{
                        padding: '15px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '14px'
                      }}>
                        Date/Time
                      </th>
                      <th style={{
                        padding: '15px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '14px'
                      }}>
                        User
                      </th>
                      <th style={{
                        padding: '15px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '14px'
                      }}>
                        Member
                      </th>
                      <th style={{
                        padding: '15px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '14px'
                      }}>
                        Action
                      </th>
                      <th style={{
                        padding: '15px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#333',
                        fontSize: '14px'
                      }}>
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.slice(0, 50).map((change, idx) => {
                      const actionColors = {
                        create: '#10b981',
                        update: '#f59e0b',
                        delete: '#ef4444'
                      }
                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #e5e7eb'
                          }}
                        >
                          <td style={{
                            padding: '15px',
                            fontSize: '13px',
                            color: '#666'
                          }}>
                            {new Date(change.created_at).toLocaleString()}
                          </td>
                          <td style={{
                            padding: '15px',
                            fontSize: '13px',
                            color: '#333',
                            fontWeight: '600'
                          }}>
                            {change.user_id}
                          </td>
                          <td style={{
                            padding: '15px',
                            fontSize: '13px',
                            color: '#666'
                          }}>
                            {change.family_member_id}
                          </td>
                          <td style={{
                            padding: '15px',
                            fontSize: '13px'
                          }}>
                            <span style={{
                              background: actionColors[change.action],
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              fontWeight: '600',
                              fontSize: '11px'
                            }}>
                              {change.action}
                            </span>
                          </td>
                          <td style={{
                            padding: '15px',
                            fontSize: '12px',
                            color: '#888'
                          }}>
                            {change.action === 'create' && 'New member added'}
                            {change.action === 'update' && 'Member updated'}
                            {change.action === 'delete' && 'Member deleted'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {users.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👫</div>
                <p>No users found</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                padding: '20px'
              }}>
                {users.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      background: u.is_admin ? '#ffe0e0' : '#f9fafb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '10px'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          margin: '0',
                          color: '#333'
                        }}>
                          {u.family_name}
                        </h4>
                        <p style={{
                          fontSize: '13px',
                          color: '#666',
                          margin: '5px 0 0 0'
                        }}>
                          {u.email}
                        </p>
                      </div>
                      {u.is_admin && (
                        <span style={{
                          background: '#ef4444',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: '#888',
                      margin: '0'
                    }}>
                      Joined: {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
