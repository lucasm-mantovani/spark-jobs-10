export const FORM_FIELDS_KEY = 'safie_form_fields_config';

export interface FormFieldsConfig {
  dataNascimento: boolean;
  estado: boolean;
  cidade: boolean;
  cep: boolean;
  escolaridade: boolean;
  genero: boolean;
  racaCor: boolean;
  dispViagem: boolean;
  regime: boolean;
}

export const FORM_FIELDS_DEFAULT: FormFieldsConfig = {
  dataNascimento: true,
  estado: true,
  cidade: true,
  cep: true,
  escolaridade: true,
  genero: true,
  racaCor: true,
  dispViagem: false,
  regime: false,
};

export const FORM_FIELDS_LABELS: Record<keyof FormFieldsConfig, string> = {
  dataNascimento: 'Data de nascimento',
  estado: 'Estado',
  cidade: 'Cidade',
  cep: 'CEP',
  escolaridade: 'Escolaridade',
  genero: 'Gênero',
  racaCor: 'Raça/Cor',
  dispViagem: 'Disponibilidade para viagens',
  regime: 'Regime de trabalho preferido',
};

export const FORM_FIELDS_DESCRIPTIONS: Record<keyof FormFieldsConfig, string> = {
  dataNascimento: 'Idade do candidato',
  estado: 'UF onde mora',
  cidade: 'Cidade onde mora',
  cep: 'CEP de residência',
  escolaridade: 'Grau de instrução',
  genero: 'Diversidade — opcional para o candidato',
  racaCor: 'Diversidade IBGE — opcional para o candidato',
  dispViagem: 'Se a vaga exige viagens frequentes',
  regime: 'Preferência de trabalho remoto/presencial',
};

export const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export const ESCOLARIDADE_OPTIONS = [
  'Ensino Fundamental',
  'Ensino Médio incompleto',
  'Ensino Médio completo',
  'Superior incompleto',
  'Superior completo',
  'Pós-graduação / Especialização',
  'Mestrado',
  'Doutorado',
];

export const GENERO_OPTIONS = [
  'Masculino',
  'Feminino',
  'Não-binário',
  'Outro',
  'Prefiro não informar',
];

export const RACA_COR_OPTIONS = [
  'Branca',
  'Preta',
  'Parda',
  'Amarela',
  'Indígena',
  'Prefiro não declarar',
];

export function getFormFieldsConfig(): FormFieldsConfig {
  try {
    const saved = localStorage.getItem(FORM_FIELDS_KEY);
    if (saved) return { ...FORM_FIELDS_DEFAULT, ...JSON.parse(saved) };
  } catch {}
  return { ...FORM_FIELDS_DEFAULT };
}
