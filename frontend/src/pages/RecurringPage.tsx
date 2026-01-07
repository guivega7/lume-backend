import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CalendarClock, CheckCircle2, Play } from 'lucide-react';
import { api } from '@/services/api';
import { RecurringModal } from '@/components/RecurringModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
}

interface RecurringTransaction {
  id: number;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: Category | null;
  dueDay: number;
  frequency: string;
}

export const RecurringPage = () => {
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recurringToEdit, setRecurringToEdit] = useState<RecurringTransaction | undefined>(undefined);

  const fetchRecurring = async () => {
    try {
      const response = await api.get('/recurring');
      setRecurringList(response.data);
    } catch (error) {
      console.error("Erro ao buscar contas fixas:", error);
      toast.error("Erro ao carregar contas fixas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleEdit = (item: RecurringTransaction) => {
    setRecurringToEdit(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setRecurringToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta conta fixa?")) return;
    try {
      await api.delete(`/recurring/${id}`);
      setRecurringList(recurringList.filter(r => r.id !== id));
      toast.success("Conta fixa excluída.");
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  const handleLaunchTransaction = async (id: number) => {
    try {
      // Launch for current month/year
      const now = new Date();
      await api.post(`/recurring/${id}/create-transaction`, {
        year: now.getFullYear(),
        month: now.getMonth() + 1
      });
      toast.success("Transação lançada com sucesso!");
    } catch (error) {
      console.error("Erro ao lançar transação:", error);
      toast.error("Erro ao lançar transação.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas Fixas</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie suas contas fixas mensais</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nova Conta Fixa
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : recurringList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarClock className="text-gray-400" size={24} />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">Nenhuma conta fixa</h3>
          <p className="text-gray-500 text-sm mb-4">Cadastre aluguel, assinaturas ou salário para facilitar o lançamento.</p>
          <button 
            onClick={handleCreate}
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Cadastrar primeira conta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringList.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    item.type === 'INCOME' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  )}>
                    <CalendarClock size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.description}</h3>
                    <p className="text-xs text-gray-500">{item.category?.name || 'Sem Categoria'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Valor</p>
                  <p className={cn(
                    "text-xl font-bold",
                    item.type === 'INCOME' ? "text-green-600" : "text-red-600"
                  )}>
                    R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Vence dia {item.dueDay}</p>
                </div>
                
                <button 
                  onClick={() => handleLaunchTransaction(item.id)}
                  className="flex items-center gap-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-gray-200 hover:border-blue-200"
                  title="Lançar como transação neste mês"
                >
                  <Play size={14} />
                  Lançar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RecurringModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchRecurring}
        recurringToEdit={recurringToEdit}
      />
    </div>
  );
};
