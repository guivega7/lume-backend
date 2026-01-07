import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface BulkCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryId: number) => void;
}

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export const BulkCategoryModal = ({ isOpen, onClose, onSave }: BulkCategoryModalProps) => {
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/categories')
        .then(res => setCategories(res.data))
        .catch(err => console.error("Erro ao buscar categorias:", err));
      setCategoryId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Selecione uma categoria.");
      return;
    }
    onSave(parseInt(categoryId));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Mudar Categoria em Massa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nova Categoria</label>
            <select
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="" disabled>Selecione...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.type === 'INCOME' ? 'Receita' : 'Despesa'})</option>
              ))}
            </select>
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
