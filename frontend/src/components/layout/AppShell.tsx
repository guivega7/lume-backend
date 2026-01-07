import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  LineChart, 
  Wallet, 
  Landmark, 
  Repeat, 
  Tags, 
  FileBarChart,
  Settings,
  HelpCircle,
  Crown,
  Bell,
  User,
  Sparkles,
  Target,
  Check,
  CreditCard,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to?: string;
  onClick?: () => void;
  className?: string;
  href?: string;
  target?: string;
}

const NavItem = ({ icon: Icon, label, to, onClick, className, href, target }: NavItemProps) => {
  const location = useLocation();
  const active = to ? location.pathname === to : false;

  const content = (
    <>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full -ml-4" />
      )}
      <Icon size={20} className={cn(active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700", className)} />
      <span>{label}</span>
    </>
  );

  const baseClasses = cn(
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group cursor-pointer w-full",
    active 
      ? "bg-blue-50 text-blue-600" 
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    className
  );

  if (href) {
    return (
      <a href={href} target={target} className={baseClasses} onClick={onClick}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
};

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export const AppShell = ({ children, title = "Dashboard" }: AppShellProps) => {
  const { user, signOut } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const formatRelativeDate = (dateString: string) => {
    const relative = formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR });
    return relative.charAt(0).toUpperCase() + relative.slice(1);
  };

  const handleSignOut = () => {
    setIsMobileMenuOpen(false);
    signOut();
  };

  const handleUpgradeClick = () => {
    alert("O Plano Pro estará disponível em breve! Fique atento às novidades.");
  };

  const renderPlanBadge = () => {
    if (user?.planType === 'LIFETIME') {
      return (
        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-1">
          <Crown size={10} className="text-purple-600" fill="currentColor" />
          Administrador
        </span>
      );
    }
    if (user?.planType === 'PRO') {
      return (
        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
          Plano PRO
        </span>
      );
    }
    return <span className="text-xs text-gray-500">Plano Gratuito</span>;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-64 bg-white border-r border-gray-200 fixed h-full flex flex-col z-30 transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Lume</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <div className="mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Principal
          </div>
          <NavItem icon={LayoutDashboard} label="Dashboard" to="/" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={ArrowRightLeft} label="Transações" to="/transactions" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={LineChart} label="Fluxo de Caixa" to="/cashflow" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={Wallet} label="Minha Carteira" to="/wallet" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={Landmark} label="Patrimônio" to="/assets" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Gestão
          </div>
          <NavItem icon={Target} label="Metas de Gastos" to="/budgets" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={Repeat} label="Contas Fixas" to="/recurring" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={Tags} label="Categorias" to="/categories" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={FileBarChart} label="Relatórios" to="/reports" onClick={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700">Plano PRO</span>
            </div>
            <p className="text-xs text-blue-600/80 mb-2">Acesse recursos avançados</p>
            <button 
              onClick={handleUpgradeClick}
              className="w-full text-xs bg-blue-600 text-white py-1.5 rounded font-medium hover:bg-blue-700 transition-colors"
            >
              Fazer Upgrade
            </button>
          </div>
          
          <NavItem 
            icon={HelpCircle} 
            label="Suporte" 
            href="mailto:suportelume22@gmail.com?subject=Suporte Lume&body=Olá, preciso de ajuda com..."
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <NavItem icon={Settings} label="Configurações" to="/settings" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="pt-2 mt-2 border-t border-gray-100">
            <NavItem 
              icon={LogOut} 
              label="Sair" 
              onClick={handleSignOut} 
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[400px]">
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                    <h3 className="font-semibold text-sm text-gray-700">Notificações</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {notifications.length} novas
                    </span>
                  </div>
                  
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p>Nenhuma notificação nova</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3 group">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 leading-snug mb-1 truncate" title={notification.message}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatRelativeDate(notification.createdAt)}
                              </p>
                            </div>
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-300 hover:text-blue-600 self-start p-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                              title="Marcar como lida"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>
            
            <button className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-gray-500" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-700 leading-none">{user?.name || 'Usuário'}</p>
                <p className="text-xs mt-0.5">{renderPlanBadge()}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
