import type { Medico, Paciente, Receita, ReceitaDTO } from '../types';
import {
  getMedicoAtivo,
  getPacientes,
  getPacienteById as getPacienteByIdLocal,
  createPacienteLocal,
  updatePacienteLocal,
  getReceitas,
  createReceitaLocal,
} from './localData';

// ── Médicos ───────────────────────────────────────────────────────────────────

export const getMedicos = async (): Promise<Medico[]> => [getMedicoAtivo()];

export const getMedicoById = async (_id: number): Promise<Medico> => getMedicoAtivo();

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
