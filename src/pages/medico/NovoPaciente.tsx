import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPacienteLocal, setPacienteExtra } from '../../services/localData';
import { useToast } from '../../components/Toast';
import { maskCPF, maskPhone, maskDate, onlyDigits } from '../../utils/masks';

export default function NovoPaciente() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) { showToast('Nome é obrigatório.', 'error'); return; }
    if (onlyDigits(cpf).length !== 11) { showToast('CPF deve ter 11 dígitos.', 'error'); return; }
    if (!email.trim() || !email.includes('@')) { showToast('E-mail inválido.', 'error'); return; }

    setLoading(true);
    try {
      const paciente = createPacienteLocal({
        nome: nome.trim().toUpperCase(),
        cpf: onlyDigits(cpf),
        email: email.trim().toLowerCase(),
      });
      setPacienteExtra(paciente.id, {
        dataNascimento,
        telefone: onlyDigits(telefone),
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
