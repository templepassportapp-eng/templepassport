import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../__mocks__/api-client';

// Build a minimal JWT with the given exp (unix seconds).
// isTokenExpired only decodes the payload — it never verifies the signature.
function makeJwt(exp: number): string {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: 'user-id-123', exp }));
  return `${header}.${payload}.fake-sig`;
}

const VALID_TOKEN   = makeJwt(Math.floor(Date.now() / 1000) + 3600); // 1 h from now
const EXPIRED_TOKEN = makeJwt(Math.floor(Date.now() / 1000) - 3600); // 1 h ago
const STORED_USER   = JSON.stringify({ userId: 'user-id-123', phone: '+919999999999', name: 'Test' });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  (api.defaults.headers.common as Record<string, string | undefined>)['Authorization'] = undefined;
});

// ── session restoration ───────────────────────────────────────────────────────

test('restores session when stored token is valid', async () => {
  (SecureStore.getItemAsync as jest.Mock)
    .mockResolvedValueOnce(VALID_TOKEN)
    .mockResolvedValueOnce(STORED_USER);

  const { result } = renderHook(() => useAuth(), { wrapper });

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.user).not.toBeNull();
  expect(result.current.user?.phone).toBe('+919999999999');
  expect(api.defaults.headers.common['Authorization']).toBe(`Bearer ${VALID_TOKEN}`);
});

test('clears session and stays logged out when stored token is expired', async () => {
  (SecureStore.getItemAsync as jest.Mock)
    .mockResolvedValueOnce(EXPIRED_TOKEN)
    .mockResolvedValueOnce(STORED_USER);

  const { result } = renderHook(() => useAuth(), { wrapper });

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.user).toBeNull();
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
  expect(api.defaults.headers.common['Authorization']).toBeUndefined();
});

test('stays logged out when no token in storage', async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

  const { result } = renderHook(() => useAuth(), { wrapper });

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.user).toBeNull();
});

// ── login ─────────────────────────────────────────────────────────────────────

test('login stores token, sets user, and sets axios header', async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));

  await act(async () => {
    await result.current.login(VALID_TOKEN, { userId: 'u1', phone: '+911234567890', name: 'Anurag' });
  });

  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('tp_jwt', VALID_TOKEN);
  expect(result.current.user?.name).toBe('Anurag');
  expect(api.defaults.headers.common['Authorization']).toBe(`Bearer ${VALID_TOKEN}`);
});

test('login with isNewUser=true removes tp_profile_done from AsyncStorage', async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));

  await act(async () => {
    await result.current.login(VALID_TOKEN, { userId: 'u1', phone: '+911234567890', name: 'New' }, true);
  });

  expect(AsyncStorage.removeItem).toHaveBeenCalledWith('tp_profile_done');
});

// ── logout ────────────────────────────────────────────────────────────────────

test('logout clears storage, removes axios header, and nulls user', async () => {
  (SecureStore.getItemAsync as jest.Mock)
    .mockResolvedValueOnce(VALID_TOKEN)
    .mockResolvedValueOnce(STORED_USER);

  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.user).not.toBeNull());

  await act(async () => {
    await result.current.logout();
  });

  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('tp_jwt');
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('tp_user');
  expect(result.current.user).toBeNull();
  expect(api.defaults.headers.common['Authorization']).toBeUndefined();
});
