import React, { createContext, useContext, useState } from 'react';
import type { Vaga, Candidate, FormQuestion } from '@/types';

interface AppState {
  vagas: Vaga[];
  candidates: Candidate[];
  addVaga: (vaga: Vaga) => void;
  updateVaga: (id: string, updates: Partial<Vaga>) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidateStatus: (id: string, status: Candidate['status']) => void;
  addCandidateNote: (id: string, note: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

const sampleQuestions: FormQuestion[] = [
  { id: '1', label: 'Por que você quer trabalhar nesta posição?', type: 'long_text', required: true },
  { id: '2', label: 'Anos de experiência na área', type: 'short_text', required: true },
];

const initialVagas: Vaga[] = [
  {
    id: 'demo-1',
    title: 'Desenvolvedor Full Stack Senior',
    description: 'Buscamos um desenvolvedor full stack para liderar projetos de tecnologia.',
    requirements: 'React, Node.js, TypeScript, 5+ anos de experiência',
    behavioral_criteria: 'Liderança, comunicação, trabalho em equipe',
    hiring_model: 'CLT',
    salary_min: 12000,
    salary_max: 18000,
    questions: sampleQuestions,
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

const initialCandidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Maria Silva',
    email: 'maria@email.com',
    phone: '(11) 99999-0001',
    vaga_id: 'demo-1',
    vaga_title: 'Desenvolvedor Full Stack Senior',
    status: 'Novo',
    answers: { '1': 'Tenho paixão por tecnologia e quero crescer.', '2': '6 anos' },
    notes: [],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cand-2',
    name: 'João Oliveira',
    email: 'joao@email.com',
    vaga_id: 'demo-1',
    vaga_title: 'Desenvolvedor Full Stack Senior',
    status: 'Triado',
    answers: { '1': 'Busco novos desafios profissionais.', '2': '3 anos' },
    notes: ['Perfil interessante, agendar entrevista.'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vagas, setVagas] = useState<Vaga[]>(initialVagas);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  const addVaga = (vaga: Vaga) => setVagas(prev => [vaga, ...prev]);

  const updateVaga = (id: string, updates: Partial<Vaga>) =>
    setVagas(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));

  const addCandidate = (candidate: Candidate) => setCandidates(prev => [candidate, ...prev]);

  const updateCandidateStatus = (id: string, status: Candidate['status']) =>
    setCandidates(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));

  const addCandidateNote = (id: string, note: string) =>
    setCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, notes: [...c.notes, note] } : c))
    );

  return (
    <AppContext.Provider value={{ vagas, candidates, addVaga, updateVaga, addCandidate, updateCandidateStatus, addCandidateNote }}>
      {children}
    </AppContext.Provider>
  );
};
