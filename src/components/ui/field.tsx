import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, className, hint, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground/90">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function FormStack({
  className,
  children,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-5", className)} {...props}>
      {children}
    </form>
  );
}

export function FormGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("grid gap-5 sm:grid-cols-2", className)}>{children}</div>;
}
