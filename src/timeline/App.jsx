import "../style.css";
import VerticalTimeline from "./VerticalTimeline";
import VerticalTimelineElement from "./VerticalTimelineElement";
import styles from "./styles.module.scss";
import "./firebase";
import Center from "../Center";
import { Provider } from "./Context";
import TopBar from "./components/TopBar";
import useTimelineApp from "./useTImelineApp";

function TimelineApp() {
  const { timelineData, isLoaded, filters, setFilters, contextData } =
    useTimelineApp();

  if (!isLoaded) {
    return <Center>Loading...</Center>;
  }
  console.log("timelineData", timelineData);
  return (
    <Provider value={contextData}>
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
