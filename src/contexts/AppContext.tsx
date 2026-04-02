import React, { createContext, useContext, useState } from 'react';
import type { Vaga, Candidate, FormQuestion, CandidateStatus, HistoryEntry } from '@/types';

interface AppState {
  vagas: Vaga[];
  candidates: Candidate[];
  addVaga: (vaga: Vaga) => void;
  updateVaga: (id: string, updates: Partial<Vaga>) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidateStatus: (id: string, status: CandidateStatus) => void;
  addCandidateNote: (id: string, note: string) => void;
  addCandidateHistory: (id: string, entry: HistoryEntry) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

const sampleQuestions: FormQuestion[] = [
  { id: 'q1', label: 'Por que você quer trabalhar nesta posição?', type: 'long_text', required: true },
  { id: 'q2', label: 'Anos de experiência na área', type: 'short_text', required: true },
  { id: 'q3', label: 'Nível de inglês', type: 'multiple_choice', options: ['Básico', 'Intermediário', 'Avançado', 'Fluente'], required: true },
  { id: 'q4', label: 'Disponibilidade para início', type: 'short_text', required: true },
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
  {
    id: 'demo-2',
    title: 'Designer UX/UI Pleno',
    description: 'Procuramos designer para criar experiências digitais incríveis.',
    requirements: 'Figma, Design System, 3+ anos de experiência',
    behavioral_criteria: 'Criatividade, atenção ao detalhe, empatia',
    hiring_model: 'PJ',
    salary_min: 8000,
    salary_max: 14000,
    questions: [
      { id: 'dq1', label: 'Link do seu portfólio', type: 'short_text', required: true },
      { id: 'dq2', label: 'Descreva um projeto de UX que você lidera', type: 'long_text', required: true },
    ],
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const now = Date.now();
const initialCandidates: Candidate[] = [
  {
    id: 'cand-1', name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 99999-0001',
    linkedin: 'https://linkedin.com/in/mariasilva',
    vaga_id: 'demo-1', vaga_title: 'Desenvolvedor Full Stack Senior', status: 'Novo',
    answers: { q1: 'Tenho paixão por tecnologia e quero crescer profissionalmente.', q2: '6', q3: 'Avançado', q4: 'Imediato' },
    ai_scores: { q1: 85, q2: 90, q3: 95, q4: 100 },
    notes: [], history: [{ id: 'h1', action: 'Candidatura recebida', created_at: new Date(now - 86400000 * 2).toISOString() }],
    tests: [], created_at: new Date(now - 86400000 * 2).toISOString(),
  },
  {
    id: 'cand-2', name: 'João Oliveira', email: 'joao@email.com', phone: '(11) 99999-0002',
    vaga_id: 'demo-1', vaga_title: 'Desenvolvedor Full Stack Senior', status: 'Triado',
    answers: { q1: 'Busco novos desafios profissionais e crescimento.', q2: '3', q3: 'Intermediário', q4: '2 semanas' },
    ai_scores: { q1: 72, q2: 60, q3: 65, q4: 80 },
    notes: ['Perfil interessante, agendar entrevista.'],
    history: [
      { id: 'h2', action: 'Candidatura recebida', created_at: new Date(now - 86400000 * 3).toISOString() },
      { id: 'h3', action: 'Status alterado para Triado', details: 'Triado pelo recrutador', created_at: new Date(now - 86400000).toISOString() },
    ],
    tests: [], created_at: new Date(now - 86400000 * 3).toISOString(),
  },
  {
    id: 'cand-3', name: 'Ana Costa', email: 'ana@email.com', phone: '(21) 98888-1234',
    linkedin: 'https://linkedin.com/in/anacosta',
    vaga_id: 'demo-1', vaga_title: 'Desenvolvedor Full Stack Senior', status: 'Entrevistado',
    answers: { q1: 'Quero contribuir com minha experiência em projetos inovadores.', q2: '8', q3: 'Fluente', q4: 'Imediato' },
    ai_scores: { q1: 92, q2: 95, q3: 100, q4: 100 },
    notes: ['Excelente perfil técnico', 'Entrevista foi muito positiva'],
    history: [
      { id: 'h4', action: 'Candidatura recebida', created_at: new Date(now - 86400000 * 7).toISOString() },
      { id: 'h5', action: 'Status alterado para Triado', created_at: new Date(now - 86400000 * 5).toISOString() },
      { id: 'h6', action: 'Status alterado para Entrevistado', created_at: new Date(now - 86400000 * 2).toISOString() },
    ],
    tests: [{ id: 't1', test_name: 'Teste Técnico React', status: 'Concluído', score: 92, assigned_at: new Date(now - 86400000 * 3).toISOString(), completed_at: new Date(now - 86400000 * 2).toISOString() }],
    created_at: new Date(now - 86400000 * 7).toISOString(),
  },
  {
    id: 'cand-4', name: 'Pedro Santos', email: 'pedro@email.com',
    vaga_id: 'demo-2', vaga_title: 'Designer UX/UI Pleno', status: 'Novo',
    answers: { dq1: 'https://portfolio.pedro.com', dq2: 'Liderei o redesign do app principal da empresa, aumentando a retenção em 30%.' },
    ai_scores: { dq1: 70, dq2: 88 },
    notes: [], history: [{ id: 'h7', action: 'Candidatura recebida', created_at: new Date(now - 86400000).toISOString() }],
    tests: [], created_at: new Date(now - 86400000).toISOString(),
  },
  {
    id: 'cand-5', name: 'Carla Mendes', email: 'carla@email.com', phone: '(31) 97777-5555',
    vaga_id: 'demo-1', vaga_title: 'Desenvolvedor Full Stack Senior', status: 'Teste',
    answers: { q1: 'Tenho 10 anos de experiência e busco uma empresa inovadora.', q2: '10', q3: 'Fluente', q4: 'Imediato' },
    ai_scores: { q1: 88, q2: 100, q3: 100, q4: 100 },
    notes: ['Teste técnico atribuído'],
    history: [
      { id: 'h8', action: 'Candidatura recebida', created_at: new Date(now - 86400000 * 10).toISOString() },
      { id: 'h9', action: 'Status alterado para Teste', created_at: new Date(now - 86400000 * 2).toISOString() },
    ],
    tests: [{ id: 't2', test_name: 'Teste Técnico Full Stack', status: 'Em Andamento', assigned_at: new Date(now - 86400000 * 2).toISOString() }],
    created_at: new Date(now - 86400000 * 10).toISOString(),
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vagas, setVagas] = useState<Vaga[]>(initialVagas);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  const addVaga = (vaga: Vaga) => setVagas(prev => [vaga, ...prev]);
  const updateVaga = (id: string, updates: Partial<Vaga>) =>
    setVagas(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));

  const addCandidate = (candidate: Candidate) => setCandidates(prev => [candidate, ...prev]);

  const updateCandidateStatus = (id: string, status: CandidateStatus) =>
    setCandidates(prev => prev.map(c => {
      if (c.id !== id) return c;
      const entry: HistoryEntry = { id: crypto.randomUUID(), action: `Status alterado para ${status}`, created_at: new Date().toISOString() };
      return { ...c, status, history: [...c.history, entry] };
    }));

  const addCandidateNote = (id: string, note: string) =>
    setCandidates(prev => prev.map(c => {
      if (c.id !== id) return c;
      const entry: HistoryEntry = { id: crypto.randomUUID(), action: 'Nota adicionada', details: note, created_at: new Date().toISOString() };
      return { ...c, notes: [...c.notes, note], history: [...c.history, entry] };
    }));

  const addCandidateHistory = (id: string, entry: HistoryEntry) =>
    setCandidates(prev => prev.map(c => (c.id === id ? { ...c, history: [...c.history, entry] } : c)));

  const updateCandidate = (id: string, updates: Partial<Candidate>) =>
    setCandidates(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));

  return (
    <AppContext.Provider value={{ vagas, candidates, addVaga, updateVaga, addCandidate, updateCandidateStatus, addCandidateNote, addCandidateHistory, updateCandidate }}>
      {children}
    </AppContext.Provider>
  );
};
