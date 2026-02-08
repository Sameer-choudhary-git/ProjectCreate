import { useEffect, useRef, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { FileItem } from '../types/files';
import { Loader2, RefreshCw, ExternalLink, Terminal } from 'lucide-react';

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
    if (!webContainer || files.length === 0) return;

    const startDevServer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Install Dependencies
        console.log('📦 Installing dependencies...');
        const installProcess = await webContainer.spawn('npm', ['install']);
        
        installProcess.output.pipeTo(new WritableStream({
          write(data) { console.log('[INSTALL]:', data); }
        }));

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error('npm install failed');
        }

        // 2. Set up listener BEFORE starting server (Critical Fix)
        webContainer.on('server-ready', (port, url) => {
          console.log(`✅ Server ready on port ${port} at ${url}`);
          setUrl(url);
          setIsLoading(false);
        });

        // 3. Start Dev Server
        console.log('🚀 Starting dev server...');
        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);

        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('[DEV SERVER]:', data);
            if (data.includes('Error') || data.includes('failed')) {
               // Optional: specific error parsing
            }
          }
        }));

      } catch (err: any) {
        console.error('Preview error:', err);
        setError(err.message || 'Failed to start preview');
        setIsLoading(false);
      }
    };

    startDevServer();
  }, [webContainer, files]);

  const handleRefresh = () => {
    if (iframeRef.current && url) {
      iframeRef.current.src = url;
    }
  };

  const handleOpenExternal = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // --- LOADING STATE (Dark Theme) ---
  if (!webContainer || isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0d1117] text-[#c9d1d9]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#1f6feb] animate-spin mx-auto mb-4" />
          <p className="text-[#c9d1d9] font-medium">Starting development server...</p>
          <p className="text-[#8b949e] text-sm mt-2">Installing dependencies & building...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE (Dark Theme) ---
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0d1117]">
        <div className="text-center max-w-md p-6 bg-[#161b22] border border-[#30363d] rounded-xl">
          <div className="w-12 h-12 bg-[#da3633]/10 text-[#f85149] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#da3633]/20">
            <Terminal className="w-6 h-6" />
          </div>
          <p className="text-[#f85149] font-medium mb-2">Preview Error</p>
          <p className="text-[#8b949e] text-sm font-mono bg-[#0d1117] p-3 rounded-lg border border-[#30363d] break-all">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // --- SUCCESS STATE (Dark Theme) ---
  return (
    <div className="h-full flex flex-col bg-[#ffffff]"> {/* White background for the actual preview content usually looks better, or keep dark if you prefer */}
      
      {/* Address Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2 text-sm text-[#8b949e] flex-1 mr-4">
          <div className="w-2.5 h-2.5 bg-[#238636] rounded-full animate-pulse shadow-[0_0_8px_rgba(35,134,54,0.4)]" />
          <div className="bg-[#0d1117] px-3 py-1.5 rounded-md border border-[#30363d] flex-1 font-mono text-xs text-[#c9d1d9] truncate">
            {url}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-[#21262d] text-[#c9d1d9] rounded-md transition-colors border border-transparent hover:border-[#30363d]"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-1.5 hover:bg-[#21262d] text-[#c9d1d9] rounded-md transition-colors border border-transparent hover:border-[#30363d]"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 bg-white relative"> 
        {/* Note: Kept bg-white here because most generated apps assume a light background by default. 
            If your apps are dark mode, you can change this to bg-[#0d1117] */}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}