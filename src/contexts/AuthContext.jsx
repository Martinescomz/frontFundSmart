import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  // Inicializa o estado buscando o token que já existe no localStorage
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Injeta o token nas configurações do Axios para as próximas requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, [token]);

  // CORREÇÃO AQUI: A função login precisa apenas guardar o token string
  const login = (jwtToken) => {
    localStorage.setItem('token', jwtToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, authenticated: !!token }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);