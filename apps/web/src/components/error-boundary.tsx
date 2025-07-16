"use client";

import { Component, type ReactNode } from "react";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center">
          <h1 className="text-lg text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-400 mb-4">
            Try refreshing the page. If the problem persists, contact support.
          </p>
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm text-white"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
