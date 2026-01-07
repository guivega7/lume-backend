import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  budgetToEdit?: any;
}

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export const BudgetModal = ({ isOpen, onClose, onSave, budgetToEdit }: BudgetModalProps) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch categories
      api.get('/categories')
        .then(res => {
          const expenseCats = res.data.filter((c: Category) => c.type === 'EXPENSE');
          setCategories(expenseCats);
        })
        .catch(err => console.error("Erro ao buscar categorias:", err));

      if (budgetToEdit) {
        setAmount(budgetToEdit.limitAmount);
        setCategoryId(budgetToEdit.categoryId);
      } else {
        setAmount('');
        setCategoryId('');
      }
    }
  }, [isOpen, budgetToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
      };

      // The backend createOrUpdateBudget handles both cases based on category/month/year
      // But if we want to be explicit or if the backend logic changes, we can use the ID
      // For now, the existing POST endpoint is smart enough to update if exists
      await api.post('/budgets', payload);
      
      toast.success(budgetToEdit ? "Meta atualizada!" : "Meta definida com sucesso!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      toast.error("Erro ao salvar meta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {budgetToEdit ? 'Editar Meta' : 'Definir Meta de Gastos'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoria</label>
              <select
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!!budgetToEdit} // Disable category change on edit to avoid duplicates/confusion
              >
                <option value="" disabled>Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Limite Mensal</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? 'Salvando...' : 'Salvar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
