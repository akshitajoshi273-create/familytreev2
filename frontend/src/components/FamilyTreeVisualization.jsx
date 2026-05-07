import React, { useMemo } from 'react'

const MAX_GENERATIONS = 7
const NODE_WIDTH = 128
const NODE_HEIGHT = 122
const UNIT_GAP = 36
const ROW_GAP = 110
const SPOUSE_GAP = 52
const CANVAS_PADDING_X = 60
const CANVAS_PADDING_Y = 40
const AVATAR_SIZE = 74
const SPOUSE_LINE_OFFSET = 22
const CHILD_JOIN_OFFSET = 28

function memberLabel(member) {
  return `${member.first_name} ${member.last_name || ''}`.trim()
}

function getTone(member) {
  return member?.gender === 'male' ? '#3b82f6' : '#ec4899'
}

function getYearLabel(member) {
  if (!member) {
    return 'Year unknown'
  }
  if (member.death_year) {
    return `${member.birth_year || '?'}-${member.death_year}`
  }
  if (member.birth_year) {
    return member.status === 'alive' ? `${member.birth_year}-Present` : `${member.birth_year}`
  }
  return 'Year unknown'
}

function clampGeneration(generation) {
  return Math.max(1, Math.min(MAX_GENERATIONS, generation))
}

function AvatarNode({ member, x, y, onMemberClick }) {
  const accent = getTone(member)

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => onMemberClick(member)}
      style={{ cursor: 'pointer' }}
    >
      <circle cx="37" cy="37" r="37" fill="#f8fafc" stroke={accent} strokeWidth="4" />
      {member.photo_url ? (
        <>
          <clipPath id={`clip-${member.id}`}>
            <circle cx="37" cy="37" r="33" />
          </clipPath>
          <image
            href={member.photo_url}
            x="4"
            y="4"
            width="66"
            height="66"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#clip-${member.id})`}
          />
        </>
      ) : (
        <circle
          cx="37"
          cy="37"
          r="33"
          fill={accent}
          opacity="0.92"
        />
      )}
      {!member.photo_url && (
        <text
          x="37"
          y="46"
          textAnchor="middle"
          fontSize="28"
          fill="white"
        >
          {member.gender === 'male' ? 'M' : 'F'}
        </text>
      )}

      <text
        x="64"
        y="90"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="#1f2937"
      >
        {memberLabel(member)}
      </text>
      <text
        x="64"
        y="108"
        textAnchor="middle"
        fontSize="11"
        fill={accent}
      >
        {getYearLabel(member)}
      </text>
    </g>
  )
}

