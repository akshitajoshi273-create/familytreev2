import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { familyAPI } from '../api'
import FamilyTreeVisualization from '../components/FamilyTreeVisualization'
import { useAuthStore, useFamilyStore } from '../store'
import AddMemberForm from './AddMemberForm'
import ShareAccess from './ShareAccess'

function getMemberName(member) {
  return `${member.first_name || ''} ${member.last_name || ''}`.trim()
}

function getGenderColor(member) {
  return member.gender === 'male' ? '#3b82f6' : '#ec4899'
}

function getYearRange(member) {
  return '*'
}

function MemberCard({ member, compact, onOpenProfile, onOpenTree }) {
  const accent = getGenderColor(member)

  return (
    <div
      onClick={() => onOpenProfile(member)}
      style={{
        background: '#f8fafc',
        border: `1px solid ${accent}55`,
        borderRadius: '10px',
        padding: compact ? '14px' : '20px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: compact ? '14px' : '0',
        alignItems: compact ? 'flex-start' : 'stretch'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 10px 24px ${accent}22`
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={getMemberName(member)}
          style={{
            width: compact ? '60px' : '80px',
            height: compact ? '60px' : '80px',
            borderRadius: '50%',
            margin: compact ? '0' : '0 auto 15px',
            objectFit: 'cover',
            display: 'block',
            border: `3px solid ${accent}`,
            flexShrink: 0
          }}
        />
      ) : (
        <div
          style={{
            width: compact ? '60px' : '80px',
            height: compact ? '60px' : '80px',
            borderRadius: '50%',
            margin: compact ? '0' : '0 auto 15px',
            background: accent,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: compact ? '24px' : '32px',
            flexShrink: 0
          }}
        >
          {member.gender === 'male' ? 'M' : 'F'}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, textAlign: compact ? 'left' : 'center' }}>
        <h4
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}
        >
          {getMemberName(member)}
        </h4>

        <p
          style={{
            fontSize: '13px',
            color: '#64748b',
            margin: '0 0 8px 0'
          }}
        >
          {getYearRange(member)}
        </p>

        {member.birth_place && (
          <p
            style={{
              fontSize: '12px',
              color: '#64748b',
              margin: '0 0 12px 0'
            }}
          >
            {member.birth_place}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenProfile(member)
            }}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '8px',
              background: accent,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            View Profile
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenTree(member.id)
            }}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '8px',
              background: '#0f766e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Show Family Tree
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { members, setMembers } = useFamilyStore()
  const navigate = useNavigate()

  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('grid')
  const [memberSearch, setMemberSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [memberView, setMemberView] = useState('compact')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await familyAPI.getMembers()
      if (response.data.success) {
        setMembers(response.data.data.members)
      }
    } catch (err) {
      setError(err.message || 'Failed to load family members')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMemberAdded = () => {
    setShowAddModal(false)
    fetchMembers()
  }

  const handleMemberClick = (member) => {
    navigate(`/member/${member.id}`)
  }

  const handleShowMemberTree = (memberId) => {
    navigate(`/member/${memberId}/tree`)
  }

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase()

    return [...members]
      .filter((member) => {
        if (!query) {
          return true
        }

        const name = getMemberName(member).toLowerCase()
        const birthPlace = (member.birth_place || '').toLowerCase()
        const years = `${member.birth_year || ''} ${member.death_year || ''}`.trim()

        return (
          name.includes(query) ||
          birthPlace.includes(query) ||
          years.includes(query)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          const yearA = a.birth_year || 9999
          const yearB = b.birth_year || 9999
          if (yearA !== yearB) {
            return yearA - yearB
          }
        }

        if (sortBy === 'youngest') {
          const yearA = a.birth_year || -9999
          const yearB = b.birth_year || -9999
          if (yearA !== yearB) {
            return yearB - yearA
          }
        }

        return getMemberName(a).localeCompare(getMemberName(b))
      })
  }, [members, memberSearch, sortBy])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>...</div>
          <p style={{ fontSize: '18px' }}>Loading your family tree...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            padding: '30px',
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: '700',
                margin: '0 0 10px 0',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Family Tree
            </h1>
            <p
              style={{
                color: '#666',
                margin: 0,
                fontSize: '16px'
              }}
            >
              Welcome, {user?.family_name || 'User'}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            {user?.is_admin && (
              <button
                onClick={() => navigate('/admin')}
                style={{
                  padding: '10px 20px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Admin
              </button>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('token')
                logout()
                window.location.href = '/login'
              }}
              style={{
                padding: '10px 20px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}
        >
          {[
            ['overview', `Overview`],
            ['grid', `Members (${members.length})`],
            ['tree', 'Family Tree'],
            ['share', 'Share']
          ].map(([tabKey, label]) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              style={{
                padding: '12px 24px',
                background: activeTab === tabKey ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                color: activeTab === tabKey ? 'white' : '#333',
                border: activeTab === tabKey ? 'none' : '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            padding: '30px',
            textAlign: 'center',
            marginBottom: '30px',
            display: activeTab === 'overview' ? 'block' : 'none'
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}
          >
            Tree
          </div>

          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#333',
              marginBottom: '10px'
            }}
          >
            Your Family Tree
          </h2>

          <p
            style={{
              color: '#666',
              fontSize: '16px',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}
          >
            {members.length === 0
              ? 'Start building your family tree by adding family members below.'
              : `You have ${members.length} family member${members.length !== 1 ? 's' : ''} recorded.`}
          </p>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Add New Family Member
          </button>

          {error && (
            <div
              style={{
                marginTop: '20px',
                background: '#fee2e2',
                color: '#991b1b',
                padding: '15px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {error}
            </div>
          )}
        </div>

        {members.length > 0 && activeTab === 'grid' && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              padding: '30px',
              marginBottom: '30px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#333',
                    margin: '0 0 4px 0'
                  }}
                >
                  Family Members
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  A cleaner directory for larger families.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Add
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '18px',
                padding: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px'
              }}
            >
              <input
                type="text"
                placeholder="Search by name, place, or year"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                style={{
                  flex: '1 1 260px',
                  minWidth: '220px',
                  padding: '12px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '12px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  color: '#1f2937'
                }}
              >
                <option value="name">Sort: Name</option>
                <option value="oldest">Sort: Oldest first</option>
                <option value="youngest">Sort: Youngest first</option>
              </select>

              <div
                style={{
                  display: 'flex',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  minWidth: '200px'
                }}
              >
                <button
                  onClick={() => setMemberView('compact')}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    border: 'none',
                    background: memberView === 'compact' ? '#667eea' : 'white',
                    color: memberView === 'compact' ? 'white' : '#334155',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Compact View
                </button>
                <button
                  onClick={() => setMemberView('cards')}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    border: 'none',
                    background: memberView === 'cards' ? '#667eea' : 'white',
                    color: memberView === 'cards' ? 'white' : '#334155',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Card View
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '18px'
              }}
            >
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                Showing {filteredMembers.length} of {members.length} members
              </p>
              {members.length > 100 && (
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Use search and compact view to move faster through the directory.
                </p>
              )}
            </div>

            {filteredMembers.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#64748b',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px dashed #cbd5e1'
                }}
              >
                No members matched your search.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    memberView === 'compact'
                      ? 'repeat(auto-fill, minmax(320px, 1fr))'
                      : 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: memberView === 'compact' ? '12px' : '20px'
                }}
              >
                {filteredMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    compact={memberView === 'compact'}
                    onOpenProfile={handleMemberClick}
                    onOpenTree={handleShowMemberTree}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tree' && (
          <div style={{ marginBottom: '30px' }}>
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add New Family Member
              </button>
            </div>
            <FamilyTreeVisualization members={members} onMemberClick={handleMemberClick} />
          </div>
        )}

        {activeTab === 'share' && (
          <div style={{ marginBottom: '30px' }}>
            <ShareAccess />
          </div>
        )}
      </div>

      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflow: 'auto',
            padding: '20px'
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '600px',
              width: '100%',
              maxHeight: 'calc(100vh - 40px)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              x
            </button>
            <AddMemberForm onSuccess={handleMemberAdded} />
          </div>
        </div>
      )}
    </div>
  )
}
