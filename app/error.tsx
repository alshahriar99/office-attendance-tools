"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
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
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="rounded-full bg-destructive/10 p-6 text-destructive">
        <AlertCircle className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong!</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. We have been notified and are looking into it.
        </p>
      </div>
      <div className="flex gap-4 mt-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.href = "/"} variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}
