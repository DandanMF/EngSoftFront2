import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Medico, Paciente } from '../types';

type AuthSession =
  | { tipo: 'medico'; user: Medico; perfilId: number }
  | { tipo: 'paciente'; user: Paciente; perfilId: number }
  | null;

interface AuthContextValue {
  session: AuthSession;
  token: string | null;
  loginMedico: (medico: Medico, token: string) => void;
  loginPaciente: (paciente: Paciente, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('medsystem_token')
  );

  const [session, setSession] = useState<AuthSession>(() => {
    const raw = localStorage.getItem('medsystem_session');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (session && token) {
      localStorage.setItem('medsystem_session', JSON.stringify(session));
      localStorage.setItem('medsystem_token', token);
    } else {
      localStorage.removeItem('medsystem_session');
      localStorage.removeItem('medsystem_token');
    }
  }, [session, token]);

  function loginMedico(medico: Medico, jwt: string) {
    setToken(jwt);
    setSession({ tipo: 'medico', user: medico, perfilId: medico.id });
  }

  function loginPaciente(paciente: Paciente, jwt: string) {
    setToken(jwt);
    setSession({ tipo: 'paciente', user: paciente, perfilId: paciente.id });
  }

  function logout() {
    setToken(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, token, loginMedico, loginPaciente, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
