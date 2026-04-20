import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Vaga, Candidate, CandidateStatus, HistoryEntry, Admissao, DocumentoAdmissao } from '@/types';
import { ALL_STATUSES } from '@/types';

interface AppState {
  vagas: Vaga[];
  candidates: Candidate[];
  admissoes: Admissao[];
  loading: boolean;
  addVaga: (vaga: Omit<Vaga, 'id' | 'created_at'>) => Promise<Vaga>;
  updateVaga: (id: string, updates: Partial<Vaga>) => Promise<void>;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'created_at'>) => Promise<Candidate>;
  updateCandidateStatus: (id: string, status: CandidateStatus) => Promise<void>;
  addCandidateNote: (id: string, note: string) => Promise<void>;
  addCandidateHistory: (id: string, entry: HistoryEntry) => Promise<void>;
  updateCandidate: (id: string, updates: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  upsertAdmissao: (admissao: Omit<Admissao, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<Admissao>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

// Converte linha do banco para tipo Vaga
function rowToVaga(row: Record<string, unknown>): Vaga {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    requirements: row.requirements as string,
    behavioral_criteria: row.behavioral_criteria as string,
    hiring_model: row.hiring_model as Vaga['hiring_model'],
    salary_min: row.salary_min as number,
    salary_max: row.salary_max as number,
    questions: (row.questions as Vaga['questions']) ?? [],
    pipeline_stages: (row.pipeline_stages as string[]) ?? [...ALL_STATUSES],
    status: row.status as 'active' | 'inactive',
    created_at: row.created_at as string,
  };
}

// Converte linha do banco para tipo Candidate
function rowToCandidate(row: Record<string, unknown>): Candidate {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string | undefined,
    linkedin: row.linkedin as string | undefined,
    vaga_id: row.vaga_id as string,
    vaga_title: row.vaga_title as string,
    status: row.status as CandidateStatus,
    answers: (row.answers as Record<string, string>) ?? {},
    ai_scores: (row.ai_scores as Record<string, number>) ?? {},
    resume_url: row.resume_url as string | undefined,
    notes: (row.notes as string[]) ?? [],
    history: (row.history as HistoryEntry[]) ?? [],
    tests: (row.tests as Candidate['tests']) ?? [],
    created_at: row.created_at as string,
  };
}

