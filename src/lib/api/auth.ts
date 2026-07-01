import { api, setAccessToken } from './client';
import type { AuthResponse, Member, MeResponse } from './types';

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await api.postNoAuth<AuthResponse>('/auth/login', {
    email,
    password,
  });
  setAccessToken(res.access_token);
  return res;
}

export async function createAccount(params: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<{ success: boolean }> {
  return api.postNoAuth('/auth/create-account', params);
}

export async function verifyCode(
  email: string,
  code: string,
): Promise<AuthResponse> {
  const res = await api.postNoAuth<AuthResponse>('/auth/verify-code', {
    email,
    code,
  });
  setAccessToken(res.access_token);
  return res;
}

export async function resendCode(
  email: string,
): Promise<{ success: boolean }> {
  return api.postNoAuth('/auth/resend-code', { email });
}

export async function googleOAuth(params: {
  code: string;
  code_verifier: string;
  redirect_uri: string;
}): Promise<AuthResponse> {
  const res = await api.postNoAuth<AuthResponse>('/auth/oauth', params);
  setAccessToken(res.access_token);
  return res;
}

export async function refreshToken(): Promise<AuthResponse | null> {
  try {
    const res = await api.postNoAuth<AuthResponse>('/auth/refresh');
    setAccessToken(res.access_token);
    return res;
  } catch {
    return null;
  }
}

export async function resetPassword(
  email: string,
): Promise<{ success: boolean }> {
  return api.postNoAuth('/auth/reset-password', { email });
}

export async function setNewPassword(params: {
  email: string;
  code: string;
  new_password: string;
}): Promise<AuthResponse> {
  const res = await api.postNoAuth<AuthResponse>(
    '/auth/set-new-password',
    params,
  );
  setAccessToken(res.access_token);
  return res;
}

export async function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>('/me');
}

export async function updateMe(params: {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}): Promise<{ member: Member }> {
  return api.put('/me', params);
}

export async function deleteAccount(): Promise<void> {
  await api.del('/me');
  setAccessToken(null);
}

export async function logout(): Promise<void> {
  try {
    await api.postNoAuth('/auth/logout');
  } catch {
    // Even if the server call fails, clear the local token
  }
  setAccessToken(null);
}
