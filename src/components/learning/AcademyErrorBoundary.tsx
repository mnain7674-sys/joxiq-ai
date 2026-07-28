import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, BookOpen } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AcademyErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Learning Academy Error Boundary caught an error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center my-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Learning Component Encountered an Error
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected issue occurred while loading this lesson or module. No student progress was lost.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-slate-500 bg-slate-950 p-3 rounded-xl border border-slate-850 truncate max-w-sm mx-auto">
                {this.state.error.message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Component</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Refresh Academy</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
