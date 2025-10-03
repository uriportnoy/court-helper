import "../style.css";
import VerticalTimeline from "./VerticalTimeline";
import VerticalTimelineElement from "./VerticalTimelineElement";
import styles from "./styles.module.scss";
import "./firebase";
import Center from "../Center";
import { Provider } from "./Context";
import TopBar from "./components/TopBar";
import useTimelineApp from "./useTImelineApp";
import AppLoader from "../common/AppLoader";

function TimelineApp() {
  const {
    timelineData,
    isLoaded,
    filters,
    setFilters,
    contextData,
    ascending,
    setAscending,
  } = useTimelineApp();

  if (!isLoaded) {
    return (
      <Center>
        <AppLoader text="טוען נתוני ציר זמן..." size={100} />
      </Center>
    );
  }
  console.log("timelineData", timelineData);
  return (
    <Provider value={contextData}>
      <div className={styles.app}>
        <TopBar
          filters={filters}
          setFilters={setFilters}
          ascending={ascending}
          setAscending={setAscending}
        />
        {timelineData.length === 0 ? (
          <Center>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <i className="pi pi-calendar-times" style={{ fontSize: '4rem', color: '#6b7280' }} />
              </div>
              <h3 className={styles.emptyTitle}>אין נתונים להצגה</h3>
              <p className={styles.emptyMessage}>
                לא נמצאו אירועים בציר הזמן. נסה לשנות את הסינון או להוסיף אירועים חדשים.
              </p>
            </div>
          </Center>
        ) : (
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
        )}
      </div>
    </Provider>
  );
}

export default TimelineApp;
