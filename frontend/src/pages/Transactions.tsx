import React from 'react';

export const Transactions = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[500px] p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Transações</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Nova Transação
        </button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Descrição</th>
              <th className="px-6 py-3">Categoria</th>
              <th className="px-6 py-3">Conta</th>
              <th className="px-6 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 text-gray-500">12 Mar 2024</td>
              <td className="px-6 py-4 font-medium text-gray-900">Supermercado Extra</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Alimentação</span></td>
              <td className="px-6 py-4 text-gray-500">Nubank</td>
              <td className="px-6 py-4 text-right text-red-600 font-medium">- R$ 450,00</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 text-gray-500">10 Mar 2024</td>
              <td className="px-6 py-4 font-medium text-gray-900">Salário Mensal</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Salário</span></td>
              <td className="px-6 py-4 text-gray-500">Itaú</td>
              <td className="px-6 py-4 text-right text-green-600 font-medium">+ R$ 8.500,00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
