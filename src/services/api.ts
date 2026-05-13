import type { Medico, Paciente, Receita, ReceitaDTO, AuthResponse, LoginPayload, CadastroPayload } from '../types';
import {
  getMedicoAtivo,
  getMedicosList,
  getMedicoByIdLocal,
  createMedicoLocal,
  getPacientes,
  getPacienteById as getPacienteByIdLocal,
  createPacienteLocal,
  updatePacienteLocal,
  getReceitas,
  createReceitaLocal,
  findUserByCredentials,
  createUser,
} from './localData';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const user = findUserByCredentials(payload.email, payload.senha);
  if (!user) throw new Error('401 - Credenciais inválidas');
  return { token: btoa(`${user.email}:${user.id}`), role: user.role, usuarioId: user.id, perfilId: user.perfilId };
};

export const cadastro = async (payload: CadastroPayload): Promise<void> => {
  let perfilId: number;
  if (payload.role === 'MEDICO') {
    const medico = createMedicoLocal({ nome: payload.nome, cpf: payload.cpf, crm: payload.crm ?? '', email: payload.email });
    perfilId = medico.id;
  } else {
    const paciente = createPacienteLocal({ nome: payload.nome, cpf: payload.cpf, email: payload.email });
    perfilId = paciente.id;
  }
  createUser(payload.email, payload.senha, payload.role, perfilId);
};

// ── Médicos ───────────────────────────────────────────────────────────────────

export const getMedicos = async (): Promise<Medico[]> => getMedicosList();

export const getMedicoById = async (id: number): Promise<Medico> => {
  const m = getMedicoByIdLocal(id);
  if (!m) return getMedicoAtivo();
  return m;
};

// ── Pacientes ─────────────────────────────────────────────────────────────────

export const getPacientesApi = async (): Promise<Paciente[]> => getPacientes();

export const getPacienteById = async (id: number): Promise<Paciente> => {
  const p = getPacienteByIdLocal(id);
  if (!p) throw new Error('Paciente não encontrado');
  return p;
};

export const createPaciente = async (dto: { nome: string; cpf: string; email: string }): Promise<Paciente> =>
  createPacienteLocal(dto);

export const updatePaciente = async (id: number, dto: { nome: string; cpf: string; email: string }): Promise<Paciente> =>
  updatePacienteLocal(id, dto);

// ── Receitas ──────────────────────────────────────────────────────────────────

export const getReceitasApi = async (): Promise<Receita[]> => getReceitas();

export const createReceita = async (dto: ReceitaDTO): Promise<Receita> => createReceitaLocal(dto);
