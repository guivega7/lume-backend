import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useDemoMode = () => {
  const { user } = useContext(AuthContext);
  
  const isDemo = user?.email === 'demo@lume.app';

  const checkDemo = (action: () => void) => {
    if (isDemo) {
      toast.error("Esta função está bloqueada no Modo Demonstração.");
      return;
    }
    action();
  };

  return { isDemo, checkDemo };
};
