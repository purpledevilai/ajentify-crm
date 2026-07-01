import { api } from './client';

export async function rpc<T>(
  method: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return api.post<T>(`/rpc/${method}`, params);
}

/**
 * Workspace-scoped RPC call — automatically injects workspace_id into params.
 */
export async function wsRpc<T>(
  method: string,
  workspaceId: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return api.post<T>(`/rpc/${method}`, { workspace_id: workspaceId, ...params });
}
