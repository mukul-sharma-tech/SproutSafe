import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ToggleRight, FolderOpen, ExternalLink, X, Puzzle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const GITHUB_URL = "https://github.com/mukul-sharma-tech/CyberNest";
const EXTENSION_ZIP_URL = "https://github.com/mukul-sharma-tech/CyberNest/archive/refs/heads/main.zip";

const steps = [
  {
    icon: Download,
    title: "Download & Unzip",
    desc: "Download the extension zip from GitHub and extract it to a folder on your computer.",
    action: { label: "Download from GitHub", href: EXTENSION_ZIP_URL },
  },
  {
    icon: ToggleRight,
    title: "Enable Developer Mode",
    desc: 'Open Chrome and go to chrome://extensions — toggle "Developer mode" ON in the top-right corner.',
    action: { label: "Open chrome://extensions", href: "chrome://extensions" },
  },
  {
    icon: FolderOpen,
    title: "Load Unpacked",
    desc: 'Click "Load unpacked" and select the extension folder you just unzipped. CyberNest will appear in your toolbar.',
    action: null,
  },
];

export function ExtensionInstallGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        <Puzzle className="h-4 w-4" />
        How to install the extension
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Install CyberNest Extension</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    3 quick steps — takes under 2 minutes
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Steps */}
              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-1 space-y-1.5">
                      <p className="text-sm font-medium">
                        <span className="text-muted-foreground mr-1.5">{i + 1}.</span>
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                      {step.action && (
                        <a
                          href={step.action.href}
                          target={step.action.href.startsWith("chrome") ? "_self" : "_blank"}
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          {step.action.label}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  View source on GitHub
                </a>
                <Button size="sm" asChild>
                  <a href={EXTENSION_ZIP_URL} target="_blank" rel="noreferrer">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download .zip
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
