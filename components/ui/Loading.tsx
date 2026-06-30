import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin text-pink-500 ${className}`} />;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-pink-100/50 ${className}`} />
  );
}

export function FullScreenLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Spinner className="h-12 w-12 mb-4" />
      <p className="text-pink-600 font-medium animate-pulse">{text}</p>
    </div>
  );
}