function buildMemberGraph(members) {
  const memberMap = Object.fromEntries(members.map((member) => [member.id, member]))

  const getBaseGeneration = (memberId, trail = new Set()) => {
    if (!memberId || !memberMap[memberId]) {
      return 1
    }
    if (trail.has(memberId)) {
      return 1
    }

    const member = memberMap[memberId]
    const parents = [member.father_id, member.mother_id].filter((id) => id && memberMap[id])
    if (parents.length === 0) {
      return 1
    }

    const nextTrail = new Set(trail)
    nextTrail.add(memberId)
    return clampGeneration(Math.max(...parents.map((id) => getBaseGeneration(id, nextTrail))) + 1)
  }

  const generations = {}
  members.forEach((member) => {
    generations[member.id] = getBaseGeneration(member.id)
  })

  for (let i = 0; i < members.length * 2; i += 1) {
    let changed = false

    members.forEach((member) => {
      if (member.spouse_id && memberMap[member.spouse_id]) {
        const sharedGeneration = clampGeneration(
          Math.max(generations[member.id], generations[member.spouse_id])
        )
        if (generations[member.id] !== sharedGeneration) {
          generations[member.id] = sharedGeneration
          changed = true
        }
        if (generations[member.spouse_id] !== sharedGeneration) {
          generations[member.spouse_id] = sharedGeneration
          changed = true
        }
      }
    })

    members.forEach((member) => {
      const parents = [member.father_id, member.mother_id].filter((id) => id && memberMap[id])
      if (parents.length === 0) {
        return
      }
      const requiredGeneration = clampGeneration(
        Math.max(...parents.map((id) => generations[id] || 1)) + 1
      )
      if (requiredGeneration > generations[member.id]) {
        generations[member.id] = requiredGeneration
        changed = true
      }
    })

    if (!changed) {
      break
    }
  }

  const spouseHandled = new Set()
  const units = []
  const memberToUnit = {}

  const sortedMembers = [...members].sort((a, b) => {
    const generationDiff = (generations[a.id] || 1) - (generations[b.id] || 1)
    if (generationDiff !== 0) {
      return generationDiff
    }
    return memberLabel(a).localeCompare(memberLabel(b))
  })

  sortedMembers.forEach((member) => {
    if (spouseHandled.has(member.id)) {
      return
    }

    const spouse = member.spouse_id && memberMap[member.spouse_id] ? memberMap[member.spouse_id] : null
    const sameGenerationSpouse = spouse && generations[spouse.id] === generations[member.id] ? spouse : null
    const membersInUnit = sameGenerationSpouse
      ? [member, sameGenerationSpouse].sort((a, b) => memberLabel(a).localeCompare(memberLabel(b)))
      : [member]

    const unitId = membersInUnit.map((item) => item.id).sort().join('::')
    const generation = generations[member.id] || 1

    units.push({
      id: unitId,
      members: membersInUnit,
      generation,
      label: membersInUnit.map((item) => memberLabel(item)).join(' / ')
    })

    membersInUnit.forEach((item) => {
      memberToUnit[item.id] = unitId
      spouseHandled.add(item.id)
      })
  })

  const rows = {}
  units.forEach((unit) => {
    if (!rows[unit.generation]) {
      rows[unit.generation] = []
    }
    rows[unit.generation].push(unit)
  })

  Object.keys(rows)
    .map((key) => parseInt(key, 10))
    .sort((a, b) => a - b)
    .forEach((generation) => {
      const previousRow = rows[generation - 1] || []
      const previousOrder = Object.fromEntries(previousRow.map((unit, index) => [unit.id, index]))

      rows[generation].sort((unitA, unitB) => {
        const getScore = (unit) => {
          const parentUnitIds = unit.members.flatMap((member) => {
            const ids = [member.father_id, member.mother_id]
              .filter((id) => id && memberToUnit[id])
              .map((id) => memberToUnit[id])
            return [...new Set(ids)]
          })

          if (parentUnitIds.length === 0) {
            return Number.MAX_SAFE_INTEGER
          }

          const scores = parentUnitIds
            .map((unitId) => previousOrder[unitId])
            .filter((score) => score !== undefined)

          if (scores.length === 0) {
            return Number.MAX_SAFE_INTEGER
          }

          return scores.reduce((sum, score) => sum + score, 0) / scores.length
        }

        const scoreA = getScore(unitA)
        const scoreB = getScore(unitB)
        if (scoreA !== scoreB) {
          return scoreA - scoreB
        }
        return unitA.label.localeCompare(unitB.label)
      })
    })

  const memberPositions = {}
  const unitPositions = {}
  const generationKeys = Object.keys(rows)
    .map((key) => parseInt(key, 10))
    .sort((a, b) => a - b)
    .filter((generation) => generation <= MAX_GENERATIONS)

  const rowWidths = generationKeys.map((generation) => {
    const rowUnits = rows[generation]
    const totalUnitsWidth = rowUnits.reduce((sum, unit) => {
      return sum + (unit.members.length === 2 ? NODE_WIDTH * 2 + SPOUSE_GAP : NODE_WIDTH)
    }, 0)
    const gaps = Math.max(0, rowUnits.length - 1) * UNIT_GAP
    return totalUnitsWidth + gaps
  })

  const canvasWidth = Math.max(900, ...rowWidths) + CANVAS_PADDING_X * 2
  const canvasHeight = generationKeys.length * (NODE_HEIGHT + ROW_GAP) + CANVAS_PADDING_Y * 2

  generationKeys.forEach((generation, rowIndex) => {
    const rowUnits = rows[generation]
    const rowWidth = rowWidths[rowIndex]
    let currentX = (canvasWidth - rowWidth) / 2
    const y = CANVAS_PADDING_Y + rowIndex * (NODE_HEIGHT + ROW_GAP)

    rowUnits.forEach((unit) => {
      const unitWidth = unit.members.length === 2 ? NODE_WIDTH * 2 + SPOUSE_GAP : NODE_WIDTH
      const spouseLineY = y + AVATAR_SIZE - SPOUSE_LINE_OFFSET
      unitPositions[unit.id] = {
        centerX: currentX + unitWidth / 2,
        topY: y,
        bottomY: y + AVATAR_SIZE,
        spouseLineY
      }

      if (unit.members.length === 2) {
        memberPositions[unit.members[0].id] = {
          x: currentX,
          y,
          centerX: currentX + NODE_WIDTH / 2,
          topY: y,
          bottomY: y + AVATAR_SIZE
        }
        memberPositions[unit.members[1].id] = {
          x: currentX + NODE_WIDTH + SPOUSE_GAP,
          y,
          centerX: currentX + NODE_WIDTH + SPOUSE_GAP + NODE_WIDTH / 2,
          topY: y,
          bottomY: y + AVATAR_SIZE
        }
      } else {
        memberPositions[unit.members[0].id] = {
          x: currentX,
          y,
          centerX: currentX + NODE_WIDTH / 2,
          topY: y,
          bottomY: y + AVATAR_SIZE
        }
      }

      currentX += unitWidth + UNIT_GAP
    })
  })

  const familyGroups = {}
  members.forEach((member) => {
    const parentIds = [member.father_id, member.mother_id].filter((id) => id && memberMap[id])
    if (parentIds.length === 0) {
      return
    }
    const key = [member.father_id || '', member.mother_id || ''].join('::')
    if (!familyGroups[key]) {
      familyGroups[key] = {
        parentIds,
        childIds: []
      }
    }
    if ((generations[member.id] || 1) <= MAX_GENERATIONS) {
      familyGroups[key].childIds.push(member.id)
    }
  })

  return {
    members: memberMap,
    units,
    rows,
    generationKeys,
    memberPositions,
    unitPositions,
    memberToUnit,
    familyGroups,
    canvasWidth,
    canvasHeight
  }
}

