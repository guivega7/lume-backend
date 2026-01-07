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
import { ArrowUpRight, TrendingUp, Wallet, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

// --- Types ---

interface DailyMetric {
  date: string;
  total: number;
}

interface NetWorthData {
  totalBalance: number;
  totalAssets: number;
  netWorth: number;
  percentageChange: number;
}

interface TopCategory {
  categoryName: string;
  totalAmount: number;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: { name: string } | null;
}

interface Recurring {
  id: number;
  description: string;
  amount: number;
  dueDay: number;
}

interface DashboardData {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyResult: number;
  recentTransactions: any[];
  topCategories: TopCategory[];
  dailyExpenses: DailyMetric[];
  netWorthData: NetWorthData;
  totalSpentCurrentMonth: number;
  upcomingExpenses: Recurring[];
}

interface Account {
  id: number;
  name: string;
  currentBalance: number;
}

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm p-6", className)}>
    {children}
  </div>
);

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [totalAssets, setTotalAssets] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashboardResponse, accountsResponse] = await Promise.all([
          api.get('/dashboard'),
          api.get('/accounts')
        ]);

        console.log("Dashboard Data (Raw):", dashboardResponse.data);
        setData(dashboardResponse.data);

        // Manual calculation of total balance from accounts
        const accountsData: Account[] = accountsResponse.data;
        const total = accountsData.reduce((sum, account) => sum + account.currentBalance, 0);
        setTotalAssets(total);

      } catch (error) {
        console.error("Erro ao buscar dados da dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;
  }

  // Fallback values if data is null
  const income = data?.monthlyIncome || 0;
  const expense = data?.monthlyExpense || 0;
  const result = data?.monthlyResult || 0;
  const categories = data?.topCategories || [];
  
  // Chart Data Normalization (Fix for invisible chart)
  const chartData = (data?.dailyExpenses || []).map(item => ({
    name: item.date, // XAxis key (already formatted as dd/MM by backend)
    value: item.total || 0 // Bar/Line key
  }));

  // Net Worth Logic
  // We use the backend netWorthData which sums accounts + assets correctly now
  const netWorth = data?.netWorthData?.netWorth || 0;
  const totalBalance = data?.netWorthData?.totalBalance || 0;
  const totalAssetsValue = data?.netWorthData?.totalAssets || 0;
  const netWorthChange = data?.netWorthData?.percentageChange || 0;

  // Improved logic for progress bars
  const maxFlow = Math.max(income, expense);
  const incomeBarPercentage = maxFlow > 0 ? (income / maxFlow) * 100 : 0;
  const expenseBarPercentage = maxFlow > 0 ? (expense / maxFlow) * 100 : 0;

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentValue = payload[0].value;

      return (
        <div className="bg-white p-4 border border-gray-100 shadow-lg rounded-xl min-w-[200px]">
          <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-600">Gasto:</span>
            </div>
            <span className="font-semibold text-gray-900">
              {formatCurrency(currentValue)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Ritmo de Gastos (Ocupa 2 colunas no desktop, 1 no mobile) */}
        <Card className="md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Ritmo de gastos (Últimos 30 dias)</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(expense)}
                </span>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Total do Mês
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Evolução diária das suas despesas</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <TrendingUp className="text-gray-400" size={20} />
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#f3f4f6" vertical={false} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
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
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: '#f9fafb', opacity: 0.6 }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Gasto" 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20} 
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Tendência"
                    stroke="#f97316"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                <p>Sem dados de gastos para exibir no período.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Patrimônio */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <Wallet size={16} className="text-blue-600" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Patrimônio Total</h3>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(netWorth)}
              </span>
              <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                <ArrowUpRight size={16} />
                <span className="font-medium">{netWorthChange >= 0 ? '+' : ''}{netWorthChange.toFixed(1)}%</span>
                <span className="text-gray-400 ml-1">vs mês anterior</span>
              </div>
            </div>
            
            {/* Detalhamento do Patrimônio */}
            <div className="space-y-2 pt-4 border-t border-gray-50">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Contas
                </span>
                <span className="font-medium text-gray-700">{formatCurrency(totalBalance)}</span>
              </div>
              {totalAssetsValue > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Bens/Ativos
                  </span>
                  <span className="font-medium text-gray-700">{formatCurrency(totalAssetsValue)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Resultado Parcial */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-800 font-semibold">Resultado do Mês</h3>
            <span className="text-sm text-gray-400">Visão Geral</span>
          </div>

          <div className="space-y-6">
            {/* Receita */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Receitas</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(income)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${incomeBarPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Despesa */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Despesas</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(expense)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${expenseBarPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Balanço */}
            <div className="pt-4 border-t border-gray-50 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Saldo do Mês</span>
                <span className={cn("text-xl font-bold", result >= 0 ? "text-blue-600" : "text-red-600")}>
                  {formatCurrency(result)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Principais Categorias */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-800 font-semibold">Top Categorias (Mês Passado)</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver todas</button>
          </div>

          <div className="space-y-5">
            {categories.length > 0 ? (
              categories.map((cat, index) => {
                const maxAmount = Math.max(...categories.map(c => c.totalAmount));
                const percentage = (cat.totalAmount / maxAmount) * 100;
                
                const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];
                const color = colors[index % colors.length];

                return (
                  <div key={cat.categoryName}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{cat.categoryName}</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(cat.totalAmount)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: color 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhuma despesa registrada no mês passado.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
