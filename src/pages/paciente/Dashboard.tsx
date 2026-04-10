import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReceitas } from '../../services/api';
import { getPacienteExtra } from '../../services/localData';
import { useAuth } from '../../contexts/AuthContext';
import type { PacienteExtra, Receita } from '../../types';

function calcularIdade(dataNascimento: string): number {
  if (!dataNascimento) return 0;
  const [dia, mes, ano] = dataNascimento.split('/').map(Number);
  const nasc = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export default function DashboardPaciente() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const paciente = session?.tipo === 'paciente' ? session.user : null;

  const [extra, setExtra] = useState<PacienteExtra>({ dataNascimento: '', telefone: '', alergias: [], condicoes: [] });
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paciente) { navigate('/paciente/login'); return; }
    setExtra(getPacienteExtra(paciente.id));
    getReceitas()
      .then(todas => setReceitas(todas.filter(r => r.paciente.id === paciente.id)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Carregando...</div>;
  if (!paciente) return null;

  const cpfFormatado = paciente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const idade = calcularIdade(extra.dataNascimento);

  // Agrupa receitas por médico para exibição
  const porMedico = receitas.reduce<Record<number, { medico: Receita['medico']; receitas: Receita[] }>>((acc, r) => {
    if (!acc[r.medico.id]) acc[r.medico.id] = { medico: r.medico, receitas: [] };
    acc[r.medico.id].receitas.push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">MedSystem</p>
            <p className="text-xs text-gray-500">Portal do Paciente</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Card do paciente */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{paciente.nome}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {idade > 0 ? `${idade} anos • ` : ''}CPF:{' '}
                <span className="text-blue-500">{cpfFormatado}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <div className="text-center border border-gray-200 rounded-lg px-4 py-2">
                <p className="text-xl font-bold text-gray-900">{receitas.length}</p>
                <p className="text-xs text-gray-500">Prescrições</p>
              </div>
            </div>
          </div>

          {(extra.alergias.length > 0 || extra.condicoes.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mt-5">
              {extra.alergias.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-semibold text-red-700">Alergias</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extra.alergias.map(a => (
                      <span key={a} className="text-xs bg-white border border-red-200 text-red-700 px-2 py-1 rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {extra.condicoes.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-semibold text-amber-700">Condições Crônicas</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extra.condicoes.map(c => (
                      <span key={c} className="text-xs bg-white border border-amber-200 text-amber-700 px-2 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prescrições */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Prescrições Médicas</h2>
          <p className="text-blue-500 text-sm mb-4">Histórico de prescrições recebidas</p>

          {receitas.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg px-6 py-10 text-center text-gray-400 text-sm">
              Nenhuma prescrição registrada ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.values(porMedico).map(grupo => (
                <div key={grupo.medico.id} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Dr. {grupo.medico.nome}</p>
                      <p className="text-gray-400 text-xs">CRM {grupo.medico.crm}</p>
                    </div>
                    <span className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-full">
                      {grupo.receitas.length} medicamento(s)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {grupo.receitas.map(r => (
                      <div key={r.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <p className="text-blue-500 text-sm font-medium">{r.medicamento}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 ml-6">
                          <div>
                            <p className="text-xs text-gray-400">Dosagem</p>
                            <p className="text-sm text-gray-700 font-medium">{r.dosagem}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Frequência</p>
                            <p className="text-sm text-blue-500 font-medium">{r.frequencia}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Duração</p>
                            <p className="text-sm text-gray-700 font-medium">{r.duracao}</p>
                          </div>
                        </div>
                        {r.observacoes && (
                          <div className="mt-2 ml-6 bg-blue-50 border border-blue-100 rounded px-3 py-2 text-xs">
                            <span className="font-semibold text-gray-700">Obs:</span>{' '}
                            <span className="text-blue-600">{r.observacoes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
