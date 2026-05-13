import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPacienteById, getPacienteExtra, getReceitas } from '../../services/localData';
import type { PacienteExtra, Receita, Paciente } from '../../types';

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [extra, setExtra] = useState<PacienteExtra>({ dataNascimento: '', telefone: '' });
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { navigate('/medico/pacientes'); return; }
    const numId = Number(id);
    const p = getPacienteById(numId);
    if (!p) { navigate('/medico/pacientes'); return; }
    setPaciente(p);
    setExtra(getPacienteExtra(numId));
    setReceitas(getReceitas().filter(r => r.paciente.id === numId));
    setLoading(false);
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Carregando...</div>;
  if (!paciente) return null;

  const cpfFormatado = paciente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const idade = calcularIdade(extra.dataNascimento);

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
          onClick={() => navigate(`/medico/pacientes/${paciente.id}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Voltar ao Prontuário
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
