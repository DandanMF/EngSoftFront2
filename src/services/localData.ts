import type { PacienteExtra } from '../types';

// Dados extras do paciente (alergias, condições, dados pessoais complementares)
// armazenados localmente pois o backend não possui esses campos

export function getPacienteExtra(id: number): PacienteExtra {
  const raw = localStorage.getItem(`medsystem_paciente_${id}`);
  if (raw) return JSON.parse(raw);
  return { dataNascimento: '', telefone: '', alergias: [], condicoes: [] };
}

export function setPacienteExtra(id: number, data: PacienteExtra) {
  localStorage.setItem(`medsystem_paciente_${id}`, JSON.stringify(data));
}
