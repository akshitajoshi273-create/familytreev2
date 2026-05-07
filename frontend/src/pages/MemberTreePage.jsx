import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { familyAPI } from '../api'

function memberLabel(member) {
  return `${member.first_name} ${member.last_name || ''}`.trim()
}

function yearLabel(member) {
  if (!member) {
    return 'Year unknown'
  }
  if (member.death_year) {
    return `${member.birth_year || '?'}-${member.death_year}`
  }
  if (member.birth_year) {
    return `${member.birth_year}`
  }
  return 'Year unknown'
}

function PersonCard({ member, accentColor, onClick, subtitle }) {
  if (!member) {
    return null
  }

  return (
    <div
      onClick={() => onClick?.(member)}
      style={{
        width: '220px',
        background: 'white',
        border: `2px solid ${accentColor}`,
        borderRadius: '12px',
        padding: '18px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'center'
      }}
    >
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={memberLabel(member)}
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: `3px solid ${accentColor}`,
            display: 'block',
            margin: '0 auto 12px'
          }}
        />
      ) : (
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: accentColor,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '34px',
            margin: '0 auto 12px'
          }}
        >
          {member.gender === 'male' ? '👨' : '👩'}
        </div>
      )}

      {subtitle && (
        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em', color: '#64748b', marginBottom: '6px' }}>
          {subtitle}
        </div>
      )}
      <div style={{ fontSize: '17px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>
        {memberLabel(member)}
      </div>
      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: member.birth_place ? '6px' : '0' }}>
        {yearLabel(member)}
      </div>
      {member.birth_place && (
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          {member.birth_place}
        </div>
      )}
    </div>
  )
}

