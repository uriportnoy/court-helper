import { useState, useMemo } from "react";
import "../../timeline/firebase";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { getEvents } from "../../timeline/firebase/events.ts";
import { getAllCases } from "../../timeline/firebase/cases.ts";

export default function useTimeline() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterImportant, setFilterImportant] = useState(false);
    const [filterType, setFilterType] = useState("all");
    const [filterYear, setFilterYear] = useState("all");
    const [filterMonth, setFilterMonth] = useState("all");
    const [filterCourt, setFilterCourt] = useState("all");
    const [sortDirection, setSortDirection] = useState("desc"); // "asc" or "desc"
    const [editingEvent, setEditingEvent] = useState(null);
  
    const { data: events, isLoading } = useQuery({
      queryKey: ["events"],
      queryFn: async () => {
        const evts = await getEvents();
        return (evts || []).map((e: any) => ({
          ...e,
          fileURLs: e.fileURLs ?? e.fileURL ?? [],
        }));
      },
      initialData: [],
    });
  
    const { data: cases } = useQuery({
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
      setFilterType("all");
      setFilterYear("all");
      setFilterMonth("all");
      setFilterCourt("all");
      setSortDirection("desc");
    };
  
    const hasActiveFilters =
      searchQuery ||
      filterImportant ||
      filterType !== "all" ||
      filterYear !== "all" ||
      filterMonth !== "all" ||
      filterCourt !== "all" ||
      sortDirection !== "desc";
  
    const filteredEvents = events.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesImportant = !filterImportant || event.important;
      const matchesType = filterType === "all" || event.type === filterType;
  
      const eventDate = event.date ? new Date(event.date) : null;
      const matchesYear =
        filterYear === "all" ||
        (eventDate && eventDate.getFullYear() === parseInt(filterYear));
      const matchesMonth =
        filterMonth === "all" ||
        (eventDate && eventDate.getMonth() === parseInt(filterMonth));
  
      const relatedCase = cases?.find((c) => c.caseNumber === event.caseNumber);
      const matchesCourt =
        filterCourt === "all" ||
        (relatedCase && relatedCase.court === filterCourt);
  
      return (
        matchesSearch &&
        matchesImportant &&
        matchesType &&
        matchesYear &&
        matchesMonth &&
        matchesCourt
      );
    });
  
    // Sort all filtered events by date first
    const sortedEvents = [...filteredEvents].sort((a: any, b: any) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
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
        const aDate = groupedEvents[a][0]?.date ? new Date(groupedEvents[a][0].date).getTime() : 0;
        const bDate = groupedEvents[b][0]?.date ? new Date(groupedEvents[b][0].date).getTime() : 0;
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      })
      .forEach(monthYear => {
        sortedGroupedEvents[monthYear] = groupedEvents[monthYear];
      });
    
    return {
        events,
        cases,
        availableYears,
        availableMonths,
        clearFilters,
        hasActiveFilters,
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
        isLoading,
    };
};