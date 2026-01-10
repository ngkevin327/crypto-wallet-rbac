"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

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
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <Card className="max-w-md text-center">
            <CardBody className="space-y-4 py-10">
              <h1 className="font-display text-lg font-semibold text-white">Something went wrong</h1>
              <p className="text-sm text-slate-400">
                Try refreshing the page. If the problem persists, contact support.
              </p>
              <Button type="button" onClick={() => this.setState({ hasError: false })}>
                Try again
              </Button>
            </CardBody>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
