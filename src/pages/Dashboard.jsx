import { useState, useEffect } from 'react';
import api from '../api';
import Chart from 'react-apexcharts';
import { Wallet, TrendingUp, TrendingDown, Percent, Loader2, PlayCircle, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { maskCurrency, unmaskCurrency } from '../utils/formatters';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Simulator State
  const [simForm, setSimForm] = useState({ value: '', frequency: 'mensal', months: 12 });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    fetchDashboard();
    fetchRecentMovements();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/fundSmart/dashboard/KPI');
      setData(response.data?.data || response.data);
    } catch (err) {
      console.error('Erro ao buscar KPI:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentMovements = async () => {
    try {
      const res = await api.get('/fundSmart/movement');
      const data = res.data?.data || res.data;
      const list = Array.isArray(data) ? data : [];
      setRecentMovements(list.slice(0, 5));
    } catch (err) {
      console.error('Erro ao buscar movimentações recentes:', err);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();

    const numericValue = unmaskCurrency(simForm.value);
    if (!numericValue || numericValue <= 0) return;

    setSimLoading(true);
    try {
      const res = await api.post('/fundSmart/simulator/calculate', {
        value: numericValue, // Envia o número sem o "R$" (ex: 150.00)
        frequency: simForm.frequency,
        months: Number(simForm.months),
      });
      setSimResult(res.data?.data || res.data);
    } catch (err) {
      console.error('Erro no simulador:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(val || 0));
  };

  if (loading) {
    return (
      <div className="flex h-64 justify-center items-center">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  if (!data) return <div className="text-slate-500 text-center">Nenhum dado encontrado.</div>;

  const balance = data.calc || 0;
  const income = data.recipe || 0;
  const expense = data.expense || 0;
  const savingCap = data.savePorcent || 0;
  
  const categoriesList = Array.isArray(data.movements) ? data.movements : [];

  const columnOptions = {
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: true } },
    colors: categoriesList.map(c => c.category_color || '#94a3b8'),
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: categoriesList.map(c => c.category_name),
      labels: { style: { colors: '#64748b', fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { formatter: val => `R$ ${val.toFixed(0)}`, style: { colors: '#64748b' } }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    tooltip: { y: { formatter: val => `R$ ${val.toFixed(2)}` } },
  };

  const columnSeries = [{ name: 'Total', data: categoriesList.map(c => Number(c.total_amount)) }];

  const simChartOptions = {
    chart: { type: 'area', background: 'transparent', toolbar: { show: false } },
    colors: ['#10b981'],
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { enabled: false }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
        <p className="text-slate-500">Acompanhe seu desempenho financeiro atual.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Saldo Atual" value={balance} icon={Wallet} variant={balance >= 0 ? 'success' : 'danger'} />
        <KpiCard title="Receitas (Mês)" value={income} icon={TrendingUp} variant="success" />
        <KpiCard title="Despesas (Mês)" value={expense} icon={TrendingDown} variant="danger" />

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-slate-500">Porcentagem Poupada</h3>
            <div className={clsx("p-2 rounded-lg", Number(savingCap) >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
              <Percent size={20} />
            </div>
          </div>
          <p className={clsx("text-2xl font-bold mt-4", Number(savingCap) >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {Number(savingCap).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Bar / Categorias */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Despesas por Categoria</h3>
          {categoriesList.length > 0 ? (
            <Chart options={columnOptions} series={columnSeries} type="bar" height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">Sem despesas registradas</div>
          )}
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Atividades Recentes</h3>
          <div className="space-y-4">
            {recentMovements.length > 0 ? recentMovements.map(mov => (
              <div key={mov.id} className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${(mov.type === 'Receita' || mov.type === 'R') ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{mov.description}</p>
                    <p className="text-xs text-slate-500">{mov.category?.name || 'Sem Categoria'}</p>
                  </div>
                </div>
                <div className={clsx("text-sm font-bold", (mov.type === 'Receita' || mov.type === 'R') ? "text-emerald-600" : "text-rose-600")}>
                  {(mov.type === 'Receita' || mov.type === 'R') ? '+' : '-'} {mov.value}
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500">Nenhuma movimentação recente.</p>
            )}
          </div>
        </div>

        {/* Simulador Inline Widget */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Simulador Rápido</h3>
            <p className="text-slate-500 text-xs mb-4">E se você guardar e investir esse valor?</p>
            
            <form onSubmit={handleSimulate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Valor do Aporte</label>
                <input 
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="R$ 0,00"
                  value={simForm.value}
                  onChange={(e) => setSimForm({ ...simForm, value: maskCurrency(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Frequência</label>
                  <select
                    value={simForm.frequency}
                    onChange={e => setSimForm({ ...simForm, frequency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="diario">Diário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Meses</label>
                  <input 
                    type="number" min="1" max="600" required
                    placeholder="12"
                    value={simForm.months}
                    onChange={e => setSimForm({ ...simForm, months: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={simLoading} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 text-sm mt-2"
              >
                {simLoading ? <Loader2 className="animate-spin" size={18} /> : <><PlayCircle size={18} /> Simular Rendimento</>}
              </button>
            </form>

            {/* Resultado da API */}
            {simResult && (
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                
                {/* Total Acumulado com Juros */}
                <div>
                  <span className="text-xs text-slate-500 block">Total Estimado em {simResult.projection_months} meses:</span>
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {formatCurrency(simResult.total_invested)}
                  </span>
                </div>

                {/* Detalhes (Do Bolso vs Juros) */}
                <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Investido do bolso:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(simResult.total_raw)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Rendimento em juros:</span>
                    <span className="font-bold">+{formatCurrency(simResult.interest_earned)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>Aporte mensal equivalente:</span>
                    <span className="font-medium">{formatCurrency(simResult.monthly_savings)}/mês</span>
                  </div>
                </div>

                {/* Mensagem / Insight da API */}
                {simResult.insight && (
                  <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-xs text-emerald-800">
                    <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <p>{simResult.insight}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sparkline no fundo se houver projeções em array */}
          {simResult?.projections?.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-30 pointer-events-none">
              <Chart 
                options={simChartOptions} 
                series={[{ data: simResult.projections.map(p => p.total_raw) }]} 
                type="area" 
                height={100} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, variant = 'default' }) {
  const textStyle = {
    success: "text-emerald-600",
    danger: "text-rose-600",
    default: "text-slate-800"
  };

  const formatMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 rounded-lg bg-slate-50 text-slate-600">
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <p className={clsx("text-2xl font-bold mt-4", textStyle[variant] || textStyle.default)}>
        {formatMoeda.format(Number(value || 0))}
      </p>
    </div>
  );
}