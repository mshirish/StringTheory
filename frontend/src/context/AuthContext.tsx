import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ME_QUERY } from '../graphql/queries';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/mutations';
import { client } from '../lib/apollo';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const { loading } = useQuery(ME_QUERY, {
    skip: !localStorage.getItem('accessToken'),
    onCompleted: (data) => setUser(data.me),
    onError: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const login = async (email: string, password: string) => {
    const { data } = await loginMutation({ variables: { input: { email, password } } });
    localStorage.setItem('accessToken', data.login.accessToken);
    localStorage.setItem('refreshToken', data.login.refreshToken);
    setUser(data.login.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const { data } = await registerMutation({
      variables: { input: { username, email, password } },
    });
    localStorage.setItem('accessToken', data.register.accessToken);
    localStorage.setItem('refreshToken', data.register.refreshToken);
    setUser(data.register.user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    client.clearStore();
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
