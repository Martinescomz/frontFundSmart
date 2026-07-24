import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import clsx from 'clsx';
import { Loader2, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { maskCurrency, unmaskCurrency } from '../utils/formatters';

// Formata a data vinda da API para YYYY-MM-DD
const formatDateToISO = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) return dateStr.split(' ')[0].split('T')[0];

  const parts = dateStr.split(' ')[0].split('/');
  if (parts.length === 3) {
    let [day, month, year] = parts;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
};

export default function EditMovement() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    category_id: '',
    value: '', // Guarda o valor mascarado
    payment_date: '',
    type: 'D'
  });

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);

        const [categoriesRes, movementRes] = await Promise.all([
          api.get('/fundsmart/category'),
          api.get(`/fundSmart/movement/show/${id}`)
        ]);

        const catsData = categoriesRes.data?.data || categoriesRes.data;
        setCategories(Array.isArray(catsData) ? catsData : []);

        const movData = movementRes.data?.data || movementRes.data;
        if (movData) {
          // Aplica a sua máscara do utilitário no valor que vem da API
          const initialValue = movData.value !== undefined && movData.value !== null
            ? maskCurrency(String(movData.value))
            : '';

          setFormData({
            description: movData.description || '',
            category_id: movData.category_id || '',
            value: initialValue,
            payment_date: formatDateToISO(movData.payment_date),
            type: movData.type === 'Receita' || movData.type === 'R' ? 'R' : 'D'
          });
        }
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar os dados para edição.');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [id]);

  const handleValueChange = (e) => {
    const masked = maskCurrency(e.target.value);
    setFormData({ ...formData, value: masked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      // Desfaz a máscara para enviar o número float/int para o backend
      const numericValue = Number(unmaskCurrency(formData.value));

      if (numericValue <= 0) {
        setError('O valor informado deve ser maior que zero.');
        setSubmitting(false);
        return;
      }

      const payload = {
        description: formData.description,
        category_id: Number(formData.category_id),
        value: numericValue,
        payment_date: formData.payment_date,
        type: formData.type
      };

      await api.put(`/fundSmart/movement/update/${id}`, payload);
      navigate('/extract');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao atualizar a movimentação.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
        <p className="text-slate-500 text-sm">Carregando dados do lançamento...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/extract" 
          className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Lançamento</h1>
          <p className="text-slate-500">Modifique as informações do seu registro financeiro.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-rose-600 bg-rose-50 p-4 rounded-lg border border-rose-200 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulário */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Tipo de Movimentação */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Fluxo</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'D' })}
                className={clsx(
                  "py-3 rounded-lg border font-medium text-sm transition-colors text-center",
                  formData.type === 'D'
                    ? "bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-200"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                )}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'R' })}
                className={clsx(
                  "py-3 rounded-lg border font-medium text-sm transition-colors text-center",
                  formData.type === 'R'
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-200"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                )}
              >
                Receita
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              id="description"
              required
              maxLength={255}
              placeholder="Ex: Supermercado, Salário, etc."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-1">
                Valor
              </label>
              <input
                type="text"
                id="value"
                required
                placeholder="R$ 0,00"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.value}
                onChange={handleValueChange}
              />
            </div>

            <div>
              <label htmlFor="payment_date" className="block text-sm font-medium text-slate-700 mb-1">
                Data do Pagamento
              </label>
              <input
                type="date"
                id="payment_date"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={formData.payment_date}
                onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-slate-700 mb-1">
              Categoria
            </label>
            <select
              id="category_id"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={formData.category_id}
              onChange={e => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="" disabled>Selecione uma categoria</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Link
              to="/extract"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Salvando...
                </>
              ) : (
                <>
                  <Save size={16} /> Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}