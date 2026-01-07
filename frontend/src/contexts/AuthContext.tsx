import { createContext, ReactNode, useState, useEffect } from 'react';
import { api } from '@/services/api';
import axios from 'axios';

interface User {
  email: string;
  name?: string;
  profileImage?: string;
  planType?: 'FREE' | 'PRO' | 'LIFETIME';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (data: any) => Promise<void>;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    async function loadUserFromStorage() {
      const token = localStorage.getItem('lume.token');
      
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const userResponse = await api.get('/users/me');
          const freshUser = userResponse.data;
          setUser(freshUser);
          localStorage.setItem('lume.user', JSON.stringify(freshUser));
        } catch (err) {
          console.error("Token inválido, limpando sessão:", err);
          signOut();
        }
      }
      setLoading(false);
    }
    loadUserFromStorage();
  }, []);

  async function signIn({ email, password }: any) {
    setLoading(true);
    try {
      // @ts-ignore
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const authURL = baseURL.replace(/\/api$/, '');
      
      const response = await axios.post(`${authURL}/auth/login`, {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem('lume.token', token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const userResponse = await api.get('/users/me');
      const userData = userResponse.data;
      localStorage.setItem('lume.user', JSON.stringify(userData));
      
      setUser(userData);
      
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    localStorage.removeItem('lume.token');
    localStorage.removeItem('lume.user');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }

  function updateUser(data: Partial<User>) {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('lume.user', JSON.stringify(updatedUser));
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
