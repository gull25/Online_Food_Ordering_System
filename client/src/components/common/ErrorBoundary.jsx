import React from "react";
import Icon from "./Icon";

/* Catches render-time exceptions so one broken component cannot blank the app.*/
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        className="min-h-[60vh] flex flex-col items-center justify-center gap-stack_md px-margin_mobile py-stack_lg text-center animate-in fade-in duration-300"
      >
        <div className="w-20 h-20 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
          <Icon name="error" className="text-[40px]" />
        </div>

        <div className="max-w-md">
          <h1 className="font-h3 text-h3 text-on-surface mb-2">
            Something went wrong
          </h1>
          <p className="font-body text-body text-secondary">
            This part of the page failed to load. Reloading usually clears it —
            if it keeps happening, please let us know.
          </p>
        </div>

        {import.meta.env.DEV && (
          <pre className="max-w-full overflow-x-auto text-left text-[12px] font-mono bg-surface-container-high text-on-surface-variant p-4 rounded-xl border border-outline-variant">
            {this.state.error?.message}
          </pre>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-on-primary font-button text-button transition-opacity hover:opacity-90"
          >
            <Icon name="sync" className="text-[20px]" />
            <span>Reload page</span>
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-outline-variant text-on-surface font-button text-button transition-colors hover:border-primary hover:text-primary"
          >
            <span>Go home</span>
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
