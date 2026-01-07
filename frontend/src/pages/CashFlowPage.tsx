import React, { useEffect, useState } from 'react';
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CashFlowData {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  accumulatedBalance?: number; // New field for frontend calculation
}

export const CashFlowPage = () => {
  const [data, setData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchCashFlow = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

      const response = await api.get('/reports/cash-flow', {
        params: { startDate, endDate }
      });
      
      // Calculate Accumulated Balance (Running Total)
      let runningBalance = 0;
      const processedData = response.data.map((item: CashFlowData) => {
        runningBalance += (item.totalIncome - item.totalExpense);
        return {
          ...item,
          accumulatedBalance: runningBalance
        };
      });

      setData(processedData);
    } catch (error) {
      console.error("Erro ao buscar fluxo de caixa:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlow();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const totalIncome = data.reduce((acc, item) => acc + item.totalIncome, 0);
  const totalExpense = data.reduce((acc, item) => acc + item.totalExpense, 0);
  const periodBalance = totalIncome - totalExpense;

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 shadow-lg rounded-xl min-w-[200px]">
          <p className="text-sm font-medium text-gray-500 mb-2">{formatDate(label)}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-600">{entry.name}:</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fluxo de Caixa</h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhe suas entradas e saídas diárias</p>
        </div>

        <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-md text-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-medium text-gray-900 min-w-[140px] text-center select-none">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-md text-gray-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Entradas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <TrendingDown size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Saídas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Saldo do Período</span>
          </div>
          <p className={cn("text-2xl font-bold", periodBalance >= 0 ? "text-indigo-600" : "text-red-600")}>
            {formatCurrency(periodBalance)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-semibold text-gray-800">Movimentação Diária</h3>
        </div>
        
        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-gray-400 animate-pulse">
            Carregando gráfico...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
            <p>Nenhuma movimentação neste período.</p>
          </div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#f3f4f6" vertical={false} strokeDasharray="3 3" />
                
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                  minTickGap={30}
                />
                
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(val) => `R$ ${val}`}
                  width={80}
                />
                
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f9fafb', opacity: 0.6 }}
                />
                
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 500 }}
                />
                
                <ReferenceLine y={0} stroke="#e5e7eb" />
                
                <Bar 
                  dataKey="totalIncome" 
                  name="Receitas" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20} 
                />
                
                <Bar 
                  dataKey="totalExpense" 
                  name="Despesas" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20} 
                />
                
                <Line 
                  type="monotone" 
                  dataKey="accumulatedBalance" 
                  name="Saldo Acumulado"
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
