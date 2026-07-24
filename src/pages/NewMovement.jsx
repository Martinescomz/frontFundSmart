import { maskCurrency, unmaskCurrency } from '../utils/formatters';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NewMovement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' }); // type: 'success' | 'error'
  
  const [form, setForm] = useState({
    category_id: '',
    description: '',
    value: '',
    payment_date: new Date().toISOString().split('T')[0],
    type: '' // Auto-filled
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/fundsmart/category');
      const data = res.data?.data || res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Regra Crítica de UX: Ao mudar a categoria, preencher o tipo automaticamente
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const selectedCat = categories.find(c => c.id.toString() === catId);
    
    let resolvedType = '';
    if (selectedCat) {
      const t = selectedCat.type.toUpperCase();
      resolvedType = (t === 'DESPESA' || t === 'D') ? 'D' : 'R';
    }
    
    setForm({ 
      ...form, 
      category_id: catId, 
      type: resolvedType 
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Desmascara o valor para número puro antes de enviar à API
    const numericValue = unmaskCurrency(form.value);
    if (!numericValue || numericValue <= 0) {
      setStatus({ type: 'error', message: 'Informe um valor válido maior que zero.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    // Payload pronto enviando o float limpo
    const payload = {
      ...form,
      value: numericValue
    };

    try {
      await api.post('/fundSmart/movement/store', payload);
      setStatus({ type: 'success', message: 'Lançamento registrado com sucesso!' });
      setForm({ ...form, description: '', value: '', category_id: '', type: '' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Erro ao salvar. Verifique os dados.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Novo Lançamento</h1>
        <p className="text-slate-500">Registre uma nova receita ou despesa na sua conta.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {status.type === 'success' ? <CheckCircle2 className="text-emerald-600" /> : <AlertCircle className="text-rose-600" />}
          {status.message}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Categoria</label>
                <Link to="/categories" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                  + Nova Categoria
                </Link>
              </div>
              <select 
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={form.category_id}
                onChange={handleCategoryChange}
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type === 'R' ? 'Receita' : 'Despesa'})</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <input 
                type="text" required
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Conta de Luz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input 
                type="text" 
                inputMode="numeric"
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={form.value}
                onChange={e => setForm({ ...form, value: maskCurrency(e.target.value) })}
                placeholder="R$ 0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input 
                type="date" required
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={form.payment_date}
                onChange={e => setForm({ ...form, payment_date: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button 
              type="submit" 
              disabled={loading || !form.type}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Lançamento'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/extract')}
              className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Ver Extrato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}