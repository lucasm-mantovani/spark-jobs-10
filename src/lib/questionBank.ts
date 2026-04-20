import type { FieldType } from '@/types';

export interface SuggestedQuestion {
  label: string;
  type: FieldType;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
}

export interface QuestionCategory {
  id: string;
  label: string;
  emoji: string;
  questions: SuggestedQuestion[];
}

export const QUESTION_BANK: QuestionCategory[] = [
  {
    id: 'motivacao',
    label: 'Motivação e Fit Cultural',
    emoji: '🎯',
    questions: [
      { label: 'Por que você quer trabalhar nesta empresa?', type: 'long_text' },
      { label: 'O que te motivou a se candidatar a esta vaga?', type: 'long_text' },
      { label: 'O que você sabe sobre a nossa empresa?', type: 'long_text' },
      { label: 'Quais são seus objetivos profissionais para os próximos 3 anos?', type: 'long_text' },
      { label: 'Como você se imagina contribuindo para o crescimento da empresa?', type: 'long_text' },
      { label: 'O que você busca em um ambiente de trabalho ideal?', type: 'long_text' },
      { label: 'Por que você é a pessoa certa para esta vaga?', type: 'long_text' },
      { label: 'Como você descreveria sua cultura de trabalho ideal?', type: 'long_text' },
      { label: 'O que mais te entusiasma nesta área de atuação?', type: 'long_text' },
      { label: 'Você prefere trabalhar de forma independente ou em equipe? Por quê?', type: 'long_text' },
      { label: 'O que faria você sair de um emprego?', type: 'long_text' },
      { label: 'Como você lida com a rotina versus projetos variados?', type: 'long_text' },
    ],
  },
  {
    id: 'experiencia',
    label: 'Experiência Profissional',
    emoji: '💼',
    questions: [
      { label: 'Descreva sua principal experiência profissional na área', type: 'long_text' },
      { label: 'Qual foi o maior projeto que você liderou ou participou?', type: 'long_text' },
      { label: 'Por que está saindo (ou saiu) do seu emprego atual/anterior?', type: 'long_text' },
      { label: 'Qual foi sua maior conquista profissional até hoje?', type: 'long_text' },
      { label: 'Descreva as principais responsabilidades do seu cargo atual ou mais recente', type: 'long_text' },
      { label: 'Com que tipo de liderança você trabalhou melhor?', type: 'long_text' },
      { label: 'Você já gerenciou pessoas? Quantas e por quanto tempo?', type: 'short_text' },
      { label: 'Qual foi o projeto mais desafiador da sua carreira e como conduziu?', type: 'long_text' },
      { label: 'Você tem experiência em empresas de qual porte? (startup, médio porte, grande empresa)', type: 'multiple_choice', options: ['Startup', 'Médio porte', 'Grande empresa', 'Todos os portes'] },
      { label: 'Descreva uma situação em que você teve que aprender algo novo rapidamente', type: 'long_text' },
      { label: 'Como você construiu relacionamentos com clientes ou parceiros no emprego anterior?', type: 'long_text' },
      { label: 'Você já participou de processos de melhoria ou reestruturação na empresa?', type: 'long_text' },
    ],
  },
  {
    id: 'comportamental',
    label: 'Comportamental',
    emoji: '🧠',
    questions: [
      { label: 'Como você lida com prazos apertados?', type: 'long_text' },
      { label: 'Descreva uma situação de conflito com um colega e como resolveu', type: 'long_text' },
      { label: 'Como você prioriza suas tarefas quando tudo parece urgente?', type: 'long_text' },
      { label: 'Conte sobre um erro profissional e o que aprendeu com ele', type: 'long_text' },
      { label: 'Como você reage a críticas ou feedbacks negativos?', type: 'long_text' },
      { label: 'Descreva uma situação em que precisou trabalhar sob pressão intensa', type: 'long_text' },
      { label: 'Como você lida com mudanças repentinas de prioridade?', type: 'long_text' },
      { label: 'Conte sobre uma vez em que foi além do que era esperado de você', type: 'long_text' },
      { label: 'Como você age quando discorda de uma decisão do seu gestor?', type: 'long_text' },
      { label: 'Como você se motiva em dias difíceis ou de baixa produtividade?', type: 'long_text' },
      { label: 'Você se considera uma pessoa mais analítica ou criativa? Por quê?', type: 'long_text' },
      { label: 'Como você lida com tarefas repetitivas ou de baixa complexidade?', type: 'long_text' },
      { label: 'Descreva como você dá e recebe feedbacks', type: 'long_text' },
      { label: 'Como você se organiza para cumprir várias demandas simultâneas?', type: 'long_text' },
    ],
  },
  {
    id: 'tecnico',
    label: 'Técnico',
    emoji: '⚙️',
    questions: [
      { label: 'Quais ferramentas, sistemas ou softwares você domina?', type: 'long_text' },
      { label: 'Qual habilidade técnica você considera seu maior diferencial?', type: 'long_text' },
      { label: 'Você tem alguma certificação profissional relevante? Qual?', type: 'short_text' },
      { label: 'Descreva um problema técnico complexo que você resolveu', type: 'long_text' },
      { label: 'Como você se mantém atualizado na sua área?', type: 'long_text' },
      { label: 'Você já desenvolveu ou implementou algum processo novo em uma empresa?', type: 'long_text' },
      { label: 'Qual é a ferramenta ou metodologia que mais usa no dia a dia?', type: 'short_text' },
      { label: 'Você tem experiência com análise de dados ou criação de relatórios?', type: 'long_text' },
      { label: 'Já trabalhou com gestão de projetos? Qual metodologia utiliza?', type: 'short_text' },
      { label: 'Como você avalia seu nível de domínio em pacote Office/Google Workspace?', type: 'multiple_choice', options: ['Básico', 'Intermediário', 'Avançado', 'Expert'] },
      { label: 'Você tem experiência com atendimento ao cliente ou suporte técnico?', type: 'long_text' },
      { label: 'Como você documenta processos ou transfere conhecimento para a equipe?', type: 'long_text' },
    ],
  },
  {
    id: 'disponibilidade',
    label: 'Disponibilidade e Logística',
    emoji: '📍',
    questions: [
      { label: 'Você tem disponibilidade para viagens? Com que frequência?', type: 'multiple_choice', options: ['Sim, sem restrições', 'Sim, eventualmente', 'Não tenho disponibilidade'] },
      { label: 'Você toparia mudança de cidade ou estado se a vaga exigir?', type: 'multiple_choice', options: ['Sim', 'Não', 'Depende da proposta'] },
      { label: 'Qual a sua disponibilidade de horário?', type: 'multiple_choice', options: ['Horário comercial', 'Flexível', 'Disponibilidade total', 'Apenas meio período'] },
      { label: 'Você tem disponibilidade para horas extras eventuais?', type: 'multiple_choice', options: ['Sim', 'Não', 'Eventualmente'] },
      { label: 'Em quanto tempo você poderia começar a trabalhar?', type: 'multiple_choice', options: ['Imediatamente', 'Em 15 dias', 'Em 30 dias', 'Em mais de 30 dias'] },
      { label: 'Você possui veículo próprio?', type: 'multiple_choice', options: ['Sim, carro', 'Sim, moto', 'Não possuo'] },
      { label: 'Qual regime de trabalho você prefere?', type: 'multiple_choice', options: ['Presencial', 'Remoto', 'Híbrido', 'Sem preferência'] },
      { label: 'Você tem disponibilidade para atuar em finais de semana eventualmente?', type: 'multiple_choice', options: ['Sim', 'Não', 'Eventualmente'] },
      { label: 'Qual é o tempo estimado de deslocamento até o local de trabalho?', type: 'short_text' },
      { label: 'Você tem disponibilidade para atender clientes fora do horário comercial?', type: 'multiple_choice', options: ['Sim', 'Não', 'Eventualmente'] },
    ],
  },
  {
    id: 'desenvolvimento',
    label: 'Carreira e Desenvolvimento',
    emoji: '🚀',
    questions: [
      { label: 'Quais cursos, treinamentos ou workshops você fez nos últimos 2 anos?', type: 'long_text' },
      { label: 'Você está cursando ou planeja fazer uma pós-graduação?', type: 'short_text' },
      { label: 'Qual área do seu campo profissional você mais quer desenvolver?', type: 'long_text' },
      { label: 'Como você investe no seu desenvolvimento profissional?', type: 'long_text' },
      { label: 'Onde você se vê profissionalmente em 5 anos?', type: 'long_text' },
      { label: 'Qual competência você mais quer desenvolver nos próximos 12 meses?', type: 'long_text' },
      { label: 'Você tem mentores ou referências profissionais? O que aprendeu com eles?', type: 'long_text' },
      { label: 'Você acompanha tendências e novidades da sua área? Como?', type: 'long_text' },
      { label: 'Você já leu algum livro ou fez algum curso que mudou sua forma de trabalhar?', type: 'long_text' },
      { label: 'O que você ainda não sabe fazer, mas gostaria muito de aprender?', type: 'long_text' },
      { label: 'Como você equilibra desenvolvimento profissional e vida pessoal?', type: 'long_text' },
    ],
  },
];
