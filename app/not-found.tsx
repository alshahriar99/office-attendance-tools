import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground mb-8">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">404</h1>
      <h2 className="text-xl sm:text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
      </p>
      <Link href="/" className={buttonVariants({ size: "lg", className: "shadow-sm" })}>
        Return to Dashboard
      </Link>
    </div>
  );
}
