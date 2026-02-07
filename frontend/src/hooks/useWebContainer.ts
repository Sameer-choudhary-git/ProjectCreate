import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useRef, useCallback } from 'react';

// Singleton instance - persists across component remounts
let webContainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

async function getOrBootWebContainer(): Promise<WebContainer> {
  if (webContainerInstance) {
    return webContainerInstance;
  }

  if (bootPromise) {
    return bootPromise;
  }

  bootPromise = WebContainer.boot();

  try {
    webContainerInstance = await bootPromise;
    return webContainerInstance;
  } catch (error) {
    bootPromise = null;
    throw error;
  }
}

export interface WebContainerAPI {
  mount: (fileStructure: Record<string, any>) => Promise<void>;
  spawn: (command: string, args: string[], options?: any) => Promise<any>;
  fs: any;
  instance: WebContainer | null;
  isReady: boolean;
  error: string | null;
  
  // New methods for better preview management
  killProcess: (process: any) => Promise<void>;
  restartServer: () => Promise<string | null>;
}

export function useWebContainer() {
  const [webcontainer, setWebContainer] = useState<WebContainer | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initAttemptedRef = useRef(false);
  
  // Track server state per hook instance
  const serverProcessRef = useRef<any>(null);
  const serverUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    async function init() {
      try {
        setIsInitializing(true);
        setError(null);
        const instance = await getOrBootWebContainer();
        setWebContainer(instance);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize WebContainer';
        setError(errorMsg);
        console.error('WebContainer initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, []);

  const killProcess = useCallback(async (process: any) => {
    if (process && process.kill) {
      try {
        process.kill();
        await process.exit;
      } catch (err) {
        console.error('Error killing process:', err);
      }
    }
  }, []);

  const restartServer = useCallback(async () => {
    if (serverProcessRef.current) {
      await killProcess(serverProcessRef.current);
      serverProcessRef.current = null;
      serverUrlRef.current = null;
    }
    return null;
  }, [killProcess]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serverProcessRef.current) {
        killProcess(serverProcessRef.current);
      }
    };
  }, [killProcess]);

  const api: WebContainerAPI = {
    mount: async (fileStructure: Record<string, any>) => {
      if (!webcontainer) {
        throw new Error('WebContainer is not initialized');
      }
      return webcontainer.mount(fileStructure);
    },
    spawn: async (command: string, args: string[], options?: any) => {
      if (!webcontainer) {
        throw new Error('WebContainer is not initialized');
      }
      return webcontainer.spawn(command, args, options);
    },
    fs: webcontainer?.fs,
    instance: webcontainer,
    isReady: webcontainer !== null && !isInitializing,
    error,
    killProcess,
    restartServer,
  };

  return api;
}

export function resetWebContainer() {
  webContainerInstance = null;
  bootPromise = null;
}