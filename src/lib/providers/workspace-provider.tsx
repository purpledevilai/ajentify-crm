'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
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
  const [activeWorkspace, setActiveState] = useState<Workspace | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (workspaces.length === 0) {
      setActiveState(null);
      // Only clear storage if we previously had workspaces (user genuinely has none now).
      // Don't clear on initial mount when auth hasn't loaded yet.
      if (initialized.current) {
        initialized.current = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      return;
    }

    if (!initialized.current) {
      const savedId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const saved = workspaces.find((w) => w.workspace_id === savedId);
      setActiveState(saved ?? workspaces[0]);
      initialized.current = true;
      return;
    }

    // After init, only update if the current active workspace was removed
    if (activeWorkspace && !workspaces.find((w) => w.workspace_id === activeWorkspace.workspace_id)) {
      const savedId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const saved = workspaces.find((w) => w.workspace_id === savedId);
      setActiveState(saved ?? workspaces[0]);
    }
  }, [workspaces]); // eslint-disable-line react-hooks/exhaustive-deps

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
