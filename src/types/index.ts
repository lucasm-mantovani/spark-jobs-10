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

export type CandidateStatus = 'Novo' | 'Triado' | 'Entrevistado' | 'Contratado' | 'Rejeitado';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vaga_id: string;
  vaga_title: string;
  status: CandidateStatus;
  answers: Record<string, string>;
  resume_url?: string;
  notes: string[];
  created_at: string;
}
