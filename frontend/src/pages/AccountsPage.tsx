import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Wallet, Building2, MoreHorizontal, Pencil } from 'lucide-react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { AccountModal } from '@/components/AccountModal';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Account {
  id: number;
  name: string;
  bank: string;
  initialBalance: number;
  currentBalance: number;
}

export const AccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | undefined>(undefined);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      toast.error("Erro ao carregar contas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = (account: Account) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setAccountToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza? Todas as transações vinculadas a esta conta serão excluídas permanentemente.")) return;
    try {
      await api.delete(`/accounts/${id}`);
      setAccounts(accounts.filter(acc => acc.id !== id));
      toast.success("Conta excluída com sucesso.");
    } catch (error: any) {
      console.error("Erro ao excluir conta:", error);
      if (error.response?.status === 409) {
        toast.error("Erro de conflito: Existem registros vinculados que impedem a exclusão.");
      } else if (error.response?.data?.message) {
        toast.error(`Erro: ${error.response.data.message}`);
      } else {
        toast.error("Erro ao excluir conta. Tente novamente.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Contas</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie seus saldos e instituições</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nova Conta
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando contas...</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wallet className="text-gray-400" size={24} />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">Nenhuma conta cadastrada</h3>
          <p className="text-gray-500 text-sm mb-4">Adicione suas contas bancárias para controlar o saldo.</p>
          <button 
            onClick={handleCreate}
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Cadastrar primeira conta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-xs text-gray-500">{account.bank}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors outline-none">
                      <MoreHorizontal size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(account)} className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(account.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Saldo Atual</p>
                <p className={cn(
                  "text-2xl font-bold",
                  account.currentBalance >= 0 ? "text-gray-900" : "text-red-600"
                )}>
                  R$ {account.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchAccounts} 
        accountToEdit={accountToEdit}
      />
    </div>
  );
};
