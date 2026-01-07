import React, { useEffect, useState } from 'react';
import { Plus, Target, AlertCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { BudgetModal } from '@/components/BudgetModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BudgetProgress {
  id: number;
  categoryName: string;
  categoryId: number;
  limitAmount: number;
  spentAmount: number;
  percentage: number;
}

export const BudgetsPage = () => {
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetProgress | undefined>(undefined);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budgets');
      setBudgets(response.data);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
      toast.error("Erro ao carregar metas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleEdit = (budget: BudgetProgress) => {
    setBudgetToEdit(budget);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setBudgetToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets(budgets.filter(b => b.id !== id));
      toast.success("Meta excluída.");
    } catch (error) {
      toast.error("Erro ao excluir meta.");
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 85) return 'bg-orange-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 85) return 'text-orange-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metas de Gastos</h1>
          <p className="text-sm text-gray-500 mt-1">Defina limites e controle seu orçamento mensal</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nova Meta
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="text-gray-400" size={24} />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">Nenhuma meta definida</h3>
          <p className="text-gray-500 text-sm mb-4">Crie metas para categorias como Alimentação ou Lazer.</p>
          <button 
            onClick={handleCreate}
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Definir primeira meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900">{budget.categoryName}</h3>
                
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-full bg-gray-100", getTextColor(budget.percentage))}>
                    {budget.percentage.toFixed(0)}%
                  </span>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors outline-none">
                        <MoreHorizontal size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(budget)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(budget.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">Gasto: <span className="font-medium text-gray-900">{formatCurrency(budget.spentAmount)}</span></span>
                <span className="text-gray-500">Limite: <span className="font-medium text-gray-900">{formatCurrency(budget.limitAmount)}</span></span>
              </div>

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", getProgressColor(budget.percentage))}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                ></div>
              </div>

              {budget.percentage >= 100 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-red-600 font-medium">
                  <AlertCircle size={14} />
                  Limite excedido!
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchBudgets}
        budgetToEdit={budgetToEdit}
      />
    </div>
  );
};
