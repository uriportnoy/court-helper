import React from "react";
import { Link, Navigate, Routes, useLocation, Route } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Scale, Calendar, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import TimelinePage from "./Pages/Timeline";
import CreateEventPage from "./Pages/CreateEvent";
import CasesPage from "./Pages/Cases";
import { ContextWrapper } from "./context";

const navigationItems = [
  {
    title: "ציר זמן",
    url: createPageUrl("Timeline"),
    icon: Calendar,
  },
  {
    title: "תיקים",
    url: createPageUrl("Cases"),
    icon: FolderOpen,
  },
  {
    title: "אירוע חדש",
    url: createPageUrl("CreateEvent"),
    icon: Plus,
  },
];

export default function Layout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50"
      dir="rtl"
    >
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  ניהול אירועים
                </h2>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link key={item.title} to={item.url}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center gap-2 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="hidden md:inline">{item.title}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      <ContextWrapper>
        <main className="flex-1">{children ?? <AppRoutes />}</main>
      </ContextWrapper>
    </div>
  );
}

// Internal routes for the Timeline area so navigation loads pages
function AppRoutes() {
  // Lazy import pages to avoid circular imports at build

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={createPageUrl("Timeline")} replace />}
      />
      <Route path={createPageUrl("Timeline")} element={<TimelinePage />} />
      <Route path={createPageUrl("Cases")} element={<CasesPage />} />
      <Route
        path={createPageUrl("CreateEvent")}
        element={<CreateEventPage />}
      />
    </Routes>
  );
}
