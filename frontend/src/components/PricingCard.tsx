import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/effects/SpotlightCard";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText?: string;
}

export const PricingCard = ({
  title,
  price,
  description,
  features,
  isPopular = false,
  ctaText = "Get Started",
}: PricingCardProps) => {
  return (
    <SpotlightCard
      className={cn(
        "flex flex-col",
        isPopular && "ring-1 ring-primary/30 shadow-lg shadow-primary/5"
      )}
      spotlightColor={isPopular ? "rgba(120, 80, 255, 0.12)" : "rgba(120, 80, 255, 0.06)"}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="shadow-md">Most Popular</Badge>
        </div>
      )}
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-3">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-muted-foreground ml-1">/month</span>}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>
      <div className="flex-1 px-6 pb-4">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 pt-2">
        <Button variant={isPopular ? "default" : "outline"} className={cn("w-full", isPopular && "shadow-md shadow-primary/20")}>
          {ctaText}
        </Button>
      </div>
    </SpotlightCard>
  );
};
