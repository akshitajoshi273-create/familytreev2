import React from 'react'
import { Users, Heart, MapPin, Calendar } from 'lucide-react'

export default function FamilyTreeNode({ member }) {
  const isMale = member.gender === 'male'
  const borderColor = isMale ? 'border-blue-500' : 'border-pink-500'
  const bgColor = isMale ? 'bg-blue-50' : 'bg-pink-50'

  const lifespan =
    member.birth_year && member.death_year
      ? `${member.birth_year}-${member.death_year}`
      : member.birth_year
      ? `${member.birth_year}-${member.status === 'deceased' ? '?' : 'Present'}`
      : 'Year unknown'

  return (
    <div className="mb-8">
      <div className={`${bgColor} border-l-4 ${borderColor} p-6 rounded-lg shadow-md`}>
        <div className="flex gap-4">
          {/* Photo */}
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            />
          ) : (
            <div className={`w-20 h-20 rounded-full ${isMale ? 'bg-blue-200' : 'bg-pink-200'} flex items-center justify-center border-2 border-gray-300`}>
              <Users className="w-10 h-10 text-gray-600" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              {member.birth_year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Birth Year: {member.birth_year}</span>
                </div>
              )}
              
              {member.death_year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Lifespan: {lifespan}</span>
                </div>
              )}
              
              {member.status === 'deceased' && (
                <div className="flex items-center gap-2 text-red-600">
                  <Heart className="w-4 h-4 fill-red-600" />
                  <span>Deceased</span>
                </div>
              )}
            </div>
          </div>

          {/* Gender Badge */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isMale ? 'bg-blue-200' : 'bg-pink-200'}`}>
            <span className="text-2xl">{isMale ? '👨' : '👩'}</span>
          </div>
        </div>
      </div>

      {/* Children */}
      {member.children && member.children.length > 0 && (
        <div className="ml-8 mt-4">
          <div className="border-l-2 border-gray-300 pl-4">
            {member.children.map((child) => (
              <FamilyTreeNode key={child.id} member={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
