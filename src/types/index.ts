export type FieldType = 'short_text' | 'long_text' | 'multiple_choice' | 'scale' | 'file_upload';

export interface FormQuestion {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  required: boolean;
}

export type HiringModel = 'CLT' | 'PJ' | 'Estágio' | 'Freelancer' | 'Temporário';

export interface Vaga {
  id: string;
  title: string;
  description: string;
  requirements: string;
  behavioral_criteria: string;
  hiring_model: HiringModel;
  salary_min: number;
  salary_max: number;
  questions: FormQuestion[];
  status: 'active' | 'inactive';
  created_at: string;
}

export type CandidateStatus = 'Novo' | 'Triado' | 'Entrevistado' | 'Teste' | 'Contratado' | 'Rejeitado';

export const ALL_STATUSES: CandidateStatus[] = ['Novo', 'Triado', 'Entrevistado', 'Teste', 'Contratado', 'Rejeitado'];

export interface HistoryEntry {
  id: string;
  action: string;
  details?: string;
  created_at: string;
}

export interface CandidateTest {
  id: string;
  test_name: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  score?: number;
  assigned_at: string;
  completed_at?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  vaga_id: string;
  vaga_title: string;
  status: CandidateStatus;
  answers: Record<string, string>;
  ai_scores?: Record<string, number>; // question_id -> 0-100 score
  resume_url?: string;
  notes: string[];
  history: HistoryEntry[];
  tests: CandidateTest[];
  created_at: string;
}
