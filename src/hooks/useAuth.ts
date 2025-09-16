
'use client';

import { useAppContext } from '@/context/AppContext';

export const useAuth = () => {
  const { user, login, logout } = useAppContext();
  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
