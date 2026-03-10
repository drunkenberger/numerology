// ─────────────────────────────────────────────────────────────────────────────
// HOOK — useMembers
// Toda la comunicación con la DB va por la API (service_role_key bypasa RLS).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useStore } from '../stores/app.store';
import type { FamilyMember } from '../stores/app.store';

function rowToMember(row: Record<string, unknown>): FamilyMember {
  return {
    id:               row.id as string,
    userId:           row.user_id as string,
    firstName:        row.first_name as string,
    paternalSurname:  row.paternal_surname as string,
    maternalSurname:  row.maternal_surname as string,
    birthDay:         row.birth_day as number,
    birthMonth:       row.birth_month as number,
    birthYear:        row.birth_year as number,
    relation:         row.relation as string,
    numbers:          row.numbers as FamilyMember['numbers'],
    createdAt:        row.created_at as string,
  };
}

export function useMembers() {
  const setMembers = useStore(s => s.setMembers);
  const members    = useStore(s => s.members);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.getMembers();
      setMembers(rows.map(rowToMember));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar integrantes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setMembers]);

  useEffect(() => { void fetchMembers(); }, [fetchMembers]);

  const addMember = useCallback(async (input: Omit<FamilyMember, 'id' | 'userId' | 'createdAt'>) => {
    const data = await api.createMember({
      firstName:       input.firstName,
      paternalSurname: input.paternalSurname,
      maternalSurname: input.maternalSurname,
      birthDay:        input.birthDay,
      birthMonth:      input.birthMonth,
      birthYear:       input.birthYear,
      relation:        input.relation,
      numbers:         input.numbers ?? undefined,
    });

    const member = rowToMember(data);
    useStore.getState().upsertMember(member);
    return member;
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    await api.deleteMember(id);
    useStore.getState().removeMember(id);
  }, []);

  return { members, loading, error, refresh: fetchMembers, addMember, deleteMember };
}
