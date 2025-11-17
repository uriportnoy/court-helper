import { getAllCases } from "@/firebase/cases";
import { Case, TimelineEventData } from "@/theTimeline/types";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import { getEvents } from "@/firebase/events";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { AllValue, CaseType, CourtType, Origin, SortDirection } from "./common";

interface TimelineContextType {
  events: TimelineEventData[];
  cases: Case[];
  isEventsLoading: boolean;
  isCasesLoading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterYear: AllValue | string;
  setFilterYear: (value: AllValue | string) => void;
  filterMonth: AllValue | string;
  setFilterMonth: (value: AllValue | string) => void;
  filterCourt: AllValue | CourtType;
  setFilterCourt: (value: AllValue | CourtType) => void;
  sortDirection: SortDirection;
  setSortDirection: (value: SortDirection) => void;
  filterImportant: boolean;
  setFilterImportant: (value: boolean) => void;
  filterType: AllValue | Origin;
  setFilterType: (value: AllValue | Origin) => void;
  availableYears: number[];
  availableMonths: number[];
  clearFilters: () => void;
  hasActiveFilters: boolean;
  filteredEvents: any[];
  groupedEvents: Record<string, any[]>;
  editingEvent: any;
  setEditingEvent: (event: any | null | undefined) => void;
  filterGroups: Array<{ label: string; value: string }>;
  setFilterGroups: (groups: Array<{ label: string; value: string }>) => void;
}

const TimelineContext = createContext<TimelineContextType>(
  {} as TimelineContextType
);

export const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterImportant, setFilterImportant] = useState(false);
  const [filterType, setFilterType] = useState<Origin | AllValue>(AllValue.ALL);
  const [filterYear, setFilterYear] = useState<AllValue | string>(AllValue.ALL);
  const [filterMonth, setFilterMonth] = useState<AllValue | string>(
    AllValue.ALL
  );
  const [filterCourt, setFilterCourt] = useState<CourtType | AllValue>(
    AllValue.ALL
  );
  const [sortDirection, setSortDirection] = useState(SortDirection.DESC); // "asc" or "desc"
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterGroups, setFilterGroups] = useState<
    Array<{ label: string; value: string }>
  >([]);
  console.log("filterGroups", filterGroups);
  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const evts = await getEvents();
      return evts || [];
    },
    initialData: [],
  });

  const { data: cases, isLoading: isCasesLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: () => getAllCases(),
    initialData: [],
  });

  // Extract unique years and months from events
  const availableYears = useMemo(() => {
    const years = new Set<number>(
      events
        .map((e) => (e.date ? new Date(e.date).getFullYear() : null))
        .filter((year): year is number => year !== null)
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [events]);

  const availableMonths = useMemo(() => {
    if (filterYear === "all") return [];
    const months = new Set(
      events
        .filter(
          (e) =>
            e.date && new Date(e.date).getFullYear() === parseInt(filterYear)
        )
        .map((e) => new Date(e.date).getMonth())
    );
    return Array.from(months).sort((a, b) => a - b);
  }, [events, filterYear]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterImportant(false);
    setFilterType(AllValue.ALL);
    setFilterYear(AllValue.ALL);
    setFilterMonth(AllValue.ALL);
    setFilterCourt(AllValue.ALL);
    setSortDirection(SortDirection.DESC);
    setFilterGroups([]);
  };

  const hasActiveFilters =
    searchQuery ||
    filterImportant ||
    filterType !== AllValue.ALL ||
    filterYear !== AllValue.ALL ||
    filterMonth !== AllValue.ALL ||
    filterCourt !== AllValue.ALL ||
    sortDirection !== SortDirection.DESC ||
    filterGroups.length > 0;

  const filteredEvents = events.filter((event) => {
    const lowerSearch = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      event.title?.toLowerCase().includes(lowerSearch) ||
      event.subtitle?.toLowerCase().includes(lowerSearch) ||
      event.caseNumber?.toLowerCase().includes(lowerSearch) ||
      event.content?.toLowerCase().includes(lowerSearch) ||
      event.groups?.some((group: any) => {
        // support both { name } and { label }
        const groupName = (group.name ?? group.label ?? "").toLowerCase();
        return groupName.includes(lowerSearch);
      });

    const matchesImportant = !filterImportant || event.important;

    const matchesType =
      filterType === AllValue.ALL || event.type === filterType;

    const eventDate = event.date ? new Date(event.date) : null;

    const matchesYear =
      filterYear === AllValue.ALL ||
      (eventDate && eventDate.getFullYear() === parseInt(filterYear, 10));

    const matchesMonth =
      filterMonth === AllValue.ALL ||
      (eventDate && eventDate.getMonth() === parseInt(filterMonth, 10));

    const relatedCase = cases?.find((c) => c.caseNumber === event.caseNumber);

    const matchesCourt =
      filterCourt === AllValue.ALL ||
      (relatedCase && relatedCase.court === filterCourt);

    // ----- FIXED GROUP FILTER -----
    const matchesGroups =
      !filterGroups ||
      filterGroups.length === 0 ||
      (event.groups &&
        event.groups.length > 0 &&
        event.groups.some((group: any) => {
          // event groups can be { id } or { value }
          const groupId = String(group.id ?? group.value);
          return filterGroups.some((selected: any) => {
            // filterGroups entries are { label, value }
            const selectedId = String(selected.id ?? selected.value);
            return selectedId === groupId;
          });
        }));

    return (
      matchesSearch &&
      matchesImportant &&
      matchesType &&
      matchesYear &&
      matchesMonth &&
      matchesCourt &&
      matchesGroups
    );
  });

  // Sort all filtered events by date first
  const sortedEvents = [...filteredEvents].sort((a: any, b: any) => {
    const aDate = a.date ? new Date(a.date).getTime() : 0;
    const bDate = b.date ? new Date(b.date).getTime() : 0;
    return sortDirection === SortDirection.ASC ? aDate - bDate : bDate - aDate;
  });

  // Then group sorted events by month/year
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const monthYear = event.date
      ? format(new Date(event.date), "MMMM yyyy", { locale: he })
      : "ללא תאריך";
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(event);
    return acc;
  }, {});

  // Sort month groups by their chronological order
  const sortedGroupedEvents: { [key: string]: any[] } = {};
  Object.keys(groupedEvents)
    .sort((a, b) => {
      // Extract date from first event in each group for comparison
      const aDate = groupedEvents[a][0]?.date
        ? new Date(groupedEvents[a][0].date).getTime()
        : 0;
      const bDate = groupedEvents[b][0]?.date
        ? new Date(groupedEvents[b][0].date).getTime()
        : 0;
      return sortDirection === SortDirection.ASC
        ? aDate - bDate
        : bDate - aDate;
    })
    .forEach((monthYear) => {
      sortedGroupedEvents[monthYear] = groupedEvents[monthYear];
    });

  const context = {
    events,
    cases,
    availableYears,
    availableMonths,
    clearFilters,
    hasActiveFilters: Boolean(hasActiveFilters),
    filteredEvents,
    groupedEvents: sortedGroupedEvents,
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
    isCasesLoading,
    isEventsLoading,
    filterGroups,
    setFilterGroups,
  };
  return (
    <TimelineContext.Provider value={context}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimelineContext = () => {
  return useContext(TimelineContext);
};
