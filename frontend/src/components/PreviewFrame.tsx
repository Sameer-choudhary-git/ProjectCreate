import { useEffect, useRef, useState, useCallback } from "react";
import { FileItem } from "../types/files";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface PreviewFrameProps {
  webContainer: any;
  files: FileItem[];
}

export function PreviewFrame({ webContainer, files }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const serverProcessRef = useRef<any>(null);
  const isStartingRef = useRef(false);

  // --- 1. LISTENER FOR SECURE URL ---
  // This is the critical fix. We wait for WebContainer to emit the 'server-ready'
  // event, which gives us a secure, proxied URL that won't be blocked by COEP.
  useEffect(() => {
    if (!webContainer) return;

    const unsubscribe = webContainer.on("server-ready", (port: number, url: string) => {
      console.log("✅ Server Ready:", url);
      setServerUrl(url);
      setIsLoading(false); // Stop loading once the URL is ready
    });

    return () => {
      unsubscribe();
    };
  }, [webContainer]);

  const cleanupServer = useCallback(async () => {
    if (serverProcessRef.current) {
      try {
        serverProcessRef.current.kill();
        await serverProcessRef.current.exit;
      } catch (err) {
        console.error("Error killing server:", err);
      }
      serverProcessRef.current = null;
    }
    setServerUrl(null);
  }, []);

  const verifyFilesMounted = useCallback(
    async (container: any): Promise<boolean> => {
      try {
        const dirContents = await container.fs.readdir("/");
        console.log("Mounted files:", dirContents);

        // Check for package.json
        let hasPackageJson = false;
        try {
          await container.fs.readFile("/package.json", "utf-8");
          hasPackageJson = true;
        } catch {
          for (const item of dirContents || []) {
            try {
              await container.fs.readFile(`/${item}/package.json`, "utf-8");
              hasPackageJson = true;
              break;
            } catch {
              continue;
            }
          }
        }

        if (!hasPackageJson) {
          throw new Error("No package.json found in project");
        }

        return true;
      } catch (err) {
        console.error("File verification error:", err);
        throw err;
      }
    },
    [],
  );

  const installDependencies = useCallback(async (container: any) => {
    console.log("Installing dependencies...");
    setIsInstalling(true);

    try {
      const installProcess = await container.spawn("npm", ["install"], {
        cwd: "/",
      });

      if (!installProcess) {
        throw new Error("Failed to spawn npm install");
      }

      // Listen to output
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("[npm install]", data);
          },
        }),
      );

      const exitCode = await installProcess.exit;
      if (exitCode !== 0) {
        throw new Error(`npm install failed with exit code ${exitCode}`);
      }

      console.log("✅ Dependencies installed successfully");
    } finally {
      setIsInstalling(false);
    }
  }, []);

  // --- 2. UPDATED DEV SERVER START ---
  // No longer waits for "localhost" string. Just starts the process.
  const startDevServer = useCallback(
    async (container: any) => {
      console.log("Starting dev server...");

      // Try to detect if it's Next.js and warn
      let isNextJs = false;
      try {
        const packageJson = JSON.parse(
          await container.fs.readFile("/package.json", "utf-8"),
        );
        isNextJs =
          packageJson.dependencies?.next || packageJson.devDependencies?.next;

        if (isNextJs) {
          console.warn(
            "⚠️ Next.js detected - this may have compatibility issues in WebContainer",
          );
        }
      } catch (e) {
        // Ignore
      }

      const devProcess = await container.spawn("npm", ["run", "dev"], {
        cwd: "/",
        env: {
          // Disable Next.js telemetry
          NEXT_TELEMETRY_DISABLED: "1",
          // Force non-turbopack mode
          NO_COLOR: "1",
        },
      });

      if (!devProcess) {
        throw new Error("Failed to spawn npm run dev");
      }

      serverProcessRef.current = devProcess;

      // Pipe output for debugging, but don't block waiting for URL
      devProcess.output.pipeTo(
        new WritableStream({
          write(data: string) {
            console.log("[dev server]", data);
          },
        }),
      );
    },
    [],
  );

  const startPreview = useCallback(async () => {
    if (!webContainer || files.length === 0 || isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);
      setServerUrl(null); // Reset URL

      // Wait for files to be mounted
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Verify files
      await verifyFilesMounted(webContainer);

      // Install dependencies
      await installDependencies(webContainer);

      // Start dev server (URL will be caught by the useEffect listener)
      await startDevServer(webContainer);
      
      // We don't set isLoading(false) here immediately.
      // It remains true (or falls through to "Preparing preview...")
      // until the useEffect above sets the serverUrl.
      
    } catch (err) {
      console.error("❌ Preview error:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to start preview";
      setError(errorMsg);
      setIsLoading(false);
    } finally {
      isStartingRef.current = false;
    }
  }, [
    webContainer,
    files,
    verifyFilesMounted,
    installDependencies,
    startDevServer,
  ]);

  // Trigger preview start
  useEffect(() => {
    if (
      !webContainer ||
      files.length === 0 ||
      serverUrl ||
      isStartingRef.current
    ) {
      return;
    }

    const timer = setTimeout(() => {
      startPreview();
    }, 500);

    return () => clearTimeout(timer);
  }, [webContainer, files, serverUrl, startPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupServer();
    };
  }, [cleanupServer]);

  const handleRetry = useCallback(() => {
    setError(null);
    setServerUrl(null);
    isStartingRef.current = false;
    cleanupServer().then(() => {
      setTimeout(() => startPreview(), 500);
    });
  }, [cleanupServer, startPreview]);

  if (isLoading || isInstalling) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
          <h3 className="font-semibold text-gray-900 mb-2 text-lg">
            {isInstalling ? "Installing Dependencies" : "Starting Preview"}
          </h3>
          <p className="text-gray-600 text-sm max-w-md">
            {isInstalling
              ? "Installing npm packages... This may take 1-2 minutes"
              : "Starting development server..."}
          </p>
          <div className="mt-6 space-y-2 text-left max-w-sm mx-auto">
            <StatusItem active text="Mounting files" />
            {isInstalling && <StatusItem active text="Installing packages" />}
            <StatusItem active={!isInstalling} text="Starting dev server" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="font-bold text-red-900 mb-2 text-lg">Preview Error</h3>
          <p className="text-red-700 text-sm mb-6 whitespace-pre-wrap">
            {error}
          </p>
          <div className="bg-red-100 rounded-lg p-4 text-left text-sm text-red-800 mb-4">
            <p className="font-semibold mb-2">Common Issues:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>
                Next.js with Turbopack isn't fully supported in WebContainer
              </li>
              <li>Ensure package.json has a valid "dev" script</li>
              <li>Check browser console for detailed error logs</li>
              <li>
                Consider using Vite instead of Next.js for better compatibility
              </li>
            </ul>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!serverUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Preparing preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <iframe
        ref={iframeRef}
        src={serverUrl}
        className="w-full h-full border-none"
        title="Project Preview"
      />
    </div>
  );
}

function StatusItem({ active, text }: { active: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div
        className={`w-2 h-2 rounded-full ${
          active ? "bg-blue-600 animate-pulse" : "bg-gray-300"
        }`}
      />
      {text}
    </div>
  );
}