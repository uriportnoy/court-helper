import LoginWrapper from "./LoginWrapper";
import { Link, Navigate, Routes, useLocation, Route } from "react-router-dom";
import { Scale, Calendar, Plus, FolderOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateEventPage from "@/theTimeline/Pages/CreateEvent";
import CasesPage from "@/theTimeline/Pages/Cases";
import { ContextWrapper } from "@/theTimeline/context";
import styled from "styled-components";
import TimelinePage from "@/theTimeline/Pages/Timeline";
import { default as PDFCreator } from "@/pdfCreator/App";

const navigationItems = [
  {
    title: "ציר זמן",
    url: "/Timeline",
    icon: Calendar,
  },
  {
    title: "תיקים",
    url: "/Cases",
    icon: FolderOpen,
  },
  {
    title: "יצירת מסמכים",
    url: "/PDFCreator",
    icon: FileText,
  },
  {
    title: "אירוע חדש",
    url: "/CreateEvent",
    icon: Plus,
  },
];

const AppWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--surface-50);
`;

const App = () => {
  const location = useLocation();

  return (
    <LoginWrapper>
      {({ logout }) => (
        <AppWrapper>
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
                            <span className="hidden md:inline">
                              {item.title}
                            </span>
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </header>
            <ContextWrapper>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to={"/Timeline"} replace />}
                />
                <Route path={"/Timeline"} element={<TimelinePage />} />
                <Route path={"/Cases"} element={<CasesPage />} />
                <Route path={"/CreateEvent"} element={<CreateEventPage />} />
                <Route path={"/PDFCreator"} element={<PDFCreator />} />
              </Routes>
            </ContextWrapper>
          </div>
        </AppWrapper>
      )}
    </LoginWrapper>
  );
};

export default App;
