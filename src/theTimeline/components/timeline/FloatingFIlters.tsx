import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Input,
} from "@/components/ui";
import {
  Search,
  Filter,
  Star,
  X,
  SlidersHorizontal,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { courts, monthNames } from "@/theTimeline/common";
import { useTimelineContext } from "@/theTimeline/context";

export default function FloatingFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const {
    searchQuery,
    setSearchQuery,
    filterYear,
    setFilterYear,
    filterMonth,
    setFilterMonth,
    filterCourt,
    setFilterCourt,
    filterImportant,
    setFilterImportant,
    filterType,
    setFilterType,
    availableYears,
    availableMonths,
    clearFilters,
    hasActiveFilters,
    sortDirection,
    setSortDirection,
  } = useTimelineContext();
  
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
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    חיפוש
                  </label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="חפש אירועים..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 h-11 border-slate-300"
                    />
                  </div>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    שנה
                  </label>
                  <Select
                    value={filterYear}
                    onValueChange={(value) => {
                      setFilterYear(value);
                      setFilterMonth("all");
                    }}
                  >
                    <SelectTrigger className="h-11 border-slate-300">
                      <SelectValue placeholder="בחר שנה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">כל השנים</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Month */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    חודש
                  </label>
                  <Select
                    value={filterMonth}
                    onValueChange={setFilterMonth}
                    disabled={filterYear === "all"}
                  >
                    <SelectTrigger className="h-11 border-slate-300">
                      <SelectValue placeholder="בחר חודש" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">כל החודשים</SelectItem>
                      {availableMonths.map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {monthNames[month]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Court */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    בית משפט
                  </label>
                  <Select value={filterCourt} onValueChange={setFilterCourt}>
                    <SelectTrigger className="h-11 border-slate-300">
                      <SelectValue placeholder="בחר בית משפט" />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((c) => (
                        <SelectItem key={`floating-court-${c}`} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Filters */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">
                    סינון מהיר
                  </label>

                  <Button
                    variant={filterImportant ? "default" : "outline"}
                    onClick={() => setFilterImportant(!filterImportant)}
                    className={`w-full h-12 justify-start ${
                      filterImportant ? "bg-amber-600 hover:bg-amber-700" : ""
                    }`}
                  >
                    <Star
                      className={`w-5 h-5 ml-3 ${
                        filterImportant ? "fill-white" : ""
                      }`}
                    />
                    <span className="flex-1 text-right">אירועים חשובים</span>
                    {filterImportant && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </Button>

                  <Button
                    variant={filterType === "mine" ? "default" : "outline"}
                    onClick={() =>
                      setFilterType(filterType === "mine" ? "all" : "mine")
                    }
                    className={`w-full h-12 justify-start ${
                      filterType === "mine"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }`}
                  >
                    <Filter className="w-5 h-5 ml-3" />
                    <span className="flex-1 text-right">המסמכים שלי</span>
                    {filterType === "mine" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                  className="w-10 h-10 p-0"
                  title={
                    sortDirection === "asc"
                      ? "מיין לפי תאריך עולה"
                      : "מיין לפי תאריך יורד"
                  }
                >
                  {sortDirection === "asc" ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                </Button>
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t border-slate-200">
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearFilters();
                        setIsOpen(false);
                      }}
                      className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="w-5 h-5 ml-2" />
                      נקה את כל הפילטרים
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