export default function MemberTreePage() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [father, setFather] = useState(null)
  const [mother, setMother] = useState(null)
  const [spouse, setSpouse] = useState(null)
  const [spouseFather, setSpouseFather] = useState(null)
  const [spouseMother, setSpouseMother] = useState(null)
  const [children, setChildren] = useState([])
  const [siblings, setSiblings] = useState([])
  const [spouseSiblings, setSpouseSiblings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    fetchTreeContext()
  }, [memberId])

  const fetchTreeContext = async () => {
    try {
      setLoading(true)
      setError('')

      const [memberResponse, membersResponse] = await Promise.all([
        familyAPI.getMember(memberId),
        familyAPI.getMembers()
      ])

      if (!memberResponse.data.success) {
        setMember(null)
        return
      }

      const currentMember = memberResponse.data.data
      const members = membersResponse.data.success ? membersResponse.data.data.members || [] : []
      const memberLookup = Object.fromEntries(members.map((item) => [item.id, item]))
      const currentSpouse = currentMember.spouse_id ? memberLookup[currentMember.spouse_id] || null : null

      const findSiblings = (person) => {
        if (!person) {
          return []
        }
        return members.filter((item) => {
          if (item.id === person.id) {
            return false
          }
          return (
            (person.father_id && item.father_id === person.father_id) ||
            (person.mother_id && item.mother_id === person.mother_id)
          )
        })
      }

      setMember(currentMember)
      setFather(currentMember.father_id ? memberLookup[currentMember.father_id] || null : null)
      setMother(currentMember.mother_id ? memberLookup[currentMember.mother_id] || null : null)
      setSpouse(currentSpouse)
      setSpouseFather(currentSpouse?.father_id ? memberLookup[currentSpouse.father_id] || null : null)
      setSpouseMother(currentSpouse?.mother_id ? memberLookup[currentSpouse.mother_id] || null : null)
      setChildren(
        members.filter(
          (item) => item.father_id === currentMember.id || item.mother_id === currentMember.id
        )
      )
      setSiblings(findSiblings(currentMember))
      setSpouseSiblings(findSiblings(currentSpouse))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load family tree')
    } finally {
      setLoading(false)
    }
  }

  const openProfile = (person) => {
    navigate(`/member/${person.id}`)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading family tree...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Family tree member not found.</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const focusColor = member.gender === 'male' ? '#3b82f6' : '#ec4899'
  const spouseColor = spouse ? (spouse.gender === 'male' ? '#3b82f6' : '#ec4899') : '#8b5cf6'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ padding: '10px 20px', background: 'white', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(`/member/${member.id}`)}
            style={{ padding: '10px 20px', background: 'white', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            View Profile
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: '18px', boxShadow: '0 18px 60px rgba(15, 23, 42, 0.25)', padding: '30px', overflowX: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: '#1f2937' }}>
              Family Tree
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>
              Parents above and children below for {memberLabel(member)}
            </p>
          </div>

          <div style={{ minWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', justifyContent: 'center', minWidth: '460px', flexWrap: 'wrap' }}>
                {father ? (
                  <PersonCard member={father} accentColor="#3b82f6" subtitle="Father" onClick={openProfile} />
                ) : (
                  <div style={{ width: '220px', padding: '22px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc' }}>
                    Father not linked
                  </div>
                )}
                {mother ? (
                  <PersonCard member={mother} accentColor="#ec4899" subtitle="Mother" onClick={openProfile} />
                ) : (
                  <div style={{ width: '220px', padding: '22px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc' }}>
                    Mother not linked
                  </div>
                )}
              </div>

              {spouse && (
                <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', justifyContent: 'center', minWidth: '460px', flexWrap: 'wrap' }}>
                  {spouseFather ? (
                    <PersonCard member={spouseFather} accentColor="#3b82f6" subtitle="Spouse Father" onClick={openProfile} />
                  ) : (
                    <div style={{ width: '220px', padding: '22px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc' }}>
                      Spouse father not linked
                    </div>
                  )}
                  {spouseMother ? (
                    <PersonCard member={spouseMother} accentColor="#ec4899" subtitle="Spouse Mother" onClick={openProfile} />
                  ) : (
                    <div style={{ width: '220px', padding: '22px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc' }}>
                      Spouse mother not linked
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ width: '2px', height: '40px', background: '#cbd5e1', margin: '0 auto' }} />
            <div style={{ width: spouse ? '520px' : '220px', height: '2px', background: '#cbd5e1', margin: '0 auto 24px' }} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                alignItems: 'start',
                gap: '24px',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '16px', minHeight: '1px' }}>
                {siblings.map((sibling) => (
                  <PersonCard
                    key={sibling.id}
                    member={sibling}
                    accentColor={sibling.gender === 'male' ? '#3b82f6' : '#ec4899'}
                    subtitle="Sibling"
                    onClick={openProfile}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <PersonCard member={member} accentColor={focusColor} subtitle="Selected Member" />
                {spouse && (
                  <PersonCard member={spouse} accentColor={spouseColor} subtitle="Spouse" onClick={openProfile} />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '16px', minHeight: '1px' }}>
                {spouseSiblings.map((sibling) => (
                  <PersonCard
                    key={sibling.id}
                    member={sibling}
                    accentColor={sibling.gender === 'male' ? '#3b82f6' : '#ec4899'}
                    subtitle="Sibling"
                    onClick={openProfile}
                  />
                ))}
              </div>
            </div>

            <div style={{ width: '2px', height: '40px', background: '#cbd5e1', margin: '0 auto' }} />
            <div style={{ width: '280px', height: '2px', background: '#cbd5e1', margin: '0 auto 24px' }} />

            <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
              Children
            </div>

            {children.length === 0 ? (
              <div style={{ maxWidth: '280px', margin: '0 auto', padding: '22px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc' }}>
                No children linked yet
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {children.map((child) => (
                  <PersonCard
                    key={child.id}
                    member={child}
                    accentColor={child.gender === 'male' ? '#3b82f6' : '#ec4899'}
                    subtitle="Child"
                    onClick={openProfile}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
