import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected rendering error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AWS Student Builder Group Lucky Draw ErrorBoundary]:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090714] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#1B1530] border border-[#C4B5FD]/25 rounded-2xl p-8 text-center shadow-card-glass">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Event Interface Recovery
            </h1>
            <p className="text-sm text-[#A9A3BE] mb-6 leading-relaxed">
              The lucky draw view encountered an unexpected interruption. Your saved winner history in local storage remains intact.
            </p>
            {this.state.errorMessage && (
              <div className="text-xs font-mono text-rose-300 bg-rose-950/40 border border-rose-500/20 rounded-lg p-3 mb-6 text-left break-words">
                {this.state.errorMessage}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white font-semibold shadow-purple-glow hover:brightness-110 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
