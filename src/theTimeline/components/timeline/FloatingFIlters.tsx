import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TimelineFiltersControls from "./TimelineFiltersControls";

export default function FloatingFilters() {
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Floating Filter Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-50"
          >
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl shadow-blue-500/50 relative"
            >
              <SlidersHorizontal className="w-6 h-6 text-white" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  !
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto"
              dir="rtl"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 z-10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <SlidersHorizontal className="w-6 h-6" />
                    סינון אירועים
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                {hasActiveFilters && (
                  <p className="text-blue-100 text-sm">פילטרים פעילים</p>
                )}
              </div>
              <div className="p-6 space-y-6">
                <TimelineFiltersControls
                  layout="column"
                  showCaseFilter
                  clearClosesPanel
                  onAfterClear={() => setIsOpen(false)}
                  onHasActiveFiltersChange={setHasActiveFilters}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
