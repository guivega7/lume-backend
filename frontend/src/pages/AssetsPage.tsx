import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Car, Home, TrendingUp, Box } from 'lucide-react';
import { api } from '@/services/api';
import { AssetModal } from '@/components/AssetModal';
import { toast } from 'sonner';

interface Asset {
  id: number;
  name: string;
  value: number;
  type: 'VEHICLE' | 'PROPERTY' | 'INVESTMENT' | 'OTHER';
}

export const AssetsPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | undefined>(undefined);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (error) {
      console.error("Erro ao buscar bens:", error);
      toast.error("Erro ao carregar patrimônio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleEdit = (asset: Asset) => {
    setAssetToEdit(asset);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setAssetToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este bem?")) return;
    try {
      await api.delete(`/assets/${id}`);
      setAssets(assets.filter(a => a.id !== id));
      toast.success("Bem excluído.");
    } catch (error) {
      toast.error("Erro ao excluir bem.");
    }
  };

  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);

  const getIcon = (type: string) => {
    switch (type) {
      case 'VEHICLE': return <Car size={24} className="text-blue-600" />;
      case 'PROPERTY': return <Home size={24} className="text-purple-600" />;
      case 'INVESTMENT': return <TrendingUp size={24} className="text-green-600" />;
      default: return <Box size={24} className="text-gray-600" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'VEHICLE': return 'Veículo';
      case 'PROPERTY': return 'Imóvel';
      case 'INVESTMENT': return 'Investimento';
      default: return 'Outro';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patrimônio</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie seus bens e investimentos</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Bem
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <p className="text-blue-100 text-sm font-medium mb-1">Total em Ativos</p>
        <h2 className="text-3xl font-bold">
          R$ {totalAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Box className="text-gray-400" size={24} />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">Nenhum bem cadastrado</h3>
          <p className="text-gray-500 text-sm mb-4">Adicione veículos, imóveis ou investimentos.</p>
          <button 
            onClick={handleCreate}
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Cadastrar primeiro bem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50`}>
                    {getIcon(asset.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                    <p className="text-xs text-gray-500">{getTypeName(asset.type)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(asset)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(asset.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Valor Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchAssets}
        assetToEdit={assetToEdit}
      />
    </div>
  );
};
