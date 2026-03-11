// ─────────────────────────────────────────────────────────────────────────────
// STORE — Zustand global state
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { ReadingContent, ReadingType, Interpretation, ReadingListItem } from '../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MemberNumbers {
  soul: number;
  personality: number;
  karma: number;
  destiny: number;
  mission: number;
  personalYear: number;
}

export interface FamilyMember {
  id: string;
  userId: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  relation: string;
  numbers: MemberNumbers | null;
  createdAt: string;
}

export interface Reading {
  id: string;
  type: ReadingType;
  interpretation: Interpretation;
  memberIds: string[];
  content: ReadingContent;
  htmlUrl: string | null;
  cached: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  language: string;
  isPremium: boolean;
  readingCredits: number;
}

// ── Auth slice ────────────────────────────────────────────────────────────────

interface AuthSlice {
  session:        Session | null;
  user:           User    | null;
  profile:        Profile | null;
  isPremium:      boolean;
  readingCredits: number;
  setSession:     (session: Session | null) => void;
  setProfile:     (profile: Profile | null) => void;
  setCredits:     (credits: number) => void;
}

// ── Family slice ──────────────────────────────────────────────────────────────

interface FamilySlice {
  members:   FamilyMember[];
  setMembers: (members: FamilyMember[]) => void;
  upsertMember: (member: FamilyMember) => void;
  removeMember: (id: string) => void;
}

// ── Readings slice ────────────────────────────────────────────────────────────

interface ReadingsSlice {
  readings:        Record<string, Reading>;
  readingHistory:  ReadingListItem[];
  addReading:      (reading: Reading) => void;
  setReadingHistory: (items: ReadingListItem[]) => void;
  removeReadingFromHistory: (id: string) => void;
}

// ── Combined store ────────────────────────────────────────────────────────────

type AppStore = AuthSlice & FamilySlice & ReadingsSlice;

export const useStore = create<AppStore>((set) => ({
  // ── Auth
  session:        null,
  user:           null,
  profile:        null,
  isPremium:      false,
  readingCredits: 0,

  setSession: (session) => set({
    session,
    user:           session?.user ?? null,
    isPremium:      false,
    readingCredits: 0,
  }),

  setProfile: (profile) => set({
    profile,
    isPremium:      profile?.isPremium ?? false,
    readingCredits: profile?.readingCredits ?? 0,
  }),

  setCredits: (credits) => set({ readingCredits: credits }),

  // ── Family
  members: [],

  setMembers: (members) => set({ members }),

  upsertMember: (member) => set((state) => {
    const exists = state.members.find(m => m.id === member.id);
    if (exists) {
      return { members: state.members.map(m => m.id === member.id ? member : m) };
    }
    return { members: [...state.members, member] };
  }),

  removeMember: (id) => set((state) => ({
    members: state.members.filter(m => m.id !== id),
  })),

  // ── Readings
  readings: {},
  readingHistory: [],

  addReading: (reading) => set((state) => ({
    readings: { ...state.readings, [reading.id]: reading },
  })),

  setReadingHistory: (items) => set({ readingHistory: items }),

  removeReadingFromHistory: (id) => set((state) => {
    const { [id]: _, ...rest } = state.readings;
    return {
      readingHistory: state.readingHistory.filter(r => r.id !== id),
      readings: rest,
    };
  }),
}));

// ── Selectors convenientes ────────────────────────────────────────────────────

export const useAuth           = () => useStore(s => ({ session: s.session, user: s.user, profile: s.profile, isPremium: s.isPremium, readingCredits: s.readingCredits }));
export const useMembers        = () => useStore(s => s.members);
export const useReadings       = () => useStore(s => Object.values(s.readings));
export const useReadingHistory = () => useStore(s => s.readingHistory);
