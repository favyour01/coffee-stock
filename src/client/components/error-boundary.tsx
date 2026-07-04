import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("Render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive">Terjadi kesalahan saat memuat halaman</h2>
          <pre className="max-w-full overflow-auto rounded-md bg-muted p-4 text-left text-xs text-muted-foreground">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Coba lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
