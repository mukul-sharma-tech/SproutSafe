import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const YOUTUBE_VIDEO_ID = "q7_hN1c3RNs";
const STORAGE_KEY = "sproutsafe_video_dismissed";

export function VideoModal() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setPlaying(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-3xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-2xl overflow-hidden bg-card border border-border/50 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
                <div>
                  <h3 className="text-sm font-semibold">See how SproutSafe works</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Watch a quick demo</p>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Video */}
              <div className="relative aspect-video bg-black">
                {playing ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
                    title="SproutSafe Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 w-full h-full group cursor-pointer"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
                      alt="Video thumbnail"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full",
                        "bg-white/90 shadow-xl",
                        "transition-transform group-hover:scale-110"
                      )}>
                        <Play className="h-7 w-7 text-black ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
