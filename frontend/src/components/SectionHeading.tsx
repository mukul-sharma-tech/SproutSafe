import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  badge?: string;
}

export const SectionHeading = ({
  title,
  subtitle,
  centered = false,
  className,
  badge,
}: SectionHeadingProps) => {
  return (
    <ScrollReveal className={cn("mb-14", centered && "text-center", className)}>
      {badge && (
        <div className={cn("mb-4", centered && "flex justify-center")}>
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            {badge}
          </span>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">{title}</h2>
      {subtitle && (
        <p className={cn("text-lg text-muted-foreground max-w-2xl leading-relaxed", centered && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
};
