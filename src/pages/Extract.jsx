import { maskCurrency, unmaskCurrency } from '../utils/formatters';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Loader2, Search, Filter, Trash2, Eye, Calendar, Tag, Pencil } from 'lucide-react';
import clsx from 'clsx';

export default function Extract() {
  const [movements, setMovements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    description: '',
    category_id: '',
    min_value: '',
    max_value: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchMovements = async (appliedFilters = filters) => {
    try {
      setLoading(true);

      const formattedFilters = { ...appliedFilters };
      
      if (formattedFilters.min_value) {
        formattedFilters.min_value = unmaskCurrency(formattedFilters.min_value);
      }
      if (formattedFilters.max_value) {
        formattedFilters.max_value = unmaskCurrency(formattedFilters.max_value);
      }

      const params = Object.fromEntries(
        Object.entries(formattedFilters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );

      const res = await api.get('/fundSmart/movement', { params });
      const data = res.data?.data || res.data;
      setMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar o extrato.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchMovements(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { 
      description: '', 
      category_id: '', 
      min_value: '', 
      max_value: '', 
      start_date: '', 
      end_date: '' 
    };
    setFilters(emptyFilters);
    fetchMovements(emptyFilters);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir esta movimentação?')) return;
    try {
      await api.delete(`/fundSmart/movement/destroy/${id}`);
      fetchMovements(); 
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Extrato</h1>
        <p className="text-slate-500">Consulte todo o seu histórico financeiro.</p>
      </div>

      {error && <div className="text-rose-600 bg-rose-50 p-4 rounded-lg border border-rose-200">{error}</div>}

      {/* Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-700 font-medium">
          <Filter size={18} /> Filtros de Busca
        </div>
        
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          
          {/* Descrição */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Descrição
            </label>
            <input
              type="text" 
              placeholder="Buscar por descrição..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={filters.description}
              onChange={e => setFilters({ ...filters, description: e.target.value })}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Categoria
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={filters.category_id}
              onChange={e => setFilters({ ...filters, category_id: e.target.value })}
            >
              <option value="">Todas</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Valor Mínimo */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Valor Min.
            </label>
            <input
              type="text" 
              inputMode="numeric"
              placeholder="R$ 0,00"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={filters.min_value}
              onChange={e => setFilters({ ...filters, min_value: maskCurrency(e.target.value) })}
            />
          </div>

          {/* Valor Máximo */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Valor Máx.
            </label>
            <input
              type="text" 
              inputMode="numeric"
              placeholder="R$ 0,00"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={filters.max_value}
              onChange={e => setFilters({ ...filters, max_value: maskCurrency(e.target.value) })}
            />
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Data Início
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={filters.start_date}
              onChange={e => setFilters({ ...filters, start_date: e.target.value })}
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={filters.end_date}
              onChange={e => setFilters({ ...filters, end_date: e.target.value })}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 lg:col-span-7 justify-end items-end pt-2">
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center text-sm font-medium transition-colors"
            >
              <Search size={16} className="mr-1.5" /> Buscar
            </button>
            <button 
              type="button" 
              onClick={clearFilters} 
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Limpar
            </button>
          </div>

        </form>
      </div>

      {/* Cards Section */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : movements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movements.map((m) => {
            const isRevenue = m.type === 'Receita' || m.type === 'R';
            const valueApi = m.value;
            // const formattedValue = Number(m.value || 0).toLocaleString('pt-BR', {
            //   style: 'currency',
            //   currency: 'BRL'
            // });

            return (
              <div 
                key={m.id} 
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Topo do card: Categoria e Ações */}
                  <div className="flex justify-between items-start gap-2">
                    {m.category ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: m.category.color || '#cbd5e1' }}
                        ></span>
                        {m.category.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-400">
                        Sem Categoria
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/fundsmart/movement/show/${m.id}`} 
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Visualizar detalhes"
                      >
                        <Eye size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(m.id)} 
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                      <Link 
                        to={`/fundsmart/movement/edit/${m.id}`} 
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                    </div>
                  </div>

                  {/* Título/Descrição do Lançamento */}
                  <h3 className="mt-3 font-semibold text-slate-900 text-base line-clamp-2">
                    <Link 
                      to={`/fundsmart/movement/show/${m.id}`} 
                      className="hover:text-emerald-600 transition-colors"
                    >
                      {m.description}
                    </Link>
                  </h3>
                </div>

                {/* Rodapé do card: Data e Valor */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={14} />
                    <span>{(m.payment_date || '').split(' ')[0]}</span>
                  </div>
                  <span className={clsx("font-bold text-base", isRevenue ? "text-emerald-600" : "text-rose-600")}>
                    {valueApi} 
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 shadow-sm">
          Nenhum registro encontrado para este filtro.
        </div>
      )}
    </div>
  );
}