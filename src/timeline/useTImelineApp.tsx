import { useCallback, useEffect, useState } from "react";
import { useImmer } from "use-immer";
import get from "lodash/get";
import { getEvents } from "./firebase/events.ts";
import { getAllCases } from "./firebase/cases.ts";
import { getAll } from "./firebase/crud";

export default function useTimelineApp() {
  const [allEvents, setAllEvents] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cases, setCases] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filters, setFilters] = useImmer({});
  const [ascending, setAscending] = useState(true);

  const filterTimelineData = useCallback(() => {
    const sortedEvents = [...allEvents].sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      return ascending
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });
    if (!filters || Object.keys(filters).length === 0) {
      setTimelineData(sortedEvents);
      return;
    }
    const filteredData = sortedEvents.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        // Handle text search
        if (key === "text") {
          if (!value || value.length <= 2) return true;

          const searchFields = ["title", "content", "caseNumber", "subTitle"];
          return searchFields.some((field) => {
            const fieldValue = item[field];
            return (
              fieldValue &&
              fieldValue.toLowerCase().includes(value.toLowerCase())
            );
          });
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

          return item.groups.some((group) => {
            const groupId =
              group.value?.value?.value || group.value?.value || group.value;
            return value.includes(groupId);
          });
        }

        // Handle type filter
        if (key === "type") {
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
    setAllEvents(events);
  }, []);

  const loadCases = useCallback(async () => {
    const loadedCases = await getAllCases();
    setCases(loadedCases);
    return loadedCases;
  }, []);

  const loadGroups = useCallback(async () => {
    const loadedGroups = await getAll("groups");
    setGroups(loadedGroups);
  }, []);

  // Apply filters whenever filters or events change
  useEffect(() => {
    filterTimelineData();
  }, [filterTimelineData, filters, allEvents, ascending]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadEvents(), loadCases(), loadGroups()]);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [loadEvents, loadCases, loadGroups]);

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
