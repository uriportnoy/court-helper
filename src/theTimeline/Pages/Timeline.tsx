import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Star,
  FileText,
  Building2,
  X,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Download,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EventCard from "../components/timeline/EventCard";
import {
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { courts, monthNames } from "../common";
import EditEventDialog from "../components/timeline/EditEventDialog";
import useTimeline from "../hooks/useTimeline.ts";
import { addEvent } from "../../timeline/firebase/events.ts";
import { toast } from "sonner";

export default function TimelinePage() {
  const {
    events,
    cases,
    availableYears,
    availableMonths,
    clearFilters,
    hasActiveFilters,
    filteredEvents,
    groupedEvents,
    searchQuery,
    setSearchQuery,
    filterImportant,
    setFilterImportant,
    filterType,
    setFilterType,
    filterYear,
    setFilterYear,
    filterMonth,
    setFilterMonth,
    filterCourt,
    setFilterCourt,
    sortDirection,
    setSortDirection,
    editingEvent,
    setEditingEvent,
    isLoading,
  } = useTimeline();

  // Export events as JSON
  const handleExportEvents = () => {
    try {
      const dataToExport = {
        events: events,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `court-timeline-events-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("האירועים יוצאו בהצלחה!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("שגיאה בייצוא האירועים");
    }
  };

  // Import events from JSON
  const handleImportEvents = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        if (!importedData.events || !Array.isArray(importedData.events)) {
          toast.error("פורמט הקובץ לא תקין");
          return;
        }

        let importedCount = 0;
        for (const eventData of importedData.events) {
          try {
            // Ensure we don't duplicate existing events
            const existingEvent = events.find(e => e.id === eventData.id);
            if (!existingEvent) {
              await addEvent(eventData);
              importedCount++;
            }
          } catch (error) {
            console.error("Failed to import event:", eventData, error);
          }
        }

        if (importedCount > 0) {
          toast.success(`יובאו ${importedCount} אירועים בהצלחה!`);
          // Refresh the page or trigger a refetch
          window.location.reload();
        } else {
          toast.info("לא נמצאו אירועים חדשים לייבא");
        }
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("שגיאה בייבוא האירועים");
      }
    };

    reader.readAsText(file);
    // Reset the input
    event.target.value = "";
  };
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                ציר זמן משפטי
              </h1>
              <p className="text-slate-600">
                עקוב וניהול כל האירועים המשפטיים שלך במקום אחד
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportEvents}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Download className="w-4 h-4 ml-2" />
                ייצא
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-events')?.click()}
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  ייבא
                </Button>
                <input
                  id="import-events"
                  type="file"
                  accept=".json"
                  onChange={handleImportEvents}
                  className="hidden"
                />
              </div>
              <Link to={createPageUrl("CreateEvent")}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                  <Plus className="w-5 h-5 ml-2" />
                  אירוע חדש
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">סה״כ אירועים</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {events.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">חשובים</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {events.filter((e) => e.important).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">תיקים פעילים</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {cases.filter((c) => c.isOpen).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">מסמכים</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {events.reduce(
                      (sum, e) => sum + (e.fileURLs?.length || 0),
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50">
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="חיפוש אירועים לפי כותרת, מספר תיק..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 border-slate-200"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filterYear}
                  onValueChange={(value) => {
                    setFilterYear(value);
                    setFilterMonth("all");
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="שנה" />
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

                <Select
                  value={filterMonth}
                  onValueChange={setFilterMonth}
                  disabled={filterYear === "all"}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="חודש" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל החודשים</SelectItem>
                    {availableMonths.map((month) => (
                      <SelectItem
                        key={`month-${month}`}
                        value={month.toString()}
                      >
                        {monthNames[month]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCourt} onValueChange={setFilterCourt}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="בית משפט" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל בתי המשפט</SelectItem>
                    {courts.map((c) => (
                      <SelectItem key={`court-${c}`} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={filterImportant ? "default" : "outline"}
                  onClick={() => setFilterImportant(!filterImportant)}
                  className={
                    filterImportant ? "bg-amber-600 hover:bg-amber-700" : ""
                  }
                >
                  <Star className="w-4 h-4 ml-2" />
                  חשובים
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  className="w-10 h-10 p-0"
                  title={sortDirection === "asc" ? "מיין לפי תאריך עולה" : "מיין לפי תאריך יורד"}
                >
                  {sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                </Button>

                <Button
                  variant={filterType === "mine" ? "default" : "outline"}
                  onClick={() =>
                    setFilterType(filterType === "mine" ? "all" : "mine")
                  }
                  className={
                    filterType === "mine" ? "bg-blue-600 hover:bg-blue-700" : ""
                  }
                >
                  <Filter className="w-4 h-4 ml-2" />
                  המסמכים שלי
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="w-4 h-4 ml-2" />
                    נקה פילטרים
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={`skeleton-${i}`} className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            <AnimatePresence mode="wait">
              {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
                <motion.div
                  key={monthYear}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-blue-500/25">
                      {monthYear}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-l from-slate-300 to-transparent" />
                  </div>

                  <div className="relative pr-8 border-r-2 border-slate-200">
                    {(monthEvents as any[]).map((event: any, idx: number) => (
                      <div
                        key={`event-${event.id}-${idx}`}
                        className="relative mb-8 last:mb-0"
                      >
                        <div className="absolute -right-[33px] w-4 h-4 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border-4 border-white shadow-lg" />
                        <EventCard
                          event={event}
                          cases={cases}
                          onEdit={() => setEditingEvent(event)}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredEvents.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  לא נמצאו אירועים
                </h3>
                <p className="text-slate-600 mb-6">
                  {hasActiveFilters
                    ? "נסה לשנות את הפילטרים"
                    : "התחל ביצירת האירוע המשפטי הראשון שלך"}
                </p>
                <Link to={createPageUrl("CreateEvent")}>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="w-5 h-5 ml-2" />
                    צור אירוע
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Edit Event Dialog */}
      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          cases={cases}
          open={!!editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
}
