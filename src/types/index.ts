// ── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  role: 'MEDICO' | 'PACIENTE';
  usuarioId: number;
  perfilId: number;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface CadastroPayload {
  email: string;
  senha: string;
  role: 'MEDICO' | 'PACIENTE';
  nome: string;
  cpf: string;
  crm?: string;
}

// ── Entidades ────────────────────────────────────────────────────────────────

export interface Medico {
  id: number;
  nome: string;
  cpf: string;
  crm: string;
  email: string;
}

export interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
}

export interface Receita {
  id: number;
  medico: Medico;
  paciente: Paciente;
  medicamento: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

export interface ReceitaDTO {
  medicoId: number;
  pacienteId: number;
  medicamento: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

// ── Dados extras do paciente (locais) ────────────────────────────────────────

export interface PacienteExtra {
  dataNascimento: string;
  telefone: string;
  alergias: string[];
  condicoes: string[];
}

// ── Formulário de prescrição (UI) ────────────────────────────────────────────

export interface ItemMedicamento {
  id: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
}
