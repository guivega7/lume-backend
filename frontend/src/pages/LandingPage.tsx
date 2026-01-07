import React, { useContext } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { Sparkles, ArrowRight, BarChart3, Repeat, Landmark, CheckCircle2, Star, ChevronDown, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const LandingPage = () => {
  const { isAuthenticated, signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  // Se já estiver logado, redireciona para o dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleDemoLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signIn({ 
        email: 'demo@lume.app', 
        password: 'demo123' 
      });
      toast.success("Bem-vindo à demonstração do Lume!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Erro no login de demo:", error);
      toast.error("Erro ao acessar a demonstração. Tente criar uma conta.");
    }
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">Lume</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Planos</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="hidden sm:block text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Entrar
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              Criar Conta Grátis
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Novo: Gestão de Patrimônio
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-gray-900">
              Ilumine sua <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                vida financeira.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
              O controle total das suas finanças, patrimônio e metas em um único lugar. 
              Simples, rápido e inteligente. Abandone as planilhas hoje mesmo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/register" 
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full text-base font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Começar Agora
                <ArrowRight size={18} />
              </Link>
              <button 
                onClick={handleDemoLogin}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-full text-base font-semibold transition-all flex items-center justify-center"
              >
                Ver Demonstração
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 pt-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p>Junte-se a +50 usuários</p>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50"></div>
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Mockup de Dashboard */}
              <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-white px-3 py-1 rounded-md text-xs text-gray-400 flex-1 text-center">lume.app/dashboard</div>
              </div>
              <div className="p-6 space-y-6 bg-white">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-500">Saldo Total</p>
                    <p className="text-3xl font-bold text-gray-900">R$ 12.450,00</p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">+12%</div>
                </div>
                <div className="h-32 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-blue-100 flex items-end justify-between p-4 gap-2">
                  {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                    <div key={i} className="w-full bg-blue-500 rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <ArrowRight size={14} className="-rotate-45" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Salário Mensal</p>
                        <p className="text-xs text-gray-500">Hoje, 09:00</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-bold text-sm">+ R$ 8.500,00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <ArrowRight size={14} className="rotate-45" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Netflix</p>
                        <p className="text-xs text-gray-500">Ontem, 20:00</p>
                      </div>
                    </div>
                    <span className="text-red-600 font-bold text-sm">- R$ 55,90</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo que você precisa para crescer</h2>
            <p className="text-gray-600">
              Ferramentas poderosas simplificadas para o dia a dia. Sem complexidade, apenas clareza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fluxo de Caixa Visual</h3>
              <p className="text-gray-600 leading-relaxed">
                Entenda para onde seu dinheiro vai com gráficos intuitivos e relatórios automáticos por categoria.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <Repeat size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contas Fixas</h3>
              <p className="text-gray-600 leading-relaxed">
                Nunca mais esqueça um boleto. Cadastre suas contas fixas e lance-as com um único clique todo mês.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <Landmark size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão de Patrimônio</h3>
              <p className="text-gray-600 leading-relaxed">
                Acompanhe a evolução dos seus bens, investimentos e veículos somados ao saldo das suas contas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Planos simples e transparentes</h2>
            <p className="text-gray-400">
              Comece grátis e evolua conforme sua necessidade. Sem contratos de fidelidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan (Trial) */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Comece Grátis</h3>
              <p className="text-gray-400 text-sm mb-6">Período de Teste</p>
              <div className="text-4xl font-bold mb-6">R$ 0<span className="text-lg text-gray-500 font-normal">/mês</span></div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 size={18} className="text-blue-500" />
                  Acesso completo por 30 dias
                </li>
                {['Controle de Receitas e Despesas', 'Até 2 Contas Bancárias', 'Relatórios Básicos', 'Acesso Mobile'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 size={18} className="text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link to="/register" className="block w-full py-3 text-center bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">
                Começar Teste de 30 Dias
              </Link>
            </div>

            {/* PRO Plan (Coming Soon) */}
            <div className="bg-gray-800 p-8 rounded-2xl border-2 border-blue-600/50 relative transform md:-translate-y-4 shadow-2xl shadow-blue-900/10 flex flex-col opacity-90">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} />
                Em Breve
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-200">Lume PRO</h3>
              <p className="text-gray-400 text-sm mb-6">Para quem quer controle total</p>
              <div className="text-4xl font-bold mb-6 text-gray-300">Em Breve</div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'Tudo do plano Gratuito', 
                  'Contas e Cartões Ilimitados', 
                  'Gestão de Patrimônio', 
                  'Metas de Gastos (Budgets)',
                  'Exportação para Excel/PDF',
                  'Suporte Prioritário'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-400">
                    <CheckCircle2 size={18} className="text-blue-900" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button disabled className="block w-full py-3 text-center bg-gray-700 text-gray-400 rounded-lg font-medium cursor-not-allowed border border-gray-600">
                Entrar na Lista de Espera
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Preciso colocar meu cartão de crédito para testar?",
                a: "Não! Você pode criar uma conta gratuita e usar o Lume por tempo ilimitado sem informar nenhum dado de pagamento."
              },
              {
                q: "Meus dados estão seguros?",
                a: "Sim. Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança do mercado. Seus dados são seus e não os vendemos para terceiros."
              },
              {
                q: "Consigo acessar pelo celular?",
                a: "Com certeza. O Lume é totalmente responsivo e funciona perfeitamente no navegador do seu smartphone, sem precisar instalar nada."
              },
              {
                q: "Posso cancelar o plano PRO a qualquer momento?",
                a: "Sim. O cancelamento é simples e pode ser feito direto no painel de configurações. Sem multas ou letras miúdas."
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown className="text-gray-400 transition-transform group-open:rotate-180" size={20} />
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <Sparkles className="text-white" size={14} fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-gray-900">Lume</span>
          </div>
          
          <p className="text-sm text-gray-500">
            © 2026 Lume Financeiro. Todos os direitos reservados.
          </p>

          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Termos</a>
            <a href="#" className="hover:text-gray-900">Privacidade</a>
            <a href="#" className="hover:text-gray-900">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
