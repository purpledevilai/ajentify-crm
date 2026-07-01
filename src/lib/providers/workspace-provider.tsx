'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './auth-provider';
import type { Workspace } from '@/lib/api/types';

interface WorkspaceContextValue {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  workspaces: Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const STORAGE_KEY = 'ajentify_active_workspace';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { workspaces } = useAuth();
  const queryClient = useQueryClient();
  const [activeWorkspace, setActiveState] = useState<Workspace | null>(null);
  const prevWorkspaceId = useRef<string | null>(null);

  useEffect(() => {
    if (workspaces.length === 0) {
      setActiveState(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return;
    }

    const savedId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const saved = workspaces.find((w) => w.workspace_id === savedId);
    setActiveState(saved ?? workspaces[0]);
  }, [workspaces]);

  useEffect(() => {
    const currentId = activeWorkspace?.workspace_id ?? null;
    if (prevWorkspaceId.current !== null && currentId !== null && prevWorkspaceId.current !== currentId) {
      queryClient.removeQueries();
    }
    prevWorkspaceId.current = currentId;
  }, [activeWorkspace, queryClient]);

  const setActiveWorkspace = useCallback((workspace: Workspace) => {
    setActiveState(workspace);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, workspace.workspace_id);
    }
  }, []);

  return (
    <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace, workspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
