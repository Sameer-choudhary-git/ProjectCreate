import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';

interface PreviewFrameInterface {
    webContainer: WebContainer|null;  
    files: any[];
}

export const PreviewFrame = ({webContainer, files}: PreviewFrameInterface) => {
    const [url, setUrl] = useState("");
 
    async function main() {
      if (!webContainer) return;
      const installProcess = await webContainer.spawn('npm', ['install']);
 
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));
 
      await webContainer.spawn('npm', ['run', 'dev']);
 
      webContainer.on('server-ready', (port, url) => {
        console.log(url)
        console.log(port)
        setUrl(url);
      });
    }
 
    useEffect(() => {
      main()
    }, [])

    return (
      <div className="flex-1 w-full h-full bg-white">
        {!url ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Loading preview...</p>
            </div>
          </div>
        ) : (
          <iframe 
            src={url} 
            className="w-full h-full border-none"
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation"
            allow="cross-origin-isolated"
          />
        )}
      </div>
    );
}