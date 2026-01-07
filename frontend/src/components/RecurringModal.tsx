import React, { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  recurringToEdit?: any;
}

type TransactionType = 'INCOME' | 'EXPENSE';

interface Category {
  id: number;
  name: string;
  type: TransactionType;
}

export const RecurringModal = ({ isOpen, onClose, onSave, recurringToEdit }: RecurringModalProps) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch categories
      api.get('/categories')
        .then(res => setCategories(res.data))
        .catch(err => console.error("Erro ao buscar categorias:", err));

      if (recurringToEdit) {
        setType(recurringToEdit.type);
        setDescription(recurringToEdit.description);
        setAmount(recurringToEdit.amount);
        setCategoryId(recurringToEdit.category?.id || '');
        setDueDay(recurringToEdit.dueDay);
      } else {
        setType('EXPENSE');
        setDescription('');
        setAmount('');
        setCategoryId('');
        setDueDay('');
      }
    }
  }, [isOpen, recurringToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        description,
        amount: parseFloat(amount),
        type,
        category: categoryId ? { id: parseInt(categoryId) } : null,
        dueDay: parseInt(dueDay),
        frequency: 'MONTHLY'
      };

      if (recurringToEdit) {
        await api.put(`/recurring/${recurringToEdit.id}`, payload);
        toast.success("Recorrente atualizada!");
      } else {
        await api.post('/recurring', payload);
        toast.success("Recorrente criada!");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar recorrente:", error);
      toast.error("Erro ao salvar recorrente.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {recurringToEdit ? 'Editar Recorrente' : 'Nova Recorrente'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setType('INCOME'); setCategoryId(''); }}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all",
                  type === 'INCOME' 
                    ? "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                <ArrowUpCircle size={18} className={type === 'INCOME' ? "text-green-600" : "text-gray-400"} />
                <span className="font-medium text-sm">Entrada</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all",
                  type === 'EXPENSE' 
                    ? "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                <ArrowDownCircle size={18} className={type === 'EXPENSE' ? "text-red-600" : "text-gray-400"} />
                <span className="font-medium text-sm">Saída</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Valor</label>
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

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Descrição</label>
              <input
                type="text"
                required
                placeholder="Ex: Aluguel, Netflix..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoria</label>
                <select
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Sem Categoria</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Dia do Vencimento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  placeholder="1-31"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
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
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
