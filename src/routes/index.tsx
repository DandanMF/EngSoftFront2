import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/Toast';

import Home from '../pages/Home';
import LoginMedico from '../pages/medico/LoginMedico';
import Pacientes from '../pages/medico/Pacientes';
import NovoPaciente from '../pages/medico/NovoPaciente';
import ProntuarioPaciente from '../pages/medico/ProntuarioPaciente';
import NovaPrescricao from '../pages/medico/NovaPrescricao';
import LoginPaciente from '../pages/paciente/LoginPaciente';
import DashboardPaciente from '../pages/paciente/Dashboard';

export function AppRoutes() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Área do Médico */}
          <Route path="/medico/login" element={<LoginMedico />} />
          <Route path="/medico/pacientes" element={<Pacientes />} />
          <Route path="/medico/pacientes/novo" element={<NovoPaciente />} />
          <Route path="/medico/pacientes/:id" element={<ProntuarioPaciente />} />
          <Route path="/medico/pacientes/:id/prescricao" element={<NovaPrescricao />} />

          {/* Área do Paciente */}
          <Route path="/paciente/login" element={<LoginPaciente />} />
          <Route path="/paciente/dashboard" element={<DashboardPaciente />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
