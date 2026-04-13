"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppToast = {
  id: string;
  message: string;
  variant?: "info" | "success" | "error";
};

type ToastStackProps = {
  onDismiss: (toastId: string) => void;
  toasts: AppToast[];
};

function ToastItem({
  onDismiss,
  toast,
}: {
  onDismiss: (toastId: string) => void;
  toast: AppToast;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onDismiss(toast.id);
    }, 3600);

    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.id]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border bg-card px-4 py-3 text-card-foreground shadow-soft",
        toast.variant === "success" && "border-emerald-500/40",
        toast.variant === "error" && "border-destructive/40",
        (!toast.variant || toast.variant === "info") && "border-border",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{toast.message}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0"
        onClick={() => onDismiss(toast.id)}
      >
        Fermer
      </Button>
    </div>
  );
}

export function ToastStack({ onDismiss, toasts }: ToastStackProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} onDismiss={onDismiss} toast={toast} />
      ))}
    </div>
  );
}
