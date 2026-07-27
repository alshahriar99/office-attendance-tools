"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center p-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Critical Error</h1>
            <p className="text-muted-foreground">
              A fatal error occurred. Please try again or refresh the page.
            </p>
          </div>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