export default function FamilyTreeVisualization({ members, onMemberClick }) {
  const graph = useMemo(() => buildMemberGraph(members), [members])

  if (!members.length || graph.generationKeys.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>Tree</div>
        <p>Add family members to build your family tree.</p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
        borderRadius: '18px',
        padding: '34px 30px 42px',
        boxShadow: '0 14px 46px rgba(0,0,0,0.10)',
        overflow: 'auto'
      }}
    >
      <h2
        style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#1f2937',
          textAlign: 'center'
        }}
      >
        Family Tree
      </h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', margin: '0 0 28px 0' }}>
        Showing one connected tree layout with up to {MAX_GENERATIONS} generations
      </p>

      <svg
        width={graph.canvasWidth}
        height={graph.canvasHeight}
        style={{ display: 'block', minWidth: '100%' }}
      >
        {Object.values(graph.familyGroups).map((group) => {
          const parentUnitIds = [...new Set(group.parentIds.map((id) => graph.memberToUnit[id]).filter(Boolean))]
          const parentUnitPositions = parentUnitIds
            .map((unitId) => graph.unitPositions[unitId])
            .filter(Boolean)
          const childPositions = group.childIds
            .map((id) => graph.memberPositions[id])
            .filter(Boolean)
            .sort((a, b) => a.centerX - b.centerX)

          if (parentUnitPositions.length === 0 || childPositions.length === 0) {
            return null
          }

          const sourceX = parentUnitPositions.reduce((sum, item) => sum + item.centerX, 0) / parentUnitPositions.length
          const sourceY = Math.max(...parentUnitPositions.map((item) => item.spouseLineY))
          const childJoinY = Math.min(...childPositions.map((item) => item.topY)) - CHILD_JOIN_OFFSET
          const childStartX = childPositions[0].centerX
          const childEndX = childPositions[childPositions.length - 1].centerX

          return (
            <g key={`${group.parentIds.join('-')}-${group.childIds.join('-')}`}>
              <line
                x1={sourceX}
                y1={sourceY}
                x2={sourceX}
                y2={childJoinY}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1={childStartX}
                y1={childJoinY}
                x2={childEndX}
                y2={childJoinY}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {childPositions.map((position) => (
                <line
                  key={`${position.centerX}-${position.topY}`}
                  x1={position.centerX}
                  y1={childJoinY}
                  x2={position.centerX}
                  y2={position.topY}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ))}
            </g>
          )
        })}

        {graph.units.map((unit) => {
          if (unit.members.length !== 2) {
            return null
          }

          const first = graph.memberPositions[unit.members[0].id]
          const second = graph.memberPositions[unit.members[1].id]
          if (!first || !second) {
            return null
          }

          return (
            <g key={`spouse-${unit.id}`}>
              <line
                x1={first.centerX}
                y1={first.bottomY - SPOUSE_LINE_OFFSET}
                x2={second.centerX}
                y2={second.bottomY - SPOUSE_LINE_OFFSET}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle
                cx={(first.centerX + second.centerX) / 2}
                cy={first.bottomY - SPOUSE_LINE_OFFSET}
                r="6"
                fill="#60a5fa"
              />
            </g>
          )
        })}

        {members
          .filter((member) => graph.memberPositions[member.id])
          .map((member) => {
            const position = graph.memberPositions[member.id]
            return (
              <AvatarNode
                key={member.id}
                member={member}
                x={position.x}
                y={position.y}
                onMemberClick={onMemberClick}
              />
            )
          })}
      </svg>
    </div>
  )
}
