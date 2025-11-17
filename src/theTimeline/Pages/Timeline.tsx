import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Plus, Calendar, Download, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EventCard from "../components/timeline/EventCard";
import { Skeleton, Button } from "@/components/ui";
import { addEvent } from "@/firebase/events.ts";
import { toast } from "sonner";
import TopBar from "../components/timeline/TopBar.tsx";
import Stats from "../components/timeline/Stats.tsx";
import FloatingFilters from "../components/timeline/FloatingFIlters.tsx";
import EventDialog from "../components/timeline/EventDialog.tsx";
import { useTimelineContext } from "../context";
import { TimelineEventData } from "@/theTimeline/types.ts";

export default function TimelinePage() {
  const {
    hasActiveFilters,
    filteredEvents,
    groupedEvents,
    editingEvent,
    setEditingEvent,
    isEventsLoading,
    events,
    cases,
  } = useTimelineContext();
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
      link.download = `court-timeline-events-${
        new Date().toISOString().split("T")[0]
      }.json`;
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
            const existingEvent = events.find((e) => e.id === eventData.id);
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
                  onClick={() =>
                    document.getElementById("import-events")?.click()
                  }
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

          <Stats />
          <TopBar />
          <FloatingFilters />
          {/* Timeline */}
          {isEventsLoading ? (
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
                {Object.entries(groupedEvents).map(
                  ([monthYear, monthEvents]) => (
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

                      <div className="relative space-y-4">
                        {(monthEvents as TimelineEventData[]).map(
                          (event: TimelineEventData, idx: number) => (
                            <EventCard
                              key={`event-${event.id}-${idx}`}
                              event={event}
                              cases={cases}
                              onEdit={() => setEditingEvent(event)}
                            />
                          )
                        )}
                      </div>
                    </motion.div>
                  )
                )}
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
          <EventDialog
            event={editingEvent}
            open={!!editingEvent}
            onClose={() => setEditingEvent(null)}
          />
        )}
      </div>
    </div>
  );
}
