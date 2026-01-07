import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Pencil, 
  Calendar,
  CheckSquare,
  Square,
  X,
  Tags,
  RefreshCw,
  Utensils,
  Car,
  Home,
  Gamepad2,
  GraduationCap,
  Briefcase,
  PiggyBank,
  ShoppingBag,
  MoreHorizontal,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionModal } from '@/components/TransactionModal';
import { BulkCategoryModal } from '@/components/BulkCategoryModal';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useDemoMode } from '@/hooks/useDemoMode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Types ---

type TransactionType = 'INCOME' | 'EXPENSE';

interface Category {
  id: number;
  name: string;
  type: TransactionType;
}

interface TransactionDTO {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  accountName: string;
  category: Category | null;
}

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm p-6", className)}>
    {children}
  </div>
);

const CategoryIcon = ({ category }: { category: Category | null }) => {
  if (!category) return <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0"><Tags size={16} /></div>;

  const name = category.name.toLowerCase();
  let Icon = Tags;
  let colorClass = "bg-slate-100 text-slate-600";

  if (name.includes('aliment') || name.includes('restaurante') || name.includes('mercado')) { Icon = Utensils; colorClass = "bg-orange-100 text-orange-600"; }
  else if (name.includes('transporte') || name.includes('uber') || name.includes('combustivel')) { Icon = Car; colorClass = "bg-blue-100 text-blue-600"; }
  else if (name.includes('moradia') || name.includes('casa') || name.includes('aluguel')) { Icon = Home; colorClass = "bg-indigo-100 text-indigo-600"; }
  else if (name.includes('lazer') || name.includes('cinema') || name.includes('jogos')) { Icon = Gamepad2; colorClass = "bg-purple-100 text-purple-600"; }
  else if (name.includes('estudo') || name.includes('curso') || name.includes('livro')) { Icon = GraduationCap; colorClass = "bg-pink-100 text-pink-600"; }
  else if (name.includes('salario') || name.includes('trabalho')) { Icon = Briefcase; colorClass = "bg-green-100 text-green-600"; }
  else if (name.includes('investimento')) { Icon = PiggyBank; colorClass = "bg-emerald-100 text-emerald-600"; }
  else if (name.includes('compra') || name.includes('shopping')) { Icon = ShoppingBag; colorClass = "bg-yellow-100 text-yellow-600"; }

  return (
    <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0", colorClass)}>
      <Icon size={16} />
    </div>
  );
};

const isRecurringLike = (description: string) => {
  const keywords = ['netflix', 'spotify', 'amazon', 'youtube', 'aluguel', 'condominio', 'internet', 'vivo', 'claro', 'tim', 'gympass', 'smartfit'];
  return keywords.some(k => description.toLowerCase().includes(k));
};

