import React, { useMemo, useState } from 'react'

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase()
}

function matchesMember(member, query, getLabel) {
  if (!query) {
    return true
  }

  const label = normalizeValue(getLabel(member))
  const birthPlace = normalizeValue(member.birth_place)
  const years = normalizeValue(`${member.birth_year || ''} ${member.death_year || ''}`)

  return (
    label.includes(query) ||
    birthPlace.includes(query) ||
    years.includes(query)
  )
}

export function SearchableMemberSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  emptyLabel,
  getLabel,
  disabled = false
}) {
  const [query, setQuery] = useState('')

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeValue(query)
    return options.filter((member) => matchesMember(member, normalizedQuery, getLabel))
  }, [options, query, getLabel])

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#333' }}>
        {label}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${label.toLowerCase()}`}
        disabled={disabled}
        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box', background: disabled ? '#f3f4f6' : 'white' }}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: disabled ? '#f3f4f6' : 'white' }}
      >
        <option value="">{placeholder}</option>
        {filteredOptions.map((member) => (
          <option key={member.id} value={member.id}>
            {getLabel(member)}
          </option>
        ))}
      </select>
      {!disabled && filteredOptions.length === 0 && (
        <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#666' }}>{emptyLabel}</p>
      )}
    </div>
  )
}

export function SearchableMemberChecklist({
  label,
  options,
  selectedIds,
  onToggle,
  getLabel,
  emptyLabel
}) {
  const [query, setQuery] = useState('')

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeValue(query)
    return options.filter((member) => matchesMember(member, normalizedQuery, getLabel))
  }, [options, query, getLabel])

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#333' }}>
        {label}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${label.toLowerCase()}`}
        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'grid', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
        {filteredOptions.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{emptyLabel}</p>
        ) : (
          filteredOptions.map((member) => (
            <label
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#333'
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(member.id)}
                onChange={() => onToggle(member.id)}
              />
              <span>{getLabel(member)}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