function rowToAdmissao(row: Record<string, unknown>): Admissao {
  return {
    id: row.id as string,
    candidate_id: row.candidate_id as string,
    status: (row.status as Admissao['status']) ?? 'Pendente',
    documentos: (row.documentos as DocumentoAdmissao[]) ?? [],
    tipo_contrato: (row.tipo_contrato as string) ?? 'CLT',
    data_inicio: (row.data_inicio as string | null) ?? null,
    observacoes: (row.observacoes as string) ?? '',
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [admissoes, setAdmissoes] = useState<Admissao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vagasRes, candidatesRes, admissoesRes] = await Promise.all([
        supabase.from('vagas').select('*').order('created_at', { ascending: false }),
        supabase.from('candidates').select('*').order('created_at', { ascending: false }),
        supabase.from('admissoes').select('*').order('created_at', { ascending: false }),
      ]);

      if (vagasRes.error) throw vagasRes.error;
      if (candidatesRes.error) throw candidatesRes.error;

      setVagas((vagasRes.data ?? []).map(rowToVaga));
      setCandidates((candidatesRes.data ?? []).map(rowToCandidate));
      setAdmissoes((admissoesRes.data ?? []).map(rowToAdmissao));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-candidates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'candidates' }, payload => {
        const novo = rowToCandidate(payload.new as Record<string, unknown>);
        setCandidates(prev => prev.some(c => c.id === novo.id) ? prev : [novo, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates' }, payload => {
        const updated = rowToCandidate(payload.new as Record<string, unknown>);
        setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'candidates' }, payload => {
        setCandidates(prev => prev.filter(c => c.id !== (payload.old as { id: string }).id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addVaga = async (vaga: Omit<Vaga, 'id' | 'created_at'>): Promise<Vaga> => {
    const payload = JSON.parse(JSON.stringify(vaga));
    const { data, error } = await supabase
      .from('vagas')
      .insert(payload as any)
      .select()
      .single();
    if (error) throw error;
    const novaVaga = rowToVaga(data);
    setVagas(prev => [novaVaga, ...prev]);
    return novaVaga;
  };

  const updateVaga = async (id: string, updates: Partial<Vaga>): Promise<void> => {
    const payload: Record<string, unknown> = { ...updates };
    if (payload.questions) payload.questions = JSON.parse(JSON.stringify(payload.questions));
    const { error } = await supabase.from('vagas').update(payload as any).eq('id', id);
    if (error) throw error;
    setVagas(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };

  const addCandidate = async (candidate: Omit<Candidate, 'id' | 'created_at'>): Promise<Candidate> => {
    const payload = JSON.parse(JSON.stringify(candidate));
    const { data, error } = await supabase
      .from('candidates')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    const novoCandidate = rowToCandidate(data);
    setCandidates(prev => [novoCandidate, ...prev]);
    return novoCandidate;
  };

  const updateCandidateStatus = async (id: string, status: CandidateStatus): Promise<void> => {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;

    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      action: `Status alterado para ${status}`,
      created_at: new Date().toISOString(),
    };
    const updatedHistory = [...candidate.history, newEntry];

    const { error } = await supabase
      .from('candidates')
      .update({ status, history: JSON.parse(JSON.stringify(updatedHistory)) } as any)
      .eq('id', id);
    if (error) throw error;

    setCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, status, history: updatedHistory } : c))
    );
  };

  const addCandidateNote = async (id: string, note: string): Promise<void> => {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;

    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      action: 'Nota adicionada',
      details: note,
      created_at: new Date().toISOString(),
    };
    const updatedNotes = [...candidate.notes, note];
    const updatedHistory = [...candidate.history, newEntry];

    const { error } = await supabase
      .from('candidates')
      .update({ notes: JSON.parse(JSON.stringify(updatedNotes)), history: JSON.parse(JSON.stringify(updatedHistory)) } as any)
      .eq('id', id);
    if (error) throw error;

    setCandidates(prev =>
      prev.map(c =>
        c.id === id ? { ...c, notes: updatedNotes, history: updatedHistory } : c
      )
    );
  };

  const addCandidateHistory = async (id: string, entry: HistoryEntry): Promise<void> => {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;

    const updatedHistory = [...candidate.history, entry];
    const { error } = await supabase
      .from('candidates')
      .update({ history: JSON.parse(JSON.stringify(updatedHistory)) } as any)
      .eq('id', id);
    if (error) throw error;

    setCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, history: updatedHistory } : c))
    );
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>): Promise<void> => {
    const payload = JSON.parse(JSON.stringify(updates));
    const { error } = await supabase.from('candidates').update(payload as any).eq('id', id);
    if (error) throw error;
    setCandidates(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCandidate = async (id: string): Promise<void> => {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) throw error;
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const upsertAdmissao = async (admissao: Omit<Admissao, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Admissao> => {
    const payload = JSON.parse(JSON.stringify({ ...admissao, updated_at: new Date().toISOString() }));
    const { data, error } = await supabase.from('admissoes').upsert(payload).select().single();
    if (error) throw error;
    const nova = rowToAdmissao(data);
    setAdmissoes(prev => {
      const exists = prev.find(a => a.id === nova.id);
      return exists ? prev.map(a => a.id === nova.id ? nova : a) : [nova, ...prev];
    });
    return nova;
  };

  return (
    <AppContext.Provider
      value={{
        vagas,
        candidates,
        admissoes,
        loading,
        addVaga,
        updateVaga,
        addCandidate,
        updateCandidateStatus,
        addCandidateNote,
        addCandidateHistory,
        updateCandidate,
        deleteCandidate,
        upsertAdmissao,
        refreshData: fetchData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
