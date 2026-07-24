import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, WalletCards } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && formData.password !== formData.password_confirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await api.post(endpoint, formData);
      
      // Token path resolution: response.data.data.token or response.data.token
      const token = response.data?.data?.token || response.data?.token;

      if (token) {
        login(token);
        navigate('/');
      } else {
        // Se cadastrar não retornar token, voltamos pro login.
        if (!isLogin) {
          setIsLogin(true);
          setFormData({ name: '', email: '', password: '', password_confirmation: '' });
          alert('Cadastro realizado com sucesso! Faça login para continuar.');
        } else {
          setError('Token não retornado pela API.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao autenticar. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mb-4">
            <WalletCards size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">FundSmart</h1>
          <p className="text-slate-500 text-sm">Controle financeiro inteligente</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text" required
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="João da Silva"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              type="email" required
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="joao@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password" required
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
              <input
                type="password" required
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={formData.password_confirmation}
                onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center mt-2 disabled:opacity-70 shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Entrar na Conta' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {isLogin ? "Ainda não faz parte? " : "Já possui uma conta? "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
          >
            {isLogin ? 'Cadastre-se grátis' : 'Entrar agora'}
          </button>
        </div>
      </div>
    </div>
  );
}
