import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { familyAPI, locationAPI } from '../api'
import PhotoUpload from '../components/PhotoUpload'
import { SearchableMemberChecklist, SearchableMemberSelect } from '../components/SearchableMemberInputs'

function memberLabel(member) {
  const fullName = `${member.first_name} ${member.last_name || ''}`.trim()
  if (member.birth_year) {
    return `${fullName} (${member.birth_year})`
  }
  return fullName
}

function formatDateForInput(value) {
  if (!value) {
    return ''
  }
  return String(value).slice(0, 10)
}

export default function MemberDetailPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [allMembers, setAllMembers] = useState([])
  const [father, setFather] = useState(null)
  const [mother, setMother] = useState(null)
  const [spouse, setSpouse] = useState(null)
  const [children, setChildren] = useState([])
  const [siblings, setSiblings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [selectedChildrenIds, setSelectedChildrenIds] = useState([])
  const [selectedSiblingIds, setSelectedSiblingIds] = useState([])
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    fetchMemberDetails()
  }, [memberId])

  const fetchMemberDetails = async () => {
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
      const linkedChildren = members.filter(
        (item) => item.father_id === currentMember.id || item.mother_id === currentMember.id
      )
      const linkedSiblings = members.filter((item) => {
        if (item.id === currentMember.id) {
          return false
        }
        return (
          (currentMember.father_id && item.father_id === currentMember.father_id) ||
          (currentMember.mother_id && item.mother_id === currentMember.mother_id)
        )
      })

      setMember(currentMember)
      setFormData({
        first_name: currentMember.first_name || '',
        last_name: currentMember.last_name || '',
        date_of_birth: formatDateForInput(currentMember.date_of_birth),
        birth_year: currentMember.birth_year || '',
        death_year: currentMember.death_year || '',
        birth_place: currentMember.birth_place || '',
        biography: currentMember.biography || '',
        status: currentMember.status || 'alive',
        gender: currentMember.gender || 'male',
        father_id: currentMember.father_id || '',
        mother_id: currentMember.mother_id || '',
        spouse_id: currentMember.spouse_id || ''
      })
      setAllMembers(members.filter((item) => item.id !== currentMember.id))
      setFather(currentMember.father_id ? memberLookup[currentMember.father_id] || null : null)
      setMother(currentMember.mother_id ? memberLookup[currentMember.mother_id] || null : null)
      setSpouse(currentMember.spouse_id ? memberLookup[currentMember.spouse_id] || null : null)
      setChildren(linkedChildren)
      setSelectedChildrenIds(linkedChildren.map((child) => child.id))
      setSiblings(linkedSiblings)
      setSelectedSiblingIds(linkedSiblings.map((item) => item.id))
      setPhotoError(false)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load member details')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setError('')

      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name || null,
        date_of_birth: formData.date_of_birth || null,
        birth_year: formData.birth_year ? parseInt(formData.birth_year, 10) : null,
        death_year: formData.death_year ? parseInt(formData.death_year, 10) : null,
        birth_place: formData.birth_place || null,
        biography: formData.biography || null,
        status: formData.status,
        gender: formData.gender,
        father_id: formData.father_id || null,
        mother_id: formData.mother_id || null,
        spouse_id: formData.spouse_id || null
      }

      await familyAPI.updateMember(memberId, updateData)
      await familyAPI.updateChildren(memberId, selectedChildrenIds)
      await familyAPI.updateSiblings(memberId, selectedSiblingIds)

      setEditing(false)
      await fetchMemberDetails()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update member')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this family member?')) return

    try {
      await familyAPI.deleteMember(memberId)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete member')
    }
  }

  const handleChildToggle = (childId) => {
    setSelectedChildrenIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    )
  }

  const handleSiblingToggle = (siblingId) => {
    setSelectedSiblingIds((prev) =>
      prev.includes(siblingId)
        ? prev.filter((id) => id !== siblingId)
        : [...prev, siblingId]
    )
  }

  const handleBirthPlaceSearch = async (value) => {
    setFormData((prev) => ({ ...prev, birth_place: value }))

    if (value.trim().length < 2) {
      setLocationSuggestions([])
      setShowLocationSuggestions(false)
      return
    }

    try {
      const response = await locationAPI.searchLocations(value)
      const locations = response.data?.data?.locations || response.data?.data?.results || []
      setLocationSuggestions(locations)
      setShowLocationSuggestions(true)
    } catch (err) {
      console.error('Location search failed:', err)
    }
  }

  const handleBirthPlaceSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      birth_place: `${location.name}, ${location.state}`
    }))
    setLocationSuggestions([])
    setShowLocationSuggestions(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Member not found</p>
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

  const genderColor = member.gender === 'male' ? '#3b82f6' : '#ec4899'
  const yearRange = member.death_year ? `${member.birth_year}-${member.death_year}` : member.birth_year
  const fatherOptions = allMembers.filter((item) => item.gender === 'male')
  const motherOptions = allMembers.filter((item) => item.gender === 'female')
  const spouseOptions = allMembers
  const childOptions = allMembers.filter(
    (item) => item.id !== formData.father_id && item.id !== formData.mother_id && item.id !== formData.spouse_id
  )
  const siblingOptions = allMembers.filter(
    (item) =>
      !selectedChildrenIds.includes(item.id) &&
      item.id !== formData.spouse_id
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ padding: '10px 20px', background: 'white', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px', fontWeight: '600' }}
        >
          Back to Dashboard
        </button>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
          <div style={{ background: `linear-gradient(135deg, ${genderColor}, ${genderColor}dd)`, padding: '40px', textAlign: 'center', color: 'white' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                border: '3px solid white',
                overflow: 'hidden'
              }}
            >
              {member.photo_url && !photoError ? (
                <img
                  src={member.photo_url}
                  alt={`${member.first_name} ${member.last_name || ''}`.trim()}
                  onError={() => setPhotoError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                member.gender === 'male' ? '👨' : '👩'
              )}
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              {member.first_name} {member.last_name || ''}
            </h1>

            <p style={{ fontSize: '18px', margin: '0 0 5px 0', opacity: 0.9 }}>
              {yearRange || 'Year unknown'} • {member.status === 'alive' ? 'Living' : 'Deceased'}
            </p>

            {member.birth_place && (
              <p style={{ fontSize: '16px', margin: '0', opacity: 0.85 }}>
                {member.birth_place}
              </p>
            )}
          </div>

          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setEditing(!editing)}
                style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={() => setShowPhotoUpload(!showPhotoUpload)}
                style={{ padding: '10px 20px', background: '#764ba2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Add Photo
              </button>
              <button
                onClick={() => navigate(`/member/${member.id}/tree`)}
                style={{ padding: '10px 20px', background: '#0f766e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Show Family Tree
              </button>
              <button
                onClick={handleDelete}
                style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Delete
              </button>
            </div>

            {showPhotoUpload && (
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <PhotoUpload
                  memberId={memberId}
                  onUploadComplete={(photoUrl) => {
                    setShowPhotoUpload(false)
                    setPhotoError(false)
                    if (photoUrl) {
                      setMember((prev) => (prev ? { ...prev, photo_url: photoUrl } : prev))
                    }
                    fetchMemberDetails()
                  }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                  Personal Information
                </h3>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editing ? formData.first_name : member.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    readOnly={!editing}
                    style={{ width: '100%', padding: '10px', border: editing ? '1px solid #ddd' : 'none', background: editing ? 'white' : '#f9fafb', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editing ? formData.last_name : member.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    readOnly={!editing}
                    style={{ width: '100%', padding: '10px', border: editing ? '1px solid #ddd' : 'none', background: editing ? 'white' : '#f9fafb', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>
                    Gender
                  </label>
                  <select
                    value={editing ? formData.gender : member.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    disabled={!editing}
                    style={{ width: '100%', padding: '10px', border: editing ? '1px solid #ddd' : 'none', background: editing ? 'white' : '#f9fafb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>
                    Status
                  </label>
                  <select
                    value={editing ? formData.status : member.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={!editing}
                    style={{ width: '100%', padding: '10px', border: editing ? '1px solid #ddd' : 'none', background: editing ? 'white' : '#f9fafb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="alive">Alive</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editing ? formData.date_of_birth : formatDateForInput(member.date_of_birth)}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    readOnly={!editing}
                    style={{ width: '100%', padding: '10px', border: editing ? '1px solid #ddd' : 'none', background: editing ? 'white' : '#f9fafb', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>
                    Birth Year
                  </label>
                  <input
                    type="number"
                    value={editing ? formData.birth_year : member.birth_year || ''}
                    onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                    readOnly={!editing}
                    style={{ width: '100%', padding: '10px', border: editing ? '1px solid #ddd' : 'none', background: editing ? 'white' : '#f9fafb', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>

                {(editing ? formData.status : member.status) === 'deceased' && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>
                      Death Year
                    </label>
                    <input
                      type="number"
                      value={editing ? formData.death_year : member.death_year || ''}
                      onChange={(e) => setFormData({ ...formData, death_year: e.target.value })}
                      readOnly={!editing}
                      style={{ width: '100%', padding: '10px', border: editing ? '1px solid #ddd' : 'none', background: editing ? 'white' : '#f9fafb', borderRadius: '6px', fontSize: '14px' }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '15px', position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>
                    Birth Place
                  </label>
                  <input
                    type="text"
                    value={editing ? formData.birth_place : member.birth_place || ''}
                    onChange={(e) => {
                      if (editing) {
                        handleBirthPlaceSearch(e.target.value)
                      }
                    }}
                    onFocus={() => {
                      if (editing && formData.birth_place && locationSuggestions.length > 0) {
                        setShowLocationSuggestions(true)
                      }
                    }}
                    readOnly={!editing}
                    style={{ width: '100%', padding: '10px', border: editing ? '1px solid #ddd' : 'none', background: editing ? 'white' : '#f9fafb', borderRadius: '6px', fontSize: '14px' }}
                  />
                  {editing && showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 6px 6px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        zIndex: 10,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {locationSuggestions.slice(0, 10).map((location, idx) => (
                        <div
                          key={location.id || idx}
                          onClick={() => handleBirthPlaceSelect(location)}
                          style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '14px', color: '#333' }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <strong>{location.name}</strong>, {location.state}
                          {location.district ? `, ${location.district}` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                  Family Relations
                </h3>

                {editing ? (
                  <>
                    <div style={{ marginBottom: '15px' }}>
                      <SearchableMemberSelect
                        label="Father"
                        value={formData.father_id}
                        onChange={(value) => setFormData({ ...formData, father_id: value })}
                        options={fatherOptions}
                        placeholder="Select father"
                        emptyLabel="No matching fathers found."
                        getLabel={memberLabel}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <SearchableMemberSelect
                        label="Mother"
                        value={formData.mother_id}
                        onChange={(value) => setFormData({ ...formData, mother_id: value })}
                        options={motherOptions}
                        placeholder="Select mother"
                        emptyLabel="No matching mothers found."
                        getLabel={memberLabel}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <SearchableMemberSelect
                        label="Spouse"
                        value={formData.spouse_id}
                        onChange={(value) => setFormData({ ...formData, spouse_id: value })}
                        options={spouseOptions}
                        placeholder="Select spouse"
                        emptyLabel="No matching spouses found."
                        getLabel={memberLabel}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <SearchableMemberChecklist
                        label="Children"
                        options={childOptions}
                        selectedIds={selectedChildrenIds}
                        onToggle={handleChildToggle}
                        getLabel={memberLabel}
                        emptyLabel="No matching children found."
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <SearchableMemberChecklist
                        label="Siblings"
                        options={siblingOptions}
                        selectedIds={selectedSiblingIds}
                        onToggle={handleSiblingToggle}
                        getLabel={memberLabel}
                        emptyLabel="No matching siblings found."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {father && (
                      <div style={{ padding: '12px', background: '#f0f4ff', borderRadius: '6px', marginBottom: '10px' }}>
                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 5px 0' }}>Father</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: 0 }}>{memberLabel(father)}</p>
                      </div>
                    )}

                    {mother && (
                      <div style={{ padding: '12px', background: '#ffe0f0', borderRadius: '6px', marginBottom: '10px' }}>
                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 5px 0' }}>Mother</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: 0 }}>{memberLabel(mother)}</p>
                      </div>
                    )}

                    {spouse && (
                      <div style={{ padding: '12px', background: '#f0fff4', borderRadius: '6px', marginBottom: '10px' }}>
                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 5px 0' }}>Spouse</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: 0 }}>{memberLabel(spouse)}</p>
                      </div>
                    )}

                    <div style={{ padding: '12px', background: '#fff7ed', borderRadius: '6px', marginBottom: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>Children</p>
                      {children.length === 0 ? (
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>No children linked yet.</p>
                      ) : (
                        children.map((child) => (
                          <p key={child.id} style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0 0 6px 0' }}>
                            {memberLabel(child)}
                          </p>
                        ))
                      )}
                    </div>

                    <div style={{ padding: '12px', background: '#eef2ff', borderRadius: '6px', marginBottom: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>Siblings</p>
                      {siblings.length === 0 ? (
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>No siblings linked yet.</p>
                      ) : (
                        siblings.map((sibling) => (
                          <p key={sibling.id} style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0 0 6px 0' }}>
                            {memberLabel(sibling)}
                          </p>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                Biography
              </h3>
              <textarea
                value={editing ? formData.biography : member.biography || ''}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                readOnly={!editing}
                style={{ width: '100%', minHeight: '120px', padding: '12px', border: editing ? '1px solid #ddd' : 'none', background: editing ? 'white' : '#f9fafb', borderRadius: '6px', fontSize: '14px', lineHeight: '1.6', resize: 'vertical' }}
              />
            </div>

            {editing && (
              <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSave}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
