import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, cadastro, getMedicoById } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { maskCPF, onlyDigits } from '../../utils/masks';

type Modo = 'login' | 'cadastro';

export default function LoginMedico() {
  const navigate = useNavigate();
  const { loginMedico } = useAuth();
  const showToast = useToast();

  const [modo, setModo] = useState<Modo>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [crm, setCrm] = useState('');
  const [loading, setLoading] = useState(false);

  function trocarModo(novoModo: Modo) {
    setModo(novoModo);
    setEmail('');
    setSenha('');
    setNome('');
    setCpf('');
    setCrm('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (modo === 'cadastro') {
        // Valida campos obrigatórios
        if (!nome.trim()) { showToast('Nome é obrigatório.', 'error'); return; }
        const cpfLimpo = onlyDigits(cpf);
        if (cpfLimpo.length !== 11) { showToast('CPF deve ter 11 dígitos.', 'error'); return; }
        if (!crm.trim()) { showToast('CRM é obrigatório.', 'error'); return; }
        if (senha.length < 6) { showToast('Senha deve ter no mínimo 6 caracteres.', 'error'); return; }

        const crmLimpo = crm.replace(/[\s/\-.]/g, '').toUpperCase();
        await cadastro({ email, senha, nome: nome.trim().toUpperCase(), cpf: cpfLimpo, crm: crmLimpo, role: 'MEDICO' });

        showToast('Conta criada com sucesso! Faça login para continuar.', 'success');
        trocarModo('login');

      } else {
        // Login real
        const resp = await login({ email, senha });

        if (resp.role !== 'MEDICO') {
          showToast('Esta conta não é de um médico. Use o acesso paciente.', 'error');
          return;
        }

        // Salva token antes de chamar endpoint autenticado
        localStorage.setItem('medsystem_token', resp.token);

        const medico = await getMedicoById(resp.perfilId);
        loginMedico(medico, resp.token);
        showToast(`Bem-vindo, Dr. ${medico.nome}!`, 'success');
        navigate('/medico/pacientes');
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';
      if (raw.includes('401') || raw.toLowerCase().includes('credenciais') || raw.toLowerCase().includes('invalid')) {
        showToast('E-mail ou senha incorretos.', 'error');
      } else if (raw.includes('400')) {
        showToast('Dados inválidos. Verifique os campos.', 'error');
      } else if (raw.toLowerCase().includes('cpf') || raw.toLowerCase().includes('crm') || raw.toLowerCase().includes('email')) {
        showToast(raw, 'error');
      } else {
        showToast('Não foi possível conectar ao servidor.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo */}
      <div className="w-1/2 bg-[#1a2535] text-white flex flex-col p-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-10 w-fit"
        >
          ← Voltar
        </button>

        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">MedSystem</p>
            <p className="text-white/60 text-sm">Prescrição Digital</p>
          </div>
        </div>

        <div className="mt-auto mb-auto">
          <h1 className="text-4xl font-bold mb-4">Área do Médico</h1>
          <p className="text-white/60 text-base leading-relaxed">
            Prescreva com segurança usando análise inteligente de conflitos
          </p>
        </div>
      </div>

      {/* Painel direito */}
      <div className="w-1/2 bg-white flex flex-col justify-center px-16">
        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {modo === 'login' ? 'Login' : 'Cadastro'}
          </h2>
          <p className="text-blue-500 text-sm mb-8">
            {modo === 'login'
              ? 'Entre com suas credenciais para acessar o sistema'
              : 'Crie sua conta de médico no MedSystem'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'cadastro' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Dr. Nome Sobrenome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={e => setCpf(maskCPF(e.target.value))}
                      maxLength={14}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CRM</label>
                    <input
                      type="text"
                      placeholder="CRM/SP 123456"
                      value={crm}
                      onChange={e => setCrm(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="medico@hospital.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {modo === 'cadastro' && (
                <p className="text-gray-400 text-xs mt-1">Mínimo de 6 caracteres</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a2535] text-white py-3 rounded-lg font-semibold hover:bg-[#253347] transition-colors disabled:opacity-60"
            >
              {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {modo === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => trocarModo(modo === 'login' ? 'cadastro' : 'login')}
              className="text-blue-500 hover:underline font-medium"
            >
              {modo === 'login' ? 'Cadastre-se' : 'Fazer login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
