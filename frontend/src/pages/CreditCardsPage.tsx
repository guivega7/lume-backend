import React, { useEffect, useState } from 'react';
import { Plus, CreditCard as CreditCardIcon, Calendar, CheckCircle2, X } from 'lucide-react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

export const CreditCardsPage = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [limitTotal, setLimitTotal] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const fetchCards = async () => {
    try {
      const response = await api.get('/credit-cards');
      setCards(response.data);
    } catch (error) {
      console.error("Erro ao buscar cartões:", error);
      toast.error("Erro ao carregar cartões.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/credit-cards', {
        name,
        lastFourDigits,
        limitTotal: parseFloat(limitTotal),
        closingDay: parseInt(closingDay),
        dueDay: parseInt(dueDay),
        color
      });
      toast.success("Cartão adicionado com sucesso!");
      setIsModalOpen(false);
      fetchCards();
      resetForm();
    } catch (error) {
      toast.error("Erro ao adicionar cartão.");
    }
  };

  const resetForm = () => {
    setName('');
    setLastFourDigits('');
    setLimitTotal('');
    setClosingDay('');
    setDueDay('');
    setColor('#3b82f6');
  };

  const isBestDayToBuy = (closingDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Lógica simples: Melhor dia é o dia seguinte ao fechamento
    let bestDay = closingDay + 1;
    if (closingDay >= 31) bestDay = 1; 

    return currentDay === bestDay;
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cartões de Crédito</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie seus limites e faturas</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Cartão
        </button>
      </div>

      {loading ? (
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

            return (
              <div key={card.id} className="group relative">
                {/* Card Visual */}
                <div 
                  className="h-48 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:-translate-y-1"
                  style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)` }}
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

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Adicionar Cartão de Crédito</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cartão</label>
                  <input
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Nubank, Visa Infinite"
                    value={name}
                    onChange={e => setName(e.target.value)}
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
                      value={lastFourDigits}
                      onChange={e => setLastFourDigits(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite Total</label>
                    <input
                      required
                      type="number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5000.00"
                      value={limitTotal}
                      onChange={e => setLimitTotal(e.target.value)}
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
                      value={closingDay}
                      onChange={e => setClosingDay(e.target.value)}
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
                      value={dueDay}
                      onChange={e => setDueDay(e.target.value)}
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
                          color === c ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
