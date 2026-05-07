import React, { useState, useEffect } from 'react'
import { familyAPI, locationAPI } from '../api'
import { X, Loader, AlertCircle, Upload } from 'lucide-react'

export default function AddMemberModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'male',
    birth_year: '',
    birth_place: '',
    status: 'alive',
    death_year: '',
    biography: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photo, setPhoto] = useState(null)
  const [locations, setLocations] = useState([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
    }
  }

  const handleLocationSearch = async (e) => {
    const query = e.target.value
    setFormData((prev) => ({
      ...prev,
      birth_place: query,
    }))

    if (query.length > 1) {
      try {
        const response = await locationAPI.searchLocations(query)
        setLocations(response.data.data.locations)
        setShowLocationSuggestions(true)
      } catch (err) {
        console.error('Error searching locations:', err)
      }
    } else {
      setShowLocationSuggestions(false)
    }
  }

  const selectLocation = (location) => {
    setFormData((prev) => ({
      ...prev,
      birth_place: location.name,
    }))
    setShowLocationSuggestions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create member
      const memberResponse = await familyAPI.createMember(formData)
      const memberId = memberResponse.data.data.id

      // Upload photo if provided
      if (photo) {
        await familyAPI.uploadPhoto(memberId, photo)
      }

      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating family member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Family Member</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="input-field"
            />
            {photo && <p className="text-sm text-green-600 mt-2">✓ {photo.name} selected</p>}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="input-field"
              />
            </div>
          </div>

          {/* Gender and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="alive">Alive</option>
                <option value="deceased">Deceased</option>
              </select>
            </div>
          </div>

          {/* Birth Year and Death Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth Year
              </label>
              <input
                type="number"
                name="birth_year"
                value={formData.birth_year}
                onChange={handleChange}
                placeholder="1990"
                className="input-field"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            {formData.status === 'deceased' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Death Year
                </label>
                <input
                  type="number"
                  name="death_year"
                  value={formData.death_year}
                  onChange={handleChange}
                  placeholder="2023"
                  className="input-field"
                  min={formData.birth_year || '1800'}
                  max={new Date().getFullYear()}
                />
              </div>
            )}
          </div>

          {/* Birth Place with Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birth Place (Indian cities/villages)
            </label>
            <input
              type="text"
              name="birth_place"
              value={formData.birth_place}
              onChange={handleLocationSearch}
              onFocus={() => formData.birth_place.length > 1 && setShowLocationSuggestions(true)}
              placeholder="Start typing... (e.g., Mandsaur)"
              className="input-field"
              autoComplete="off"
            />
            
            {showLocationSuggestions && locations.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {locations.map((loc) => (
                  <li
                    key={loc.id}
                    onClick={() => selectLocation(loc)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium text-gray-800">{loc.name}</div>
                    <div className="text-sm text-gray-600">{loc.state}{loc.district ? `, ${loc.district}` : ''}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Biography */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biography (Optional)
            </label>
            <textarea
              name="biography"
              value={formData.biography}
              onChange={handleChange}
              placeholder="Add any biographical information..."
              className="input-field resize-none"
              rows="4"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Member'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
