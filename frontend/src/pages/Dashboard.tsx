import React from 'react';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Receita Mensal</h3>
          <p className="text-2xl font-bold text-gray-900">R$ 12.450,00</p>
          <span className="text-green-600 text-sm font-medium mt-2 inline-block">+12% vs mês anterior</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Despesas Mensais</h3>
          <p className="text-2xl font-bold text-gray-900">R$ 4.200,00</p>
          <span className="text-red-600 text-sm font-medium mt-2 inline-block">+5% vs mês anterior</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Saldo Atual</h3>
          <p className="text-2xl font-bold text-gray-900">R$ 8.250,00</p>
          <span className="text-gray-500 text-sm font-medium mt-2 inline-block">Disponível em contas</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px] p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h2>
        <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
          Gráfico de Receitas vs Despesas
        </div>
      </div>
    </div>
  );
};
