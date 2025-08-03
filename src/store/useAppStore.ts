import { create } from 'zustand';

// Tipos básicos — substitua esses tipos `any` por interfaces reais se tiver
type Message = any;
type Product = any;
type Group = any;

export type ViewType = 'loading' | 'dashboard' | 'alert' | string;

interface AppStore {
  currentView: ViewType;
  currentGroup: string;
  groupImage: string;
  cpanelCurrentView: string;
  allowedGroup: Group | null;
  availableGroups: Group[];
  alertMessage: string;
  dateSearched: string | null;

  mentionedProducts: Product[];
  publishedProducts: Product[];
  buyersPerProduct: Record<string, any[]>; // ex: { "produtoA": ["cliente1", "cliente2"] }
  lostMessages: Message[];
  groups: Group[];

  setCurrentView: (view: ViewType) => void;
  setCurrentGroup: (grp: string) => void;
  setCpanelCurrentView: (view: string) => void;
  setDateSearched: (date: string | null) => void;
  setAllowedGroup: (group: Group | null) => void;
  setAlertMessage: (msg: string) => void;
  setAvailableGroups: (groups: Group[]) => void;

  setGroups: (grps: Group[]) => void;
  setMentionedProducts: (msgs: Product[]) => void;
  setPublishedProducts: (msgs: Product[]) => void;
  setLostMessages: (msgs: Message[]) => void;
  setBuyersPerProduct: (list: Record<string, string[]>) => void;

  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  setGroupImage: (grp: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentView: 'loading',
  currentGroup: '',
  cpanelCurrentView: 'dashboard',
  allowedGroup: null,
  availableGroups: [],
  alertMessage: '',
  dateSearched: null,
  groupImage: '',
  mentionedProducts: [],
  publishedProducts: [],
  buyersPerProduct: {},
  lostMessages: [],
  groups: [],

  setCurrentView: (view) => set({ currentView: view }),
  setGroupImage: (grp) => set({ groupImage: grp }),
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

  addMessage: (msg) => {
    const updated = [...get().lostMessages, msg];
    set({ lostMessages: updated });
  },
  clearMessages: () => set({ lostMessages: [] }),
}));
