import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/PricingCard";
import { FAQ } from "@/components/FAQ";
import { Testimonial } from "@/components/Testimonial";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/ScrollReveal";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { AuthGate } from "@/components/auth/AuthGate";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { ProductDemoSection } from "@/components/home/ProductDemoSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { StorytellingSection } from "@/components/home/StorytellingSection";
import { SuperSafeSection } from "@/components/home/SuperSafeSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { VideoModal } from "@/components/home/VideoModal";

const pricingPlans = [
  {
    title: "Basic",
    price: "Free",
    description: "Get started with essential protection",
    features: ["Content filtering", "Basic site blocking", "Daily screen time limits", "1 child profile", "Basic reports"],
    isPopular: false,
    ctaText: "Get Started",
  },
  {
    title: "Premium",
    price: "$9.99",
    description: "Full protection and detailed monitoring",
    features: ["Everything in Basic", "URL analysis & blocking", "Custom time schedules", "Up to 5 child profiles", "Full analytics dashboard", "Real-time notifications", "Incognito detection", "30-day history"],
    isPopular: true,
    ctaText: "Try 14 Days Free",
  },
  {
    title: "Family",
    price: "$14.99",
    description: "For larger families who need more",
    features: ["Everything in Premium", "Unlimited child profiles", "Priority support", "Cross-device sync", "Export reports", "90-day history"],
    isPopular: false,
    ctaText: "Try 14 Days Free",
  },
];

const testimonials = [
  { quote: "SproutSafe gives me peace of mind knowing my kids are protected online without feeling like I'm invading their privacy.", author: "Sarah Johnson", role: "Mother of two" },
  { quote: "The dashboard is intuitive and gives me exactly the information I need without overwhelming me with unnecessary details.", author: "Michael Reynolds", role: "Father of three" },
  { quote: "My kids actually like it because it's not intrusive, and they understand it's there to keep them safe, not to spy on them.", author: "Jennifer Torres", role: "Mother of a teenager" },
];

const faqs = [
  { question: "Does SproutSafe monitor private conversations?", answer: "No. SproutSafe scans page content for safety risks but doesn't record or store private conversations, messages, or keystrokes." },
  { question: "Will it slow down browsing?", answer: "No noticeable impact. The extension runs lightweight checks in the background without affecting page load times." },
  { question: "How does content filtering work?", answer: "The extension checks images, text, and URLs against threat databases and content classifiers. Harmful content gets blurred or blocked before it loads." },
  { question: "Can my child disable it?", answer: "No. Changing or removing SproutSafe requires parent authentication. You'll also get notified if someone tries to uninstall it." },
  { question: "Is our data safe?", answer: "Yes. All data is encrypted, we store the minimum needed, and we never sell user information. We comply with COPPA and other child privacy regulations." },
];

function SectionDivider() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
    </div>
  );
}

export default function Index() {
  const { isAuthenticated, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  // If already logged in, AuthGate will redirect to /dashboard
  useEffect(() => {
    if (isAuthenticated) return; // AuthGate handles redirect
  }, [isAuthenticated]);

  const openAuthModal = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <Navbar onSignInClick={openAuthModal} />

        <HeroSection onSignInClick={openAuthModal} />
        <FeaturesSection />
        <SectionDivider />
        <ProductDemoSection />
        <SectionDivider />
        <HowItWorksSection />
        <StorytellingSection />
        <SectionDivider />
        <SuperSafeSection />

        {/* Testimonials */}
        <SectionDivider />
        <section className="relative py-28 px-6">
          <div className="relative mx-auto max-w-6xl">
            <ScrollReveal className="text-center mb-14">
              <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-5">
                Testimonials
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] mb-4">
                What parents are saying
              </h2>
            </ScrollReveal>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5" staggerDelay={0.1}>
              {testimonials.map((t, i) => (
                <StaggerItem key={i}>
                  <Testimonial quote={t.quote} author={t.author} role={t.role} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Pricing */}
        <SectionDivider />
        <section id="pricing" className="relative py-28 px-6">
          <div className="relative mx-auto max-w-6xl">
            <ScrollReveal className="text-center mb-14">
              <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-5">
                Pricing
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] mb-4">
                Free to start. Upgrade when you need to.
              </h2>
            </ScrollReveal>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5" staggerDelay={0.1}>
              {pricingPlans.map((plan, i) => (
                <StaggerItem key={i}>
                  <PricingCard {...plan} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* FAQ */}
        <SectionDivider />
        <section id="faq" className="relative py-28 px-6">
          <div className="relative mx-auto max-w-3xl">
            <ScrollReveal className="text-center mb-14">
              <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-5">
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] mb-4">
                Common questions
              </h2>
            </ScrollReveal>
            <ScrollReveal>
              <FAQ faqs={faqs} />
            </ScrollReveal>
            <ScrollReveal className="mt-12 text-center" delay={0.2}>
              <p className="text-sm text-muted-foreground mb-4">Something else?</p>
              <Link to="/contact">
                <Button variant="outline" className="group">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-28 px-6 overflow-hidden">
          <ScrollReveal className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] mb-4">
              Try it. It's free.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
              Set up SproutSafe in under 5 minutes and see exactly what your child encounters online.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="group shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-shadow"
                onClick={() => openAuthModal("signup")}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Talk to Us
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </section>

        <HomeFooter />
      </div>

      <VideoModal />

      {authModalOpen && (
        <AuthModal
          open={authModalOpen}
          initialTab={authTab}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </AuthGate>
  );
}
