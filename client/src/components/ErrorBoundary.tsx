import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when the key changes (e.g., on navigation)
    if (prevProps.fallbackKey !== this.props.fallbackKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-8 bg-white">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-2 font-semibold text-gray-900">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-6 text-center">
              This page encountered an error. You can go back or reload to try again.
            </p>

            <div className="p-4 w-full rounded bg-gray-100 overflow-auto mb-6 max-h-48">
              <pre className="text-xs text-gray-500 whitespace-break-spaces">
                {this.state.error?.message}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.history.back();
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-gray-100 text-gray-700",
                  "hover:bg-gray-200 cursor-pointer"
                )}
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-90 cursor-pointer"
                )}
              >
                <RotateCcw size={16} />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
