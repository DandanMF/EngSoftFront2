import type { Paciente, PacienteExtra, Medico, Receita, ReceitaDTO } from '../types';

const KEYS = {
  pacientes: 'medsystem_pacientes',
  receitas: 'medsystem_receitas',
  medicoAtivo: 'medsystem_medico_ativo',
  nextId: 'medsystem_next_id',
};

const DEFAULT_MEDICO: Medico = {
  id: 1,
  nome: 'João Silva',
  cpf: '12345678900',
  crm: '12345-SP',
  email: 'medico@medsystem.com',
};

function nextId(): number {
  const current = parseInt(localStorage.getItem(KEYS.nextId) ?? '2');
  localStorage.setItem(KEYS.nextId, String(current + 1));
  return current;
}

// ── Médico ────────────────────────────────────────────────────────────────────

export function getMedicoAtivo(): Medico {
  const raw = localStorage.getItem(KEYS.medicoAtivo);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(KEYS.medicoAtivo, JSON.stringify(DEFAULT_MEDICO));
  return DEFAULT_MEDICO;
}

// ── Pacientes ─────────────────────────────────────────────────────────────────

export function getPacientes(): Paciente[] {
  const raw = localStorage.getItem(KEYS.pacientes);
  return raw ? JSON.parse(raw) : [];
}

export function getPacienteById(id: number): Paciente | null {
  return getPacientes().find(p => p.id === id) ?? null;
}

export function createPacienteLocal(dto: { nome: string; cpf: string; email: string }): Paciente {
  const lista = getPacientes();
  const novo: Paciente = { id: nextId(), ...dto };
  localStorage.setItem(KEYS.pacientes, JSON.stringify([...lista, novo]));
  return novo;
}

export function updatePacienteLocal(id: number, dto: { nome: string; cpf: string; email: string }): Paciente {
  const lista = getPacientes().map(p => p.id === id ? { ...p, ...dto } : p);
  localStorage.setItem(KEYS.pacientes, JSON.stringify(lista));
  return lista.find(p => p.id === id)!;
}

// ── PacienteExtra ─────────────────────────────────────────────────────────────

export function getPacienteExtra(id: number): PacienteExtra {
  const raw = localStorage.getItem(`medsystem_paciente_${id}`);
  if (raw) return JSON.parse(raw);
  return { dataNascimento: '', telefone: '' };
}

export function setPacienteExtra(id: number, data: PacienteExtra) {
  localStorage.setItem(`medsystem_paciente_${id}`, JSON.stringify(data));
}

// ── Receitas ──────────────────────────────────────────────────────────────────

export function getReceitas(): Receita[] {
  const raw = localStorage.getItem(KEYS.receitas);
  return raw ? JSON.parse(raw) : [];
}

export function createReceitaLocal(dto: ReceitaDTO): Receita {
  const medico = getMedicoAtivo();
  const paciente = getPacienteById(dto.pacienteId);
  if (!paciente) throw new Error('Paciente não encontrado');

  const nova: Receita = {
    id: nextId(),
    medico,
    paciente,
    medicamento: dto.medicamento,
    dosagem: dto.dosagem,
    frequencia: dto.frequencia,
    duracao: dto.duracao,
    observacoes: dto.observacoes,
  };

  const lista = getReceitas();
  localStorage.setItem(KEYS.receitas, JSON.stringify([...lista, nova]));
  return nova;
}
