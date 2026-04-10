import type {
  AuthResponse, LoginPayload, CadastroPayload,
  Medico, Paciente, Receita, ReceitaDTO,
} from '../types';

const API_BASE = 'http://localhost:8080';

function getToken(): string | null {
  return localStorage.getItem('medsystem_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ${res.status}`);
  }
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const login = (dto: LoginPayload) =>
  request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(dto) });

export const cadastro = (dto: CadastroPayload) =>
  request<AuthResponse>('/auth/cadastro', { method: 'POST', body: JSON.stringify(dto) });

// ── Médicos ───────────────────────────────────────────────────────────────────

export const getMedicos = () => request<Medico[]>('/medicos');
export const getMedicoById = (id: number) => request<Medico>(`/medicos/${id}`);

// ── Pacientes ─────────────────────────────────────────────────────────────────

export const getPacientes = () => request<Paciente[]>('/pacientes');
export const getPacienteById = (id: number) => request<Paciente>(`/pacientes/${id}`);
export const createPaciente = (dto: { nome: string; cpf: string; email: string }) =>
  request<Paciente>('/pacientes', { method: 'POST', body: JSON.stringify(dto) });
export const updatePaciente = (id: number, dto: { nome: string; cpf: string; email: string }) =>
  request<Paciente>(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(dto) });

// ── Receitas ──────────────────────────────────────────────────────────────────

export const getReceitas = () => request<Receita[]>('/receitas');
export const getReceitaById = (id: number) => request<Receita>(`/receitas/${id}`);
export const createReceita = (dto: ReceitaDTO) =>
  request<Receita>('/receitas', { method: 'POST', body: JSON.stringify(dto) });
