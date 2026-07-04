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
    <div className={cn("flex flex-col", className)}>
      <Label
        htmlFor={htmlFor}
        className="mb-2.5 block text-sm font-medium leading-snug text-foreground/90"
      >
        {label}
      </Label>
      <div className="space-y-2">{children}</div>
      {hint ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormStack({
  className,
  children,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
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
  return (
    <div className={cn("grid gap-x-6 gap-y-6 sm:grid-cols-2", className)}>
      {children}
    </div>
  );
}

/** Form khusus di dalam Dialog/Modal — padding & spacing lebih lega */
export function DialogForm({
  className,
  children,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <div className="px-6 py-6">
      <FormStack className={className} {...props}>
        {children}
      </FormStack>
    </div>
  );
}
