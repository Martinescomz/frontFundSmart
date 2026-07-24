import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Loader2, ArrowLeft, Calendar, Tag, DollarSign, FileText } from 'lucide-react';
import clsx from 'clsx';

export default function MovementDetail() {
  const { id } = useParams(); // Captura o ID vindo da URL
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovementDetails();
  }, [id]);

  const fetchMovementDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/fundSmart/movement/show/${id}`);
      // Adapte de acordo com a resposta do seu backend (res.data.data ou res.data)
      const data = res.data?.data || res.data;
      setMovement(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar os detalhes da movimentação.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
      </div>
    );
  }

  if (error || !movement) {
    return (
      <div className="space-y-4">
        <Link to="/extract" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={16} /> Voltar para o Extrato
        </Link>
        <div className="text-rose-600 bg-rose-50 p-4 rounded-lg border border-rose-200">
          {error || 'Movimentação não encontrada.'}
        </div>
      </div>
    );
  }

  const isIncome = movement.type === 'Receita' || movement.type === 'R';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Botão de Voltar */}
      <div>
        <Link to="/extract" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={16} /> Voltar para o Extrato
        </Link>
      </div>

      {/* Cabeçalho do Detalhe */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className={clsx(
              "inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2",
              isIncome ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
            )}>
              {isIncome ? 'Receita' : 'Despesa'}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">{movement.description}</h1>
          </div>
          <div className={clsx("text-2xl font-black", isIncome ? "text-emerald-600" : "text-rose-600")}>
            {isIncome ? '+' : '-'} R$ {movement.value}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Informações detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Calendar size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Data do Pagamento</p>
              <p className="text-sm font-medium text-slate-800">
                {movement.payment_date ? movement.payment_date.split(' ')[0] : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <Tag size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Categoria</p>
              {movement.category ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 mt-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: movement.category.color || '#cbd5e1' }}></span>
                  {movement.category.name}
                </span>
              ) : (
                <p className="text-sm font-medium text-slate-800">-</p>
              )}
            </div>
          </div>

          {/* Se o seu backend retornar observação/notas */}
          {movement.observation && (
            <div className="flex items-start gap-3 text-slate-600 md:col-span-2 mt-2">
              <FileText size={20} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Observações</p>
                <p className="text-sm text-slate-700 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-150">
                  {movement.observation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}