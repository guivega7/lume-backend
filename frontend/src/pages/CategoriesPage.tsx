import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tags, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { api } from '@/services/api';
import { CategoryModal } from '@/components/CategoryModal';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

// Sub-componente para a tabela (evita duplicação)
const CategoryTable = ({ 
  categories, 
  onEdit, 
  onDelete 
}: { 
  categories: Category[], 
  onEdit: (c: Category) => void, 
  onDelete: (id: number) => void 
}) => {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Tags className="text-gray-400" size={24} />
        </div>
        <h3 className="text-gray-900 font-medium mb-1">Nenhuma categoria encontrada</h3>
        <p className="text-gray-500 text-sm">Cadastre novas categorias para organizar suas finanças.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
          <tr>
            <th className="px-6 py-4">Nome</th>
            <th className="px-6 py-4 text-right w-24">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50/80 transition-colors group">
              <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(category)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(category.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCategoryToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza? Se houver transações vinculadas, a exclusão falhará.")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Categoria excluída.");
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Não é possível excluir: existem transações vinculadas.");
      } else {
        toast.error("Erro ao excluir categoria.");
      }
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-sm text-gray-500 mt-1">Organize suas transações</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : (
        <Tabs defaultValue="EXPENSE" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
            <TabsTrigger value="INCOME" className="flex items-center gap-2">
              <ArrowUpCircle size={16} className="text-green-600" />
              Receitas
            </TabsTrigger>
            <TabsTrigger value="EXPENSE" className="flex items-center gap-2">
              <ArrowDownCircle size={16} className="text-red-600" />
              Despesas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="INCOME">
            <CategoryTable 
              categories={incomeCategories} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </TabsContent>
          
          <TabsContent value="EXPENSE">
            <CategoryTable 
              categories={expenseCategories} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </TabsContent>
        </Tabs>
      )}

      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchCategories}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
};
