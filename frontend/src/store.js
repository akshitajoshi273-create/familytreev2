import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user, token) => set({
    user,
    token,
    isAuthenticated: !!token,
  }),

  logout: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  setToken: (token) => set({ token, isAuthenticated: !!token }),
}))

export const useFamilyStore = create((set) => ({
  members: [],
  tree: null,
  selectedMember: null,

  setMembers: (members) => set({ members }),
  setTree: (tree) => set({ tree }),
  setSelectedMember: (member) => set({ selectedMember: member }),

  addMember: (member) => set((state) => ({
    members: [...state.members, member],
  })),

  updateMember: (memberId, updates) => set((state) => ({
    members: state.members.map((m) =>
      m.id === memberId ? { ...m, ...updates } : m
    ),
  })),

  removeMember: (memberId) => set((state) => ({
    members: state.members.filter((m) => m.id !== memberId),
  })),
}))

export const useLocationStore = create((set) => ({
  locations: [],
  searchResults: [],
  states: [],

  setLocations: (locations) => set({ locations }),
  setSearchResults: (results) => set({ searchResults: results }),
  setStates: (states) => set({ states }),
}))
