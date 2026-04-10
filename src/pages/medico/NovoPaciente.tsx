import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPaciente } from '../../services/api';
import { setPacienteExtra } from '../../services/localData';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { maskCPF, maskPhone, maskDate, onlyDigits } from '../../utils/masks';

export default function NovoPaciente() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const showToast = useToast();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');

  const [alergiaInput, setAlergiaInput] = useState('');
  const [alergias, setAlergias] = useState<string[]>([]);

  const [condicaoInput, setCondicaoInput] = useState('');
  const [condicoes, setCondicoes] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  if (session?.tipo !== 'medico') {
    navigate('/medico/login');
    return null;
  }

  function addAlergia() {
    const val = alergiaInput.trim().toUpperCase();
    if (val && !alergias.includes(val)) {
      setAlergias(prev => [...prev, val]);
      setAlergiaInput('');
    }
  }

  function removeAlergia(a: string) {
    setAlergias(prev => prev.filter(x => x !== a));
  }

  function addCondicao() {
    const val = condicaoInput.trim().toUpperCase();
    if (val && !condicoes.includes(val)) {
      setCondicoes(prev => [...prev, val]);
      setCondicaoInput('');
    }
  }

  function removeCondicao(c: string) {
    setCondicoes(prev => prev.filter(x => x !== c));
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) { showToast('Nome é obrigatório.', 'error'); return; }
    if (onlyDigits(cpf).length !== 11) { showToast('CPF deve ter 11 dígitos.', 'error'); return; }
    if (!email.trim() || !email.includes('@')) { showToast('E-mail inválido.', 'error'); return; }

    setLoading(true);
    try {
      const paciente = await createPaciente({
        nome: nome.trim().toUpperCase(),
        cpf: onlyDigits(cpf),
        email: email.trim().toLowerCase(),
      });
      setPacienteExtra(paciente.id, {
        dataNascimento,
        telefone: onlyDigits(telefone),
        alergias,
        condicoes,
      });
      showToast('Paciente cadastrado com sucesso!', 'success');
      navigate(`/medico/pacientes/${paciente.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar paciente.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-8 py-5 border-b border-gray-100">
        <button
          onClick={() => navigate('/medico/pacientes')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Novo Paciente</h1>
        <p className="text-blue-500 text-sm">Preencha os dados do paciente</p>
      </div>

      <form onSubmit={handleSalvar} className="max-w-2xl mx-auto px-8 py-8 space-y-6">

        {/* Dados Pessoais */}
        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Dados Pessoais</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nome completo do paciente"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={e => setCpf(maskCPF(e.target.value))}
                maxLength={14}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                value={dataNascimento}
                onChange={e => setDataNascimento(maskDate(e.target.value))}
                maxLength={10}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={e => setTelefone(maskPhone(e.target.value))}
                maxLength={15}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Alergias */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Alergias</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite uma alergia e pressione Enter"
              value={alergiaInput}
              onChange={e => setAlergiaInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAlergia(); } }}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={addAlergia}
              className="bg-[#1a2535] text-white w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center hover:bg-[#253347] transition-colors"
            >
              +
            </button>
          </div>
          {alergias.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {alergias.map(a => (
                <span key={a} className="flex items-center gap-1 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  {a}
                  <button type="button" onClick={() => removeAlergia(a)} className="ml-1 text-red-400 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Condições Crônicas */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Condições Crônicas</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite uma condição crônica e pressione Enter"
              value={condicaoInput}
              onChange={e => setCondicaoInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCondicao(); } }}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={addCondicao}
              className="bg-[#1a2535] text-white w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center hover:bg-[#253347] transition-colors"
            >
              +
            </button>
          </div>
          {condicoes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {condicoes.map(c => (
                <span key={c} className="flex items-center gap-1 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  {c}
                  <button type="button" onClick={() => removeCondicao(c)} className="ml-1 text-amber-400 hover:text-amber-600">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/medico/pacientes')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#1a2535] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#253347] transition-colors disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar Paciente'}
          </button>
        </div>
      </form>
    </div>
  );
}
