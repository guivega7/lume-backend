import React, { useEffect, useState } from 'react';
import { PluggyConnect } from 'react-pluggy-connect';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export const ConnectBankButton = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Busca o token assim que o componente monta (ou quando o usuário clica para abrir, para economizar)
    // Aqui vou buscar ao montar para simplificar, mas idealmente buscaria ao clicar.
    const fetchToken = async () => {
      try {
        const response = await api.get('/pluggy/token');
        setAccessToken(response.data.accessToken);
      } catch (error) {
        console.error("Erro ao obter token da Pluggy:", error);
        toast.error("Erro ao conectar com o serviço bancário.");
      }
    };

    fetchToken();
  }, []);

  const handleSuccess = async (itemData: { item: { id: string } }) => {
    try {
      toast.info("Conexão realizada! Sincronizando transações...");
      
      // O itemData contém o ID do item (conexão). 
      // A Pluggy retorna 'item.id'. O backend espera 'accountId' (que na verdade é o itemId da conexão para buscar todas as contas).
      // Ajuste conforme a lógica do seu backend (se ele busca por Item ID ou Account ID específico).
      // Geralmente, sincronizamos pelo Item ID para pegar todas as contas daquele banco.
      
      await api.post('/pluggy/sync', {
        accountId: itemData.item.id 
      });

      toast.success("Transações sincronizadas com sucesso!");
      // Aqui você pode recarregar a lista de transações ou contas
      window.location.reload(); 
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      toast.error("Erro ao sincronizar transações.");
    }
  };

  const handleError = (error: any) => {
    console.error("Erro no Pluggy Connect:", error);
    toast.error("Erro na conexão bancária.");
  };

  if (!accessToken) {
    return (
      <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
        <Plus size={18} />
        Carregando...
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
      >
        <Plus size={18} />
        Conectar Banco
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden h-[600px]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              ✕
            </button>
            <PluggyConnect
              connectToken={accessToken}
              includeSandbox={true} // Remover em produção se não quiser bancos de teste
              onSuccess={handleSuccess}
              onError={handleError}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
