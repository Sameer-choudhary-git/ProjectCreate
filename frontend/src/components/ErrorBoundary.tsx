import { ReactNode, Component, ErrorInfo } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full min-h-[400px] w-full bg-[#0d1117] flex items-center justify-center p-6">
          <div className="bg-[#161b22] rounded-xl shadow-2xl border border-[#30363d] p-8 max-w-md w-full text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-[#f85149]/10 rounded-full mb-6 border border-[#f85149]/20">
              <AlertCircle className="w-8 h-8 text-[#f85149]" />
            </div>
            
            <h2 className="text-xl font-bold text-[#c9d1d9] mb-2">
              Something went wrong
            </h2>
            <p className="text-[#8b949e] mb-6 text-sm">
              The application encountered an unexpected error.
            </p>

            {this.state.error && (
              <div className="bg-[#0d1117] rounded-lg p-4 mb-6 border border-[#30363d] text-left overflow-auto max-h-40 scrollbar-thin scrollbar-thumb-gray-700">
                <p className="text-[#f85149] text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border border-[#30363d]"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}