import { Quote } from "lucide-react";
import { SpotlightCard } from "@/components/effects/SpotlightCard";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
}

export const Testimonial = ({ quote, author, role }: TestimonialProps) => {
  return (
    <SpotlightCard className="group">
      <div className="p-6">
        <Quote className="h-6 w-6 text-primary/20 mb-4 transition-colors group-hover:text-primary/40" />
        <p className="text-sm leading-relaxed mb-6">{quote}</p>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 text-sm font-medium text-primary">
            {author.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-medium">{author}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};
