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
        <div className="h-full min-h-[400px] w-full bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-50 rounded-full mb-6 ring-8 ring-red-50/50">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              The application encountered an unexpected error.
            </p>

            {this.state.error && (
              <div className="bg-red-50/50 rounded-lg p-4 mb-6 border border-red-100 text-left overflow-auto max-h-40">
                <p className="text-red-700 text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-gray-900/10 active:scale-95"
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