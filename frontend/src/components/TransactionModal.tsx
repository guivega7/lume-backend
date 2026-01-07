import React, { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useDemoMode } from '@/hooks/useDemoMode';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  transactionToEdit?: any;
}

type TransactionType = 'INCOME' | 'EXPENSE';

interface Account {
  id: number;
  name: string;
}

interface CreditCard {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  type: TransactionType;
}

export const TransactionModal = ({ isOpen, onClose, onSave, transactionToEdit }: TransactionModalProps) => {
  const { isDemo } = useDemoMode();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  
  // sourceId format: "account-1" or "card-1"
  const [sourceId, setSourceId] = useState('');
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Fetch accounts
      api.get('/accounts')
        .then(res => {
          setAccounts(res.data);
          // Set default if creating new and no source selected yet
          if (!transactionToEdit && res.data.length > 0 && !sourceId) {
             setSourceId(`account-${res.data[0].id}`);
          }
        })
        .catch(err => console.error("Erro ao buscar contas:", err));

      // Fetch credit cards
      api.get('/credit-cards')
        .then(res => setCreditCards(res.data))
        .catch(err => console.error("Erro ao buscar cartões:", err));

      // Fetch categories
      api.get('/categories')
        .then(res => setCategories(res.data))
        .catch(err => console.error("Erro ao buscar categorias:", err));

      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setDescription(transactionToEdit.description);
        setAmount(transactionToEdit.amount);
        setCategoryId(transactionToEdit.category?.id || '');
        setDate(transactionToEdit.date);
        
        if (transactionToEdit.account) {
            setSourceId(`account-${transactionToEdit.account.id}`);
        } else if (transactionToEdit.creditCard) {
            setSourceId(`card-${transactionToEdit.creditCard.id}`);
        } else if (transactionToEdit.accountName && transactionToEdit.accountName.startsWith("Cartão: ")) {
             // Fallback heuristic
        }
      } else {
        setType('EXPENSE');
        setDescription('');
        setAmount('');
        setCategoryId('');
        setDate(new Date().toISOString().split('T')[0]); // Today's date
        // sourceId is set in the fetch callback
      }
    }
  }, [isOpen, transactionToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemo) {
      toast.error("Funcionalidade bloqueada no modo Demonstração.");
      return;
    }
    
    if (!sourceId) {
      toast.error("Selecione uma conta ou cartão.");
      return;
    }

    const [sourceType, idStr] = sourceId.split('-');
    const id = parseInt(idStr);

    const payload: any = {
      description,
      amount: parseFloat(amount),
      type,
      category: categoryId ? { id: parseInt(categoryId) } : null,
      date,
    };

    if (sourceType === 'account') {
        payload.account = { id };
        payload.creditCard = null;
    } else {
        payload.creditCard = { id };
        payload.account = null;
    }

    onSave(payload);
    onClose();
  };

  // Filter categories by selected type
  const filteredCategories = categories.filter(cat => cat.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {transactionToEdit ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            
            {/* Type Selection */}
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

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Descrição</label>
              <input
                type="text"
                required
                placeholder="Ex: Almoço, Salário..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Account/Card Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Conta / Cartão</label>
              <select
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              >
                <option value="" disabled>Selecione a origem</option>
                
                <optgroup label="Contas Bancárias">
                    {accounts.map(acc => (
                    <option key={`acc-${acc.id}`} value={`account-${acc.id}`}>{acc.name}</option>
                    ))}
                </optgroup>

                {type === 'EXPENSE' && creditCards.length > 0 && (
                    <optgroup label="Cartões de Crédito">
                        {creditCards.map(card => (
                        <option key={`card-${card.id}`} value={`card-${card.id}`}>{card.name}</option>
                        ))}
                    </optgroup>
                )}
              </select>
              {accounts.length === 0 && (
                <p className="text-[10px] text-red-500 mt-1">Você precisa criar uma conta primeiro.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category Selection (Dynamic) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoria</label>
                <select
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Sem Categoria</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {filteredCategories.length === 0 && (
                  <p className="text-[10px] text-gray-400 mt-1">Nenhuma categoria deste tipo.</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Data</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={accounts.length === 0 || isDemo}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDemo ? 'Bloqueado (Demo)' : 'Salvar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