export const TransactionsPage = () => {
  const { checkDemo } = useDemoMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionToEdit, setTransactionToEdit] = useState<any | undefined>(undefined);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);

  // Bulk Selection
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Fetch Categories
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Erro ao buscar categorias:", err));
  }, []);

  // Fetch Transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {
        month: selectedMonth,
        year: selectedYear
      };
      if (selectedCategoryId) params.categoryId = selectedCategoryId;

      const response = await api.get('/transactions', { params });
      setTransactions(response.data);
      setSelectedIds(new Set()); // Reset selection on fetch
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      toast.error("Erro ao carregar transações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear, selectedCategoryId]);

  // Handlers
  const handleEdit = (transaction: TransactionDTO) => {
    checkDemo(() => {
      setTransactionToEdit(transaction);
      setIsModalOpen(true);
    });
  };

  const handleCreate = () => {
    checkDemo(() => {
      setTransactionToEdit(undefined);
      setIsModalOpen(true);
    });
  };

  const handleSaveTransaction = async (newTransactionData: any) => {
    try {
      const payload = { ...newTransactionData };
      if (transactionToEdit) {
        await api.put(`/transactions/${transactionToEdit.id}`, payload);
        toast.success("Transação atualizada!");
      } else {
        await api.post('/transactions', payload);
        toast.success("Transação salva!");
      }
      fetchTransactions();
    } catch (error) {
      toast.error("Erro ao salvar transação.");
    }
  };

  const handleDelete = async (id: number) => {
    checkDemo(async () => {
      if (!confirm("Tem certeza?")) return;
      try {
        await api.delete(`/transactions/${id}`);
        setTransactions(transactions.filter(t => t.id !== id));
        toast.success("Transação excluída.");
      } catch (error) {
        toast.error("Erro ao excluir.");
      }
    });
  };

  // Bulk Handlers
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAllGroup = (ids: number[]) => {
    const newSelected = new Set(selectedIds);
    const allSelected = ids.every(id => newSelected.has(id));
    
    ids.forEach(id => {
      if (allSelected) newSelected.delete(id);
      else newSelected.add(id);
    });
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    checkDemo(async () => {
      if (!confirm(`Excluir ${selectedIds.size} transações?`)) return;
      try {
        await Promise.all(Array.from(selectedIds).map(id => api.delete(`/transactions/${id}`)));
        toast.success(`${selectedIds.size} transações excluídas.`);
        fetchTransactions();
        setIsSelectionMode(false);
      } catch (error) {
        toast.error("Erro ao excluir em massa.");
      }
    });
  };

  const handleBulkCategory = async (categoryId: number) => {
    checkDemo(async () => {
      try {
        await Promise.all(Array.from(selectedIds).map(id => {
          const tx = transactions.find(t => t.id === id);
          if (!tx) return Promise.resolve();
          const payload = {
            description: tx.description,
            amount: tx.amount,
            date: tx.date,
            type: tx.type,
            account: { id: 1 }, 
            category: { id: categoryId }
          };
          return api.put(`/transactions/${id}`, payload).catch(() => {}); 
        }));
        toast.success("Categorias atualizadas.");
        fetchTransactions();
        setIsSelectionMode(false);
      } catch (error) {
        toast.error("Erro ao atualizar categorias.");
      }
    });
  };

  // Memoized calculation
  const { groupedTransactions, summary } = useMemo(() => {
    const filtered = transactions.filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amount.toString().includes(searchTerm)
    );

    const summary = filtered.reduce((acc, tx) => {
      if (tx.type === 'INCOME') acc.income += tx.amount;
      else acc.expense += tx.amount;
      return acc;
    }, { income: 0, expense: 0 });

    const grouped = filtered.reduce((acc, tx) => {
      const date = tx.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    }, {} as Record<string, TransactionDTO[]>);

    return { groupedTransactions: grouped, summary };
  }, [transactions, searchTerm]);

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getRelativeDate = (dateStr: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const txDate = new Date(dateStr);

    if (txDate.toDateString() === today.toDateString()) return "Hoje";
    if (txDate.toDateString() === yesterday.toDateString()) return "Ontem";
    
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(txDate);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie suas entradas e saídas</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Filters */}
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer shadow-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                const monthName = new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' });
                const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                return (
                  <option key={m} value={m}>{capitalizedMonth}</option>
                );
              })}
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

           <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer shadow-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer max-w-[150px] shadow-sm"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">Todas Categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <button 
            onClick={toggleSelectionMode}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm",
              isSelectionMode 
                ? "bg-blue-50 text-blue-600 border-blue-200" 
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            )}
          >
            {isSelectionMode ? <CheckSquare size={18} /> : <Square size={18} />}
            {isSelectionMode ? 'Cancelar' : 'Selecionar'}
          </button>

          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ml-auto sm:ml-0"
          >
            <Plus size={18} />
            Nova
          </button>
        </div>
      </div>

      {/* Summary Cards (Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <ArrowUpCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entradas</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.income)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <ArrowDownCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Saídas</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.expense)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Líquido</p>
            <p className={cn("text-xl font-bold", (summary.income - summary.expense) >= 0 ? "text-blue-600" : "text-red-600")}>
              {formatCurrency(summary.income - summary.expense)}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="overflow-hidden p-0">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar transações..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List (Replaces Table) */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500">Carregando transações...</div>
          ) : Object.keys(groupedTransactions).length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">Nenhuma transação encontrada neste período.</div>
          ) : (
            Object.entries(groupedTransactions).map(([date, transactionsOnDate]) => {
              const dailyTotal = transactionsOnDate.reduce((acc, tx) => acc + (tx.type === 'INCOME' ? tx.amount : -tx.amount), 0);
              const allSelected = transactionsOnDate.every(tx => selectedIds.has(tx.id));
              
              return (
                <div key={date}>
                  {/* Group Header */}
                  <div className="bg-gray-50/50 px-4 md:px-6 py-2 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      {isSelectionMode && (
                        <button 
                          onClick={() => toggleSelectAllGroup(transactionsOnDate.map(t => t.id))}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {allSelected ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                        </button>
                      )}
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{getRelativeDate(date)}</h3>
                    </div>
                    <div className="text-xs font-medium text-gray-400">
                      Saldo: <span className={cn(dailyTotal >= 0 ? "text-gray-600" : "text-red-500")}>{formatCurrency(dailyTotal)}</span>
                    </div>
                  </div>

                  {/* Transactions List */}
                  <div>
                    {transactionsOnDate.map((transaction) => {
                      const isSelected = selectedIds.has(transaction.id);
                      return (
                        <div 
                          key={transaction.id} 
                          className={cn(
                            "p-4 transition-all group cursor-pointer hover:bg-gray-50 flex flex-col md:flex-row md:items-center gap-3 md:gap-4",
                            isSelected ? "bg-blue-50/60" : ""
                          )}
                          onClick={() => isSelectionMode && toggleSelect(transaction.id)}
                        >
                          {/* Selection Checkbox (Mobile & Desktop) */}
                          {isSelectionMode && (
                            <div className={cn("text-gray-300 transition-colors self-start md:self-center", isSelected && "text-blue-600")}>
                              {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                            </div>
                          )}

                          {/* Icon */}
                          <div className="hidden md:block">
                            <CategoryIcon category={transaction.category} />
                          </div>

                          {/* Content Container */}
                          <div className="flex-1 flex flex-col gap-2 md:gap-0 md:flex-row md:items-center md:justify-between min-w-0">
                            
                            {/* Top Row (Mobile) / Left Side (Desktop) */}
                            <div className="flex items-start justify-between md:justify-start md:items-center gap-3">
                              <div className="md:hidden">
                                <CategoryIcon category={transaction.category} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{transaction.description}</p>
                                  {isRecurringLike(transaction.description) && (
                                    <RefreshCw size={12} className="text-gray-400 flex-shrink-0" title="Recorrente" />
                                  )}
                                </div>
                                {/* Mobile Category/Account */}
                                <div className="flex md:hidden items-center gap-1.5 text-xs text-gray-500 mt-0.5 truncate">
                                  <span className="truncate">{transaction.category?.name || 'Geral'}</span>
                                  <span>•</span>
                                  <span className="truncate">{transaction.accountName}</span>
                                </div>
                              </div>

                              {/* Mobile Amount */}
                              <div className="md:hidden text-right">
                                <span className={cn(
                                  "font-bold text-sm whitespace-nowrap",
                                  transaction.type === 'INCOME' ? "text-green-600" : "text-red-600"
                                )}>
                                  {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                </span>
                              </div>
                            </div>

                            {/* Desktop Info (Hidden on Mobile) */}
                            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 w-48">
                              <span className="truncate">{transaction.category?.name || 'Geral'}</span>
                              <span>•</span>
                              <span className="truncate">{transaction.accountName}</span>
                            </div>

                            {/* Desktop Amount (Hidden on Mobile) */}
                            <div className="hidden md:block text-right w-32">
                              <span className={cn(
                                "font-bold text-sm whitespace-nowrap",
                                transaction.type === 'INCOME' ? "text-green-600" : "text-red-600"
                              )}>
                                {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                              </span>
                            </div>
                          </div>

                          {/* Actions (Desktop Only - Mobile could use long press or swipe, but keeping simple for now) */}
                          <div className="hidden md:block w-8 text-right">
                            {!isSelectionMode && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors outline-none opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal size={18} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => handleEdit(transaction)} className="cursor-pointer font-medium">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(transaction.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 font-medium">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Excluir</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          {/* Mobile Date (Bottom Right) */}
                          <div className="md:hidden flex justify-end mt-1">
                             {/* Actions for Mobile could go here, but keeping clean */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Floating Bulk Actions Bar */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white shadow-xl rounded-full px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-6 duration-300 w-[90%] md:w-auto justify-between md:justify-start">
          <span className="text-sm font-medium border-r border-gray-700 pr-6 whitespace-nowrap">
            {selectedIds.size} <span className="hidden md:inline">selecionados</span>
          </span>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors"
            >
              <Tags size={16} />
              <span className="hidden md:inline">Mudar Categoria</span>
            </button>
            
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 text-sm font-medium hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
              <span className="hidden md:inline">Excluir</span>
            </button>
          </div>

          <button 
            onClick={toggleSelectionMode}
            className="ml-2 p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Modals */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transactionToEdit={transactionToEdit}
      />

      <BulkCategoryModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSave={handleBulkCategory}
      />
    </div>
  );
};
