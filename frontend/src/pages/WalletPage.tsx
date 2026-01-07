import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Wallet, Building2, MoreHorizontal, Pencil, CreditCard as CreditCardIcon, Calendar, CheckCircle2, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { AccountModal } from '@/components/AccountModal';
import { toast } from 'sonner';
import { useDemoMode } from '@/hooks/useDemoMode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Interfaces ---

interface Account {
  id: number;
  name: string;
  bank: string;
  initialBalance: number;
  currentBalance: number;
}

interface CreditCard {
  id: number;
  name: string;
  lastFourDigits: string;
  limitTotal: number;
  limitUsed: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export const WalletPage = () => {
  const { checkDemo } = useDemoMode();
  const [activeTab, setActiveTab] = useState<'accounts' | 'credit-cards'>('accounts');
  
  // --- Accounts State ---
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | undefined>(undefined);

  // --- Credit Cards State ---
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  
  // Card Form State
  const [cardName, setCardName] = useState('');
  const [cardLastFourDigits, setCardLastFourDigits] = useState('');
  const [cardLimitTotal, setCardLimitTotal] = useState('');
  const [cardClosingDay, setCardClosingDay] = useState('');
  const [cardDueDay, setCardDueDay] = useState('');
  const [cardColor, setCardColor] = useState('#3b82f6');

  // --- Fetch Data ---

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      toast.error("Erro ao carregar contas.");
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await api.get('/credit-cards');
      setCards(response.data);
    } catch (error) {
      console.error("Erro ao buscar cartões:", error);
      toast.error("Erro ao carregar cartões.");
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchCards();
  }, []);

  // --- Calculations ---

  const totalBalance = accounts.reduce((acc, account) => acc + account.currentBalance, 0);
  const totalLimitUsed = cards.reduce((acc, card) => acc + card.limitUsed, 0);
  const purchasingPower = totalBalance - totalLimitUsed;

  // --- Account Handlers ---

  const handleEditAccount = (account: Account) => {
    checkDemo(() => {
      setAccountToEdit(account);
      setIsAccountModalOpen(true);
    });
  };

  const handleCreateAccount = () => {
    checkDemo(() => {
      setAccountToEdit(undefined);
      setIsAccountModalOpen(true);
    });
  };

  const handleDeleteAccount = async (id: number) => {
    checkDemo(async () => {
      if (!confirm("Tem certeza? Todas as transações vinculadas a esta conta serão excluídas permanentemente.")) return;
      try {
        await api.delete(`/accounts/${id}`);
        setAccounts(accounts.filter(acc => acc.id !== id));
        toast.success("Conta excluída com sucesso.");
      } catch (error: any) {
        if (error.response?.status === 409) {
          toast.error("Erro de conflito: Existem registros vinculados.");
        } else {
          toast.error("Erro ao excluir conta.");
        }
      }
    });
  };

  // --- Credit Card Handlers ---

  const handleCreateCard = () => {
    checkDemo(() => {
      resetCardForm();
      setIsCardModalOpen(true);
    });
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/credit-cards', {
        name: cardName,
        lastFourDigits: cardLastFourDigits,
        limitTotal: parseFloat(cardLimitTotal),
        closingDay: parseInt(cardClosingDay),
        dueDay: parseInt(cardDueDay),
        color: cardColor
      });
      toast.success("Cartão adicionado com sucesso!");
      setIsCardModalOpen(false);
      fetchCards();
      resetCardForm();
    } catch (error) {
      toast.error("Erro ao adicionar cartão.");
    }
  };

  const resetCardForm = () => {
    setCardName('');
    setCardLastFourDigits('');
    setCardLimitTotal('');
    setCardClosingDay('');
    setCardDueDay('');
    setCardColor('#3b82f6');
  };

  // --- Helpers ---

  const isBestDayToBuy = (closingDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    let bestDay = closingDay + 1;
    if (closingDay >= 31) bestDay = 1; 
    return currentDay === bestDay;
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minha Carteira</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie suas contas e cartões em um só lugar</p>
        </div>
        
        <button 
          onClick={activeTab === 'accounts' ? handleCreateAccount : handleCreateCard}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          {activeTab === 'accounts' ? 'Nova Conta' : 'Novo Cartão'}
        </button>
      </div>

      {/* Financial Summary Card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Saldo em Contas</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalBalance)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:border-l md:border-slate-200 md:pl-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Faturas em Aberto</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalLimitUsed)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:border-l md:border-slate-200 md:pl-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Poder de Compra Real</p>
            <p className={cn("text-xl font-bold", purchasingPower >= 0 ? "text-blue-600" : "text-red-600")}>
              {formatCurrency(purchasingPower)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('accounts')}
            className={cn(
              "pb-4 text-sm font-medium transition-colors relative",
              activeTab === 'accounts' 
                ? "text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Contas e Saldos
            {activeTab === 'accounts' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('credit-cards')}
            className={cn(
              "pb-4 text-sm font-medium transition-colors relative",
              activeTab === 'credit-cards' 
                ? "text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Cartões de Crédito
            {activeTab === 'credit-cards' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {/* ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            {loadingAccounts ? (
              <div className="text-center py-12 text-gray-500">Carregando contas...</div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet className="text-gray-400" size={24} />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">Nenhuma conta cadastrada</h3>
                <p className="text-gray-500 text-sm mb-4">Adicione suas contas bancárias para controlar o saldo.</p>
                <button 
                  onClick={handleCreateAccount}
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
                          <DropdownMenuItem onClick={() => handleEditAccount(account)} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteAccount(account.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
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
                        {formatCurrency(account.currentBalance)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREDIT CARDS TAB */}
        {activeTab === 'credit-cards' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {loadingCards ? (
              <div className="text-center py-12 text-gray-500">Carregando cartões...</div>
            ) : cards.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCardIcon className="text-gray-400" size={24} />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">Nenhum cartão cadastrado</h3>
                <p className="text-gray-500 text-sm mb-4">Adicione seus cartões para controlar o limite.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => {
                  const percentage = Math.min((card.limitUsed / card.limitTotal) * 100, 100);
                  const available = card.limitTotal - card.limitUsed;
                  const isBestDay = isBestDayToBuy(card.closingDay);
                  const cardColor = card.color || '#3b82f6'; // Fallback color

                  return (
                    <div key={card.id} className="group relative">
                      {/* Card Visual */}
                      <div 
                        className="h-48 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${cardColor}, ${cardColor}dd)` }}
                      >
                        <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        
                        <div className="flex justify-between items-start relative z-10 h-full flex-col">
                          <div className="w-full flex justify-between items-center">
                            <span className="font-semibold text-lg tracking-wide">{card.name}</span>
                            <CreditCardIcon size={24} className="opacity-80" />
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs opacity-70 uppercase tracking-wider">Fatura Atual</p>
                            <p className="text-2xl font-bold">{formatCurrency(card.limitUsed)}</p>
                          </div>

                          <div className="w-full flex justify-between items-end">
                            <div className="flex gap-2 items-center">
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                              </div>
                              <span className="font-mono text-sm opacity-90">{card.lastFourDigits}</span>
                            </div>
                            <span className="text-xs opacity-70">Vence dia {card.dueDay}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info Below Card */}
                      <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Limite Utilizado</span>
                          <span className="font-medium text-gray-900">{Math.round(percentage)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500", 
                              percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-yellow-500" : "bg-green-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Disponível: <span className="font-medium text-gray-700">{formatCurrency(available)}</span></span>
                          <span>Total: {formatCurrency(card.limitTotal)}</span>
                        </div>

                        {isBestDay && (
                          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                            <CheckCircle2 size={14} />
                            Melhor dia para compra!
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                          <Calendar size={12} />
                          Fecha dia {card.closingDay}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Modal */}
      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
        onSave={fetchAccounts} 
        accountToEdit={accountToEdit}
      />

      {/* Credit Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCardModalOpen(false)}
          />
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Adicionar Cartão de Crédito</h2>
              <button 
                onClick={() => setIsCardModalOpen(false)} 
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCard}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cartão</label>
                  <input
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Nubank, Visa Infinite"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Últimos 4 dígitos</label>
                    <input
                      required
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234"
                      value={cardLastFourDigits}
                      onChange={e => setCardLastFourDigits(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite Total</label>
                    <input
                      required
                      type="number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5000.00"
                      value={cardLimitTotal}
                      onChange={e => setCardLimitTotal(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dia Fechamento</label>
                    <input
                      required
                      type="number"
                      min={1}
                      max={31}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dia"
                      value={cardClosingDay}
                      onChange={e => setCardClosingDay(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dia Vencimento</label>
                    <input
                      required
                      type="number"
                      min={1}
                      max={31}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dia"
                      value={cardDueDay}
                      onChange={e => setCardDueDay(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Cartão</label>
                  <div className="flex gap-2">
                    {['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#6366f1', '#ec4899', '#111827'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          cardColor === c ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setCardColor(c)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Salvar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
