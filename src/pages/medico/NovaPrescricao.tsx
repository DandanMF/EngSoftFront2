import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMedicoAtivo, getPacienteById, getPacienteExtra, createReceitaLocal } from '../../services/localData';
import type { Paciente, PacienteExtra, ItemMedicamento } from '../../types';

const MEDICAMENTOS_LISTA = [
  'Amoxicilina 500mg',
  'Atorvastatina 20mg',
  'Captopril 25mg',
  'Dipirona 500mg',
  'Enalapril 10mg',
  'Ibuprofeno 400mg',
  'Losartana 50mg',
  'Metformina 850mg',
  'Omeprazol 20mg',
  'Paracetamol 750mg',
  'Sinvastatina 40mg',
];

function novoItem(): ItemMedicamento {
  return { id: crypto.randomUUID(), nome: '', dosagem: '', frequencia: '', duracao: '' };
}

export default function NovaPrescricao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const medico = getMedicoAtivo();

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [extra, setExtra] = useState<PacienteExtra>({ dataNascimento: '', telefone: '' });
  const [medicamentos, setMedicamentos] = useState<ItemMedicamento[]>([novoItem()]);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;
    const p = getPacienteById(Number(id));
    if (!p) { navigate('/medico/pacientes'); return; }
    setPaciente(p);
    setExtra(getPacienteExtra(p.id));
    setLoading(false);
  }, [id]);

  function atualizarMedicamento(itemId: string, campo: keyof ItemMedicamento, valor: string) {
    setMedicamentos(prev => prev.map(m => m.id === itemId ? { ...m, [campo]: valor } : m));
  }

  const podesSalvar = medicamentos.some(m => m.nome && m.dosagem && m.frequencia && m.duracao);

  function handleSalvar() {
    if (!paciente) return;
    setSalvando(true);
    setErro('');
    try {
      const validos = medicamentos.filter(m => m.nome && m.dosagem && m.frequencia && m.duracao);
      validos.forEach(med =>
        createReceitaLocal({
          medicoId: medico.id,
          pacienteId: paciente.id,
          medicamento: med.nome,
          dosagem: med.dosagem,
          frequencia: med.frequencia,
          duracao: med.duracao,
          observacoes: observacoes || undefined,
        })
      );
      navigate(`/medico/pacientes/${paciente.id}`);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar prescrição.');
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Carregando...</div>;
  if (!paciente) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-8 py-4">
        <button
          onClick={() => navigate(`/medico/pacientes/${paciente.id}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors mb-3"
        >
          ← Voltar ao prontuário
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nova Prescrição Médica</h1>
        <p className="text-blue-500 text-sm">Paciente: {paciente.nome}</p>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6 flex gap-6">
        {/* Coluna principal */}
        <div className="flex-1 space-y-5">
          {/* Medicamentos */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Medicamentos</h2>
              <button
                onClick={() => setMedicamentos(prev => [...prev, novoItem()])}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                + Adicionar
              </button>
            </div>

            <div className="space-y-4">
              {medicamentos.map((med, idx) => (
                <div key={med.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-blue-500 text-sm font-medium">Medicamento {idx + 1}</p>
                    {medicamentos.length > 1 && (
                      <button
                        onClick={() => setMedicamentos(prev => prev.filter(m => m.id !== med.id))}
                        className="text-gray-300 hover:text-red-400 text-lg transition-colors leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={med.nome}
                      onChange={e => atualizarMedicamento(med.id, 'nome', e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
                    >
                      <option value="">Selecione o medicamento</option>
                      {MEDICAMENTOS_LISTA.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Dosagem (ex: 500mg)"
                      value={med.dosagem}
                      onChange={e => atualizarMedicamento(med.id, 'dosagem', e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="Frequência (ex: 2x ao dia)"
                      value={med.frequencia}
                      onChange={e => atualizarMedicamento(med.id, 'frequencia', e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="Duração (ex: 7 dias)"
                      value={med.duracao}
                      onChange={e => atualizarMedicamento(med.id, 'duracao', e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Observações</h2>
            <textarea
              rows={4}
              placeholder="Orientações adicionais, recomendações de retorno, etc."
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/medico/pacientes/${paciente.id}`)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={!podesSalvar || salvando}
              className="flex-1 bg-[#1a2535] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#253347] transition-colors disabled:opacity-40"
            >
              {salvando ? 'Salvando...' : 'Salvar Prescrição'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informações do Paciente</h3>
            {extra.dataNascimento && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Data de Nascimento:</p>
                <p className="text-sm text-gray-800">{extra.dataNascimento}</p>
              </div>
            )}
            {extra.telefone && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Telefone:</p>
                <p className="text-sm text-gray-800">{extra.telefone}</p>
              </div>
            )}
            {!extra.dataNascimento && !extra.telefone && (
              <p className="text-gray-400 text-xs">Nenhuma informação adicional registrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
