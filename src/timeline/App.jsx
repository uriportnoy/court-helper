import "../style.css";
import VerticalTimeline from "./VerticalTimeline";
import VerticalTimelineElement from "./VerticalTimelineElement";
import styles from "./styles.module.scss";
import { useCallback, useEffect, useState } from "react";
import "./firebase";
import Center from "../Center";
import { Provider } from "./Context";
import TopBar from "./components/TopBar";
import { getAllCases } from "./firebase/cases";
import { getAll } from "./firebase/crud";
import { getEvents } from "./firebase/events";
import get from "lodash/get";
import { useImmer } from "use-immer";

function TimelineApp() {
  const [allEvents, setAllEvents] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cases, setCases] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filters, setFilters] = useImmer({});

  const filterTimelineData = useCallback(() => {
    if (!filters || Object.keys(filters).length === 0) {
      setTimelineData(allEvents);
      return;
    }

    const filteredData = allEvents.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        // Handle text search
        if (key === "text") {
          if (!value || value.length <= 2) return true;
          
          const searchFields = ["title", "content", "caseNumber", "subTitle"];
          return searchFields.some(field => {
            const fieldValue = item[field];
            return fieldValue && fieldValue.toLowerCase().includes(value.toLowerCase());
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
          
          return item.groups.some(group => {
            const groupId = group.value?.value?.value || group.value?.value || group.value;
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
  }, [filters, allEvents]);

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
  }, [filterTimelineData, filters, allEvents]);

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

  if (!isLoaded) {
    return <Center>Loading...</Center>;
  }

  return (
    <Provider value={{ loadEvents, allEvents, cases, groups, loadCases, timelineData }}>
      <div className={styles.app}>
        <TopBar filters={filters} setFilters={setFilters} />
        <VerticalTimeline>
          {timelineData.map((item) => (
            <VerticalTimelineElement key={item.id} item={item}>
              <div className={styles.contentWrapper}>
                <h3 className="vertical-timeline-element-title">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <h4 className="vertical-timeline-element-subtitle">
                    {item.subtitle}
                  </h4>
                )}
                {item.description && <p>{item.description}</p>}
                <div
                  dangerouslySetInnerHTML={{ __html: item.content }}
                  className={styles.content}
                />
              </div>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </Provider>
  );
}

export default TimelineApp;