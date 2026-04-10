import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPacientes } from '../../services/api';
import { getPacienteExtra } from '../../services/localData';
import { useAuth } from '../../contexts/AuthContext';
import type { Paciente } from '../../types';

function iniciais(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

export default function Pacientes() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const medico = session?.tipo === 'medico' ? session.user : null;

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!medico) { navigate('/medico/login'); return; }
    getPacientes()
      .then(setPacientes)
      .catch(() => setErro('Erro ao carregar pacientes.'))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = pacientes.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.cpf.includes(busca.replace(/\D/g, ''))
  );

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <p className="text-xs text-gray-500">
              {medico ? `Dr. ${medico.nome} • CRM ${medico.crm}` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-500 text-sm mt-1">
              Selecione um paciente para acessar o prontuário ou{' '}
              <span className="text-blue-500">criar uma prescrição</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/medico/pacientes/novo')}
            className="flex items-center gap-2 bg-[#1a2535] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#253347] transition-colors"
          >
            <span className="text-lg leading-none">+</span> Novo Paciente
          </button>
        </div>

        {/* Busca */}
        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar paciente por nome ou CPF"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

        {/* Lista */}
        {loading && <p className="text-gray-500 text-sm">Carregando...</p>}
        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        {!loading && !erro && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lista de Pacientes</p>
            </div>

            {filtrados.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                {busca ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda.'}
              </div>
            ) : (
              filtrados.map((p, i) => {
                const extra = getPacienteExtra(p.id);
                const cpfFormatado = p.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/medico/pacientes/${p.id}`)}
                    className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${i < filtrados.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                      {iniciais(p.nome)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{p.nome}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {extra.dataNascimento ? `${calcularIdade(extra.dataNascimento)} anos • ` : ''}{cpfFormatado}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {extra.alergias.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {extra.alergias.length} alergia(s)
                        </span>
                      )}
                      {extra.condicoes.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {extra.condicoes.length} condição(ões)
                        </span>
                      )}
                    </div>

                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
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
