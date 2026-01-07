import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useDemoMode } from '@/hooks/useDemoMode';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  accountToEdit?: any;
}

export const AccountModal = ({ isOpen, onClose, onSave, accountToEdit }: AccountModalProps) => {
  const { isDemo } = useDemoMode();
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (accountToEdit) {
        setName(accountToEdit.name);
        setBank(accountToEdit.bank);
        setInitialBalance(accountToEdit.initialBalance);
      } else {
        setName('');
        setBank('');
        setInitialBalance('');
      }
    }
  }, [isOpen, accountToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemo) {
      toast.error("Funcionalidade bloqueada no modo Demonstração.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        bank,
        initialBalance: parseFloat(initialBalance) || 0,
        type: 'CHECKING' // Default
      };

      if (accountToEdit) {
        await api.put(`/accounts/${accountToEdit.id}`, payload);
        toast.success("Conta atualizada!");
      } else {
        await api.post('/accounts', payload);
        toast.success("Conta criada com sucesso!");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
      toast.error("Erro ao salvar conta.");
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
            {accountToEdit ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nome da Conta</label>
              <input
                type="text"
                required
                placeholder="Ex: Conta Principal, Reserva..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Instituição / Banco</label>
              <select
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              >
                <option value="" disabled>Selecione</option>
                <option value="Nubank">Nubank</option>
                <option value="Itaú">Itaú</option>
                <option value="Bradesco">Bradesco</option>
                <option value="Santander">Santander</option>
                <option value="Inter">Inter</option>
                <option value="C6 Bank">C6 Bank</option>
                <option value="Caixa">Caixa</option>
                <option value="Banco do Brasil">Banco do Brasil</option>
                <option value="Carteira">Carteira (Dinheiro Físico)</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Saldo Inicial</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">O saldo atual será calculado a partir deste valor + transações.</p>
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
              disabled={loading || isDemo}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDemo ? 'Bloqueado (Demo)' : (loading ? 'Salvando...' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
