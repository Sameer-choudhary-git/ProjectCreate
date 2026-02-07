import { useEffect, useRef, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { FileItem } from '../types/files';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';

interface PreviewFrameProps {
  webContainer: WebContainer | null;
  files: FileItem[];
}

export function PreviewFrame({ webContainer, files }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!webContainer) return;

    const startDevServer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if package.json exists
        const hasPackageJson = files.some(
          f => f.path === 'package.json' || f.name === 'package.json'
        );

        if (!hasPackageJson) {
          setError('No package.json found. Cannot start preview.');
          setIsLoading(false);
          return;
        }

        // Install dependencies
        console.log('📦 Installing dependencies...');
        const installProcess = await webContainer.spawn('npm', ['install']);
        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          throw new Error('npm install failed');
        }

        // Start dev server
        console.log('🚀 Starting dev server...');
        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);

        // Listen for server ready
        webContainer.on('server-ready', (port, url) => {
          console.log(`✅ Server ready on port ${port}`);
          setUrl(url);
          setIsLoading(false);
        });

        // Listen for errors
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log('[DEV SERVER]:', data);
              if (data.includes('error') || data.includes('Error')) {
                setError('Dev server encountered an error. Check console.');
              }
            },
          })
        );

        const exitCode = await devProcess.exit;
        if (exitCode !== 0) {
          throw new Error('Dev server exited unexpectedly');
        }
      } catch (err: any) {
        console.error('Preview error:', err);
        setError(err.message || 'Failed to start preview');
        setIsLoading(false);
      }
    };

    // Only start if we have files
    if (files.length > 0) {
      startDevServer();
    }
  }, [webContainer, files]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  const handleOpenExternal = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!webContainer) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Initializing WebContainer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Preview Error</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Starting preview server...</p>
          <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-mono text-xs">{url}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 bg-white">
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title="Preview"
        />
      </div>
    </div>
  );
}