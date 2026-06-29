import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from '../api/client';

const TOKEN_KEY  = 'tp_jwt';
const USER_KEY   = 'tp_user';

export interface AuthUser {
  userId: string;
  phone:  string;
  name:   string;
}

interface AuthContextType {
  user:    AuthUser | null;
  loading: boolean;
  login:   (token: string, user: AuthUser, isNewUser?: boolean) => Promise<void>;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  login: async () => {}, logout: async () => {},
});

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, raw] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (token && raw) {
          if (isTokenExpired(token)) {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
          } else {
            const stored: AuthUser = JSON.parse(raw);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(stored);
          }
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (token: string, authUser: AuthUser, isNewUser?: boolean) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(authUser));
    if (isNewUser) {
      await AsyncStorage.removeItem('tp_profile_done').catch(() => {});
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{user, loading, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
