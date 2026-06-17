interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-1.5 border-b border-border/60 pb-5">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
