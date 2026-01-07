import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  assetToEdit?: any;
}

export const AssetModal = ({ isOpen, onClose, onSave, assetToEdit }: AssetModalProps) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('INVESTMENT');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (assetToEdit) {
        setName(assetToEdit.name);
        setValue(assetToEdit.value);
        setType(assetToEdit.type);
      } else {
        setName('');
        setValue('');
        setType('INVESTMENT');
      }
    }
  }, [isOpen, assetToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        value: parseFloat(value),
        type
      };

      if (assetToEdit) {
        await api.put(`/assets/${assetToEdit.id}`, payload);
        toast.success("Bem atualizado!");
      } else {
        await api.post('/assets', payload);
        toast.success("Bem adicionado!");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar bem:", error);
      toast.error("Erro ao salvar bem.");
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
            {assetToEdit ? 'Editar Bem' : 'Novo Bem'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nome do Bem</label>
              <input
                type="text"
                required
                placeholder="Ex: Meu Carro, Ações Apple..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Valor Atual</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Tipo</label>
              <select
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="INVESTMENT">Investimento</option>
                <option value="VEHICLE">Veículo</option>
                <option value="PROPERTY">Imóvel</option>
                <option value="OTHER">Outro</option>
              </select>
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
