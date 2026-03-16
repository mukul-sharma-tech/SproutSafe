import { type LucideIcon } from "lucide-react";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <SpotlightCard className="group">
      <div className="relative p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
          <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
        <h3 className="text-base font-semibold mb-2 transition-colors group-hover:text-primary">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </SpotlightCard>
  );
};
