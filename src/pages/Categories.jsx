import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: null, name: '', type: 'D', color: '#ef4444' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fundsmart/category');
      const data = res.data?.data || res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/fundSmart/category/update/${form.id}`, form);
        setForm({ id: null, name: '', type: 'D', color: '#ef4444' });
        fetchCategories();
      } else {
        await api.post('/fundSmart/category/store', form);
        navigate('/movement/new');
      }
    } catch (err) {
      alert('Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.delete(`/fundSmart/category/destroy/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Erro ao excluir categoria');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
        <p className="text-slate-500">Gerencie as categorias de receitas e despesas.</p>
      </div>

      {error && <div className="text-rose-600 bg-rose-50 p-4 rounded-lg border border-rose-200">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{form.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Categoria</label>
              <input 
                type="text" required
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Alimentação"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select 
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="D">Despesa</option>
                <option value="R">Receita</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Identificação</label>
              <input 
                type="color"
                className="w-full h-10 bg-white border border-slate-300 rounded-lg p-1 cursor-pointer"
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors font-medium">
                Salvar
              </button>
              {form.id && (
                <button type="button" onClick={() => setForm({ id: null, name: '', type: 'D', color: '#ef4444' })} className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Cor</th>
                  <th className="px-6 py-4 font-semibold">Nome</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-8"><Loader2 className="animate-spin mx-auto text-emerald-600" /></td></tr>
                ) : categories.length > 0 ? categories.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-6 h-6 rounded-md shadow-sm border border-black/10" style={{ backgroundColor: c.color }}></div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                    <td className="px-6 py-4">
                      <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", c.type === 'Receita' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                        {c.type === 'Receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-3">
                      <button onClick={() => setForm({ id: c.id, name: c.name, type: c.type, color: c.color })} className="text-slate-400 hover:text-emerald-600 transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-center py-8 text-slate-500">Nenhuma categoria encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
