import { useCallback, useEffect, useState } from "react";
import { useImmer } from "use-immer";
import get from "lodash/get";
import { getEvents } from "./firebase/events.ts";
import { getAllCases } from "./firebase/cases.ts";
import { getAll } from "./firebase/crud";
import { TimelineData, Case, Group } from "./types";

export default function useTimelineApp() {
  const [allEvents, setAllEvents] = useState<TimelineData[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filters, setFilters] = useImmer<Record<string, any>>({});
  const [ascending, setAscending] = useState(false);

  console.log(filters)
  const filterTimelineData = useCallback(() => {
    const sortedEvents = [...allEvents].sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      return ascending
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });

    console.log("Filtering with filters:", filters);
    
    if (!filters || Object.keys(filters).length === 0) {
      setTimelineData(sortedEvents);
      return;
    }
    const filteredData = sortedEvents.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        // Handle text search
        if (key === "text") {
          if (!value || typeof value !== "string" || value.length <= 2)
            return true;

          const searchValue = value.toLowerCase();

          // Direct field searches
          const directFields = [
            "title",
            "content",
            "caseNumber",
            "subtitle",
            "date",
          ] as const;
          const directFieldMatch = directFields.some((field) => {
            const fieldValue = (item as any)[field];
            return (
              fieldValue &&
              fieldValue.toString().toLowerCase().includes(searchValue)
            );
          });
          const selectedCase = item.selectedCase as Case;
          const { description, relation, type, id, caseNumber } = selectedCase;
          // Search in selectedCase nested fields
          const selectedCaseMatch =
            item.selectedCase &&
            [
              description,
              relation, // May exist in actual data but not in type
              type,
              id,
              caseNumber,
            ].some(
              (fieldValue) =>
                fieldValue &&
                fieldValue.toString().toLowerCase().includes(searchValue)
            );

          // Search in groups labels
          const groupsMatch =
            item.groups &&
            item.groups.some(
              (group: any) =>
                group.label && group.label.toLowerCase().includes(searchValue)
            );

          return directFieldMatch || selectedCaseMatch || groupsMatch;
        }

        // Handle case number filter
        if (key === "caseNumber") {
          return item.caseNumber === value;
        }

        // Handle court filter
        if (key === "selectedCase.court") {
          return get(item, "selectedCase.court") === value;
        }

        // Handle groups filter
        if (key === "groups") {
          if (!item.groups || item.groups.length === 0) return false;

          return item.groups.some((group: any) => {
            const groupId =
              group.value?.value?.value || group.value?.value || group.value;
            return Array.isArray(value) && value.includes(groupId);
          });
        }

        // Handle type filter (now MultiSelect: array of selected origins)
        if (key === "type") {
          if (Array.isArray(value)) {
            return value.includes(item.type);
          }
          return item.type === value;
        }

        // Handle nested object paths using lodash get
        const itemValue = get(item, key);
        if (Array.isArray(itemValue)) {
          return itemValue.some((val) => val.value === value);
        }

        return itemValue === value;
      });
    });

    setTimelineData(filteredData);
  }, [filters, allEvents, ascending]);

  const loadEvents = useCallback(async () => {
    const events = await getEvents();
    setAllEvents(events as TimelineData[]);
  }, []);

  const loadCases = useCallback(async () => {
    const loadedCases = await getAllCases();
    setCases(loadedCases);
    return loadedCases;
  }, []);

  const loadGroups = useCallback(async () => {
    const loadedGroups = await getAll("groups");
    setGroups(loadedGroups as Group[]);
  }, []);

  // Apply filters whenever filters or events change
  useEffect(() => {
    filterTimelineData();
  }, [filterTimelineData, filters, allEvents, ascending]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all data first
        const [events, loadedCases, loadedGroups] = await Promise.all([
          getEvents(),
          getAllCases(),
          getAll("groups"),
        ]);

        // Set states synchronously before flipping isLoaded
        setAllEvents(events as TimelineData[]);
        setCases(loadedCases);
        setGroups(loadedGroups as Group[]);

        // Initialize timelineData immediately to avoid empty flash
        const sortedEvents = [...(events as TimelineData[])].sort((a, b) => {
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);
          return ascending
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        });
        setTimelineData(sortedEvents);

        // Only after states are set, mark as loaded
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    timelineData,
    isLoaded,
    filters,
    setFilters,
    ascending,
    setAscending,
    contextData: {
      loadEvents,
      allEvents,
      cases,
      groups,
      loadCases,
      timelineData,
    },
  };
}
