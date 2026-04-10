import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo - dark */}
      <div className="w-1/2 bg-[#1a2535] text-white flex flex-col justify-between p-10">
        <div className="flex items-center gap-3">
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

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Sistema Inteligente de Prescrição Médica
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Análise automática de conflitos medicamentosos e contraindicações para maior segurança do paciente.
          </p>
        </div>

        <div />
      </div>

      {/* Painel direito - branco */}
      <div className="w-1/2 bg-white flex flex-col justify-center px-16">
        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Bem-vindo</h2>
          <p className="text-blue-500 text-sm mb-8">Selecione o tipo de acesso para continuar</p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/medico/login')}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Acesso Médico</p>
                <p className="text-gray-500 text-sm">Prescrever e gerenciar tratamentos</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/paciente/login')}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Acesso Paciente</p>
                <p className="text-gray-500 text-sm">Consultar prescrições e histórico</p>
              </div>
            </button>
          </div>

          <p className="text-center text-gray-400 text-xs mt-10">
            Sistema seguro e certificado para gestão de prescrições médicas
          </p>
        </div>
      </div>
    </div>
  );
}
