import { createContext, useState, useEffect, type ReactNode } from 'react';
import { fetchMe } from '../api/auth';

type User = { id: number; email: string } | null;
export interface AuthContextProps {
  user: User;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMe().then(res => setUser(res.data)).catch(() => logout());
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    fetchMe().then(res => setUser(res.data));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
