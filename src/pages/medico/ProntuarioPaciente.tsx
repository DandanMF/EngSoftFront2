import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPacienteById, getReceitas } from '../../services/api';
import { getPacienteExtra } from '../../services/localData';
import { useAuth } from '../../contexts/AuthContext';
import type { Paciente, PacienteExtra, Receita } from '../../types';

type Aba = 'informacoes' | 'prescricoes';

function iniciais(nome: string) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

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

export default function ProntuarioPaciente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const medico = session?.tipo === 'medico' ? session.user : null;

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [extra, setExtra] = useState<PacienteExtra>({ dataNascimento: '', telefone: '', alergias: [], condicoes: [] });
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<Aba>('informacoes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!medico) { navigate('/medico/login'); return; }
    if (!id) return;
    const numId = Number(id);
    Promise.all([getPacienteById(numId), getReceitas()])
      .then(([p, todasReceitas]) => {
        setPaciente(p);
        setExtra(getPacienteExtra(numId));
        setReceitas(todasReceitas.filter(r => r.paciente.id === numId));
      })
      .catch(() => navigate('/medico/pacientes'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Carregando...</div>;
  if (!paciente) return null;

  const cpfFormatado = paciente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const idade = calcularIdade(extra.dataNascimento);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a2535] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">MedSystem</p>
            <p className="text-xs text-gray-500">{medico ? `Dr. ${medico.nome} • CRM ${medico.crm}` : ''}</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate('/medico/pacientes')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
        >
          ← Voltar para lista de pacientes
        </button>

        {/* Cabeçalho do paciente */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold text-gray-600 flex-shrink-0">
            {iniciais(paciente.nome)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{paciente.nome}</h1>
            <div className="flex items-center gap-4 mt-1 text-gray-500 text-sm flex-wrap">
              {extra.dataNascimento && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {idade} anos
                </span>
              )}
              {extra.telefone && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {extra.telefone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {paciente.email}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/medico/pacientes/${paciente.id}/prescricao`)}
            className="bg-[#1a2535] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#253347] transition-colors flex-shrink-0"
          >
            Nova Prescrição
          </button>
        </div>

        {/* Abas */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            {(['informacoes', 'prescricoes'] as Aba[]).map(aba => (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                  abaAtiva === aba
                    ? 'border-[#1a2535] text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {aba === 'informacoes' ? 'Informações' : `Prescrições (${receitas.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Aba: Informações */}
        {abaAtiva === 'informacoes' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Alergias</h3>
              </div>
              {extra.alergias.length === 0
                ? <p className="text-gray-400 text-sm">Nenhuma alergia registrada</p>
                : <div className="space-y-2">{extra.alergias.map(a => (
                    <div key={a} className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">{a}</div>
                  ))}</div>
              }
            </div>

            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Condições Crônicas</h3>
              </div>
              {extra.condicoes.length === 0
                ? <p className="text-gray-400 text-sm">Nenhuma condição registrada</p>
                : <div className="space-y-2">{extra.condicoes.map(c => (
                    <div key={c} className="bg-amber-50 border border-amber-100 text-amber-700 text-sm px-3 py-2 rounded-lg">{c}</div>
                  ))}</div>
              }
            </div>

            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Dados Pessoais</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-blue-500 text-xs">CPF</p>
                  <p className="text-gray-800 font-medium">{cpfFormatado}</p>
                </div>
                {extra.dataNascimento && (
                  <div>
                    <p className="text-blue-500 text-xs">Data de Nascimento</p>
                    <p className="text-gray-800 font-medium">{extra.dataNascimento}</p>
                  </div>
                )}
                {extra.telefone && (
                  <div>
                    <p className="text-blue-500 text-xs">Telefone</p>
                    <p className="text-gray-800 font-medium">{extra.telefone}</p>
                  </div>
                )}
                <div>
                  <p className="text-blue-500 text-xs">E-mail</p>
                  <p className="text-gray-800 font-medium">{paciente.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba: Prescrições */}
        {abaAtiva === 'prescricoes' && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">Receitas Prescritas</p>
            </div>
            {receitas.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                Nenhuma prescrição registrada ainda.
              </div>
            ) : (
              receitas.map((r, i) => (
                <div key={r.id} className={`px-5 py-4 ${i < receitas.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-blue-500 text-sm">{r.medicamento}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {r.dosagem} • {r.frequencia} • {r.duracao}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Dr. {r.medico.nome} — CRM {r.medico.crm}
                      </p>
                      {r.observacoes && (
                        <p className="text-gray-600 text-xs mt-1">
                          <span className="font-medium">Obs:</span> {r.observacoes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
