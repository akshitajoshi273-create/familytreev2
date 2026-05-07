import React, { useEffect, useState } from 'react'
import { familyAPI, locationAPI } from '../api'
import { SearchableMemberChecklist, SearchableMemberSelect } from '../components/SearchableMemberInputs'

function memberLabel(member) {
  const fullName = `${member.first_name} ${member.last_name || ''}`.trim()
  if (member.birth_year) {
    return `${fullName} (${member.birth_year})`
  }
  return fullName
}

export default function AddMemberForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'male',
    birth_year: new Date().getFullYear(),
    birth_place: '',
    date_of_birth: '',
    status: 'alive',
    death_year: '',
    biography: '',
    father_id: '',
    mother_id: '',
    spouse_id: ''
  })
  const [childrenIds, setChildrenIds] = useState([])
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true)
      const response = await familyAPI.getMembers()
      if (response.data.success) {
        setMembers(response.data.data.members || [])
      }
    } catch (err) {
      console.error('Failed to load family members:', err)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setError('')

    if (name === 'birth_place' && value.length > 0) {
      handleLocationSearch(value)
    } else if (name === 'birth_place') {
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleLocationSearch = async (query) => {
    try {
      const response = await locationAPI.searchLocations(query)
      if (response.data.success) {
        setLocationSuggestions(response.data.data.results || response.data.data.locations || [])
        setShowSuggestions(true)
      }
    } catch (err) {
      console.error('Location search failed:', err)
    }
  }

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      birth_place: `${location.name}, ${location.state}`
    }))
    setShowSuggestions(false)
    setLocationSuggestions([])
  }

  const handleChildToggle = (childId) => {
    setChildrenIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.first_name.trim()) {
        throw new Error('First name is required')
      }

      const submitData = {
        first_name: formData.first_name.trim(),
        gender: formData.gender,
        status: formData.status
      }

      if (formData.last_name.trim()) {
        submitData.last_name = formData.last_name.trim()
      }
      if (formData.birth_year && formData.birth_year.toString().trim()) {
        const year = parseInt(formData.birth_year, 10)
        if (!Number.isNaN(year)) {
          submitData.birth_year = year
        }
      }
      if (formData.death_year && formData.death_year.toString().trim()) {
        const year = parseInt(formData.death_year, 10)
        if (!Number.isNaN(year)) {
          submitData.death_year = year
        }
      }
      if (formData.birth_place.trim()) {
        submitData.birth_place = formData.birth_place.trim()
      }
      if (formData.date_of_birth) {
        submitData.date_of_birth = formData.date_of_birth
      }
      if (formData.biography.trim()) {
        submitData.biography = formData.biography.trim()
      }
      if (formData.father_id) {
        submitData.father_id = formData.father_id
      }
      if (formData.mother_id) {
        submitData.mother_id = formData.mother_id
      }
      if (formData.spouse_id) {
        submitData.spouse_id = formData.spouse_id
      }

      const response = await familyAPI.createMember(submitData)

      if (response.data.success) {
        const createdMember = response.data.data
        if (childrenIds.length > 0) {
          await familyAPI.updateChildren(createdMember.id, childrenIds)
        }

        setSuccess(true)
        setFormData({
          first_name: '',
          last_name: '',
          gender: 'male',
          birth_year: new Date().getFullYear(),
          birth_place: '',
          date_of_birth: '',
          status: 'alive',
          death_year: '',
          biography: '',
          father_id: '',
          mother_id: '',
          spouse_id: ''
        })
        setChildrenIds([])
        await fetchMembers()

        if (onSuccess) {
          onSuccess()
          return
        }

        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add family member'
      setError(errorMessage)
      console.error('Error details:', err.response?.data || err)
    } finally {
      setLoading(false)
    }
  }

  const fatherOptions = members.filter((member) => member.gender === 'male')
  const motherOptions = members.filter((member) => member.gender === 'female')
  const spouseOptions = members
  const childOptions = members.filter(
    (member) =>
      member.id !== formData.father_id &&
      member.id !== formData.mother_id &&
      member.id !== formData.spouse_id
  )

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto'
      }}
    >
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#333'
        }}
      >
        Add Family Member
      </h2>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}
        >
          Family member added successfully!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            First Name *
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Enter first name"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            Last Name
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Enter last name"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif', background: '#fafafa' }}
          >
            <option value="male">Male (Blue)</option>
            <option value="female">Female (Pink)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif', background: '#fafafa' }}
          >
            <option value="alive">Alive</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            Birth Year
          </label>
          <input
            type="number"
            name="birth_year"
            value={formData.birth_year}
            onChange={handleChange}
            placeholder="e.g., 1990"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
          />
        </div>

        {formData.status === 'deceased' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
              Death Year
            </label>
            <input
              type="number"
              name="death_year"
              value={formData.death_year}
              onChange={handleChange}
              placeholder="e.g., 2020"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
          Birth Date (Optional)
        </label>
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '15px', position: 'relative' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
          Birth Place (City/Village)
        </label>
        <input
          type="text"
          name="birth_place"
          value={formData.birth_place}
          onChange={handleChange}
          onFocus={() => formData.birth_place && setShowSuggestions(true)}
          placeholder="e.g., Mandsaur, Madhya Pradesh"
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}
        />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Type city or village name for suggestions.
        </p>

        {showSuggestions && locationSuggestions.length > 0 && (
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
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 10,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {locationSuggestions.slice(0, 10).map((location, idx) => (
              <div
                key={location.id || idx}
                onClick={() => handleLocationSelect(location)}
                style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '14px', color: '#333' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f9fafb'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white'
                }}
              >
                <strong>{location.name}</strong>, {location.state}
                {location.district && `, ${location.district}`}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
          Biography (Optional)
        </label>
        <textarea
          name="biography"
          value={formData.biography}
          onChange={handleChange}
          placeholder="Add any additional information..."
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif', minHeight: '80px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Family Relations</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#666' }}>
          Link this person to parents, spouse, and existing children in your tree.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          <SearchableMemberSelect
            label="Father"
            value={formData.father_id}
            onChange={(value) => setFormData((prev) => ({ ...prev, father_id: value }))}
            options={fatherOptions}
            placeholder="Select father"
            emptyLabel="No matching fathers found."
            getLabel={memberLabel}
            disabled={loadingMembers}
          />

          <SearchableMemberSelect
            label="Mother"
            value={formData.mother_id}
            onChange={(value) => setFormData((prev) => ({ ...prev, mother_id: value }))}
            options={motherOptions}
            placeholder="Select mother"
            emptyLabel="No matching mothers found."
            getLabel={memberLabel}
            disabled={loadingMembers}
          />

          <SearchableMemberSelect
            label="Spouse"
            value={formData.spouse_id}
            onChange={(value) => setFormData((prev) => ({ ...prev, spouse_id: value }))}
            options={spouseOptions}
            placeholder="Select spouse"
            emptyLabel="No matching spouses found."
            getLabel={memberLabel}
            disabled={loadingMembers}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <SearchableMemberChecklist
            label="Children"
            options={childOptions}
            selectedIds={childrenIds}
            onToggle={handleChildToggle}
            getLabel={memberLabel}
            emptyLabel="No matching children found. Add children later after you create more members."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Adding...' : 'Add Family Member'}
      </button>
    </form>
  )
}
