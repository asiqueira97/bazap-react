import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // 🔧 Configurações salvas pelo usuário
  currentView: 'loading',
  currentGroup: '',
  cpanelCurrentView: 'dashboard',
  allowedGroup: null,
  availableGroups: [],
  alertMessage: '',
  dateSearched: null,

  // 💬 Produtos mencionados
  mentionedProducts: [],
  // Produtos publicados
  publishedProducts: [],
  // Compradores por produto
  buyersPerProduct: [],
  // Mensagens soltas (sem produto associado)
  lostMessages: [],

  // Grupos
  groups: [],

  // ✅ Ações
  setCurrentView: (view) => set({ currentView: view }),
  setCurrentGroup: (grp) => set({ currentGroup: grp }),
  setCpanelCurrentView: (view) => set({ cpanelCurrentView: view }),
  setDateSearched: (date) => set({ dateSearched: date }),
  setAllowedGroup: (group) => set({ allowedGroup: group }),
  setAlertMessage: (msg) => set({ alertMessage: msg }),
  setAvailableGroups: (groups) => set({ availableGroups: groups }),

  setGroups: (grps) => set({ groups: grps }),
  setMentionedProducts: (msgs) => set({ mentionedProducts: msgs }),
  setPublishedProducts: (msgs) => set({ publishedProducts: msgs }),
  setLostMessages: (msgs) => set({ lostMessages: msgs }),
  setBuyersPerProduct: (list) => set({ buyersPerProduct: list }),
  addMessage: (msg) => set({ messages: [...get().messages, msg] }),
  clearMessages: () => set({ messages: [] }),
}));
