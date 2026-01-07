import React, { useEffect, useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ChevronLeft, ChevronRight, PieChart as PieChartIcon } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface CategoryReport {
  categoryName: string;
  totalValue: number;
  percentage: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export const ReportsPage = () => {
  const [data, setData] = useState<CategoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/expenses-by-category', {
        params: { 
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
      });
      setData(response.data);
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
      toast.error("Erro ao carregar relatório.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const totalExpenses = data.reduce((acc, item) => acc + item.totalValue, 0);

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
          <p className="text-sm font-semibold text-gray-900">{item.categoryName}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(item.totalValue)} ({item.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Despesas</h1>
          <p className="text-sm text-gray-500 mt-1">Veja para onde seu dinheiro está indo</p>
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

      {loading ? (
        <div className="text-center py-20 text-gray-500">Carregando relatório...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <PieChartIcon className="text-gray-400" size={24} />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">Sem dados para este mês</h3>
          <p className="text-gray-500 text-sm">Nenhuma despesa registrada no período selecionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart Column */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center relative min-h-[400px]">
            <h3 className="text-lg font-semibold text-gray-800 w-full mb-4">Distribuição</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="totalValue"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-4">
                <p className="text-sm text-gray-500 font-medium">Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </div>

          {/* List Column */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Detalhamento</h3>
            <div className="space-y-5">
              {data.map((item, index) => (
                <div key={item.categoryName}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-gray-700">{item.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-900 font-semibold block">
                        {formatCurrency(item.totalValue)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length] 
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
