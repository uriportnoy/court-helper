import { motion } from "framer-motion";
import React, { useRef } from "react";
import { InView } from "react-intersection-observer";
import styled from "styled-components";
import ItemMenu from "./components/ItemMenu.tsx";
import PDFViewer from "./components/PDFView";
import { formatDate } from "./utils.ts";

const icons = {
  mine: { icon: "home", color: "var(--green-600)" },
  notMine: { icon: "directions", color: "var(--red-600)" },
  court: { icon: "bolt", color: "var(--yellow-600)" },
  "trd-party": { icon: "users", color: "var(--blue-600)" },
};

interface TimelineElementProps {
  children?: React.ReactNode;
  position?: string;
  visible?: boolean;
  item: Record<string, unknown>;
}

const VerticalTimelineElement = ({
  children = "",
  position = "",
  visible = false,
  item,
}: TimelineElementProps) => {
  const menu = useRef(null);
  const {
    id,
    type,
    date,
    fileURL,
    relatedCases,
    relatedEvent,
    relatedDates,
    groups,
    selectedCase,
    caseNumber,
  } = item;

  // Create a date-based ID for scrolling
  const dateId = new Date(date).getFullYear().toString();

  return (
    <InView rootMargin="-40px 0px" threshold={0} triggerOnce>
      {({ inView, ref }) => (
        <TimelineElementWrapper
          ref={ref}
          className={`vertical-timeline-element ${
            position === "left" ? "element-left" : "element-right"
          }`}
          initial={{ opacity: 0, y: 50 }}
          animate={
            inView || visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
          id={`timeline-${dateId}-${id}`}
          data-year={dateId}
          data-id={id}
          data-relation={selectedCase.court}
        >
          <TimelineIcon
            type={type}
            onClick={(event) => menu.current.toggle(event)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className={`pi pi-${icons[type]?.icon}`} />
          </TimelineIcon>
          <ContentCard type={type} data-auto="content-card">
            <ItemMenu ref={menu} {...item} />
            <ItemCourt>
              {selectedCase.court === "שלום" && (
                <CourtBadge level="peace">שלום</CourtBadge>
              )}
              {selectedCase.court === "מחוזי" && (
                <CourtBadge level="district">מחוזי</CourtBadge>
              )}
              {selectedCase.court === "העליון" && (
                <CourtBadge level="supreme">עליון</CourtBadge>
              )}
            </ItemCourt>
            <ContentHeader data-auto="content-header">{children}</ContentHeader>
            {fileURL && fileURL.length > 0 ? (
              <PDFSection>
                <PDFViewer fileURL={fileURL} date={date} item={item} />
              </PDFSection>
            ) : null}
            <MetadataSection>
              <DateDisplay>{formatDate(date)}</DateDisplay>
              <CaseNumber>
                {selectedCase.type} {caseNumber}
              </CaseNumber>
              {relatedCases && relatedCases.length > 0 && (
                <RelatedItems>
                  <RelatedTitle>תיקים קשורים:</RelatedTitle>
                  {relatedCases.map((item) => (
                    <RelatedTag key={item}>{item}</RelatedTag>
                  ))}
                </RelatedItems>
              )}
              {relatedDates && relatedDates.length > 0 && (
                <RelatedItems>
                  <RelatedTitle>תאריכים קשורים:</RelatedTitle>
                  {relatedDates.map((_d) => (
                    <RelatedTag key={`date_${_d}`}>{_d}</RelatedTag>
                  ))}
                </RelatedItems>
              )}
              {groups && groups.length > 0 && (
                <RelatedItems>
                  <RelatedTitle>קבוצות:</RelatedTitle>
                  {groups.map((_d, idx) => (
                    <GroupTag key={`${idx}_${_d.label}`}>{_d.label}</GroupTag>
                  ))}
                </RelatedItems>
              )}
              {relatedEvent && (
                <RelatedItems>
                  <RelatedTitle>אירוע קשור:</RelatedTitle>
                  <RelatedTag
                    onClick={() => scrollAndMarkItem(relatedEvent)}
                    style={{ cursor: "pointer" }}
                  >
                    {relatedEvent}
                  </RelatedTag>
                </RelatedItems>
              )}
            </MetadataSection>
          </ContentCard>
        </TimelineElementWrapper>
      )}
    </InView>
  );
};

function scrollAndMarkItem(relatedEvent: string) {
  const element = document.querySelector(`[data-id="${relatedEvent}"]`);
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.classList.add("highlight");
  setTimeout(() => {
    element.classList.remove("highlight");
  }, 1500);
}

const TimelineElementWrapper = styled(motion.div)`
  position: relative;
  margin: 2em 0;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;

  &.element-left {
    flex-direction: row;
  }

  &.element-right {
    flex-direction: row-reverse;
  }
  &.highlight [data-auto="content-card"] > * {
    background-color: yellow !important;
    transition: all 0.5s;
  }
  @media (max-width: 768px) {
    flex-direction: row !important;
    margin: 1.5em 0;
    gap: 1rem;
  }
`;
const ItemCourt = styled.div`
  position: absolute;
  left: 10px;
  top: 10px;
`;

const CourtBadge = styled.span<{ level: 'peace' | 'district' | 'supreme' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  color: white;
  background-color: ${props => {
    switch (props.level) {
      case 'peace':
        return 'var(--green-600)';
      case 'district':
        return 'var(--blue-600)';
      case 'supreme':
        return 'var(--purple-600)';
      default:
        return 'var(--gray-600)';
    }
  }};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
`;
const TimelineIcon = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${(props) =>
    icons[props.type]?.color || "var(--primary-500)"};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  flex-shrink: 0;
  z-index: 1;

  i {
    color: white;
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;

    i {
      font-size: 1rem;
    }
  }
`;

const ContentCard = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
  border-left: 4px solid
    ${(props) => icons[props.type]?.color || "var(--primary-500)"};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 6px 8px -1px rgba(0, 0, 0, 0.1),
      0 4px 6px -1px rgba(0, 0, 0, 0.06);
  }
`;

const ContentHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--surface-200);
`;

const PDFSection = styled.div`
  padding: 1rem;
  background-color: var(--surface-50);
  border-bottom: 1px solid var(--surface-200);
`;

const MetadataSection = styled.div`
  padding: 1rem 1.5rem;
  background-color: var(--surface-50);
`;

const DateDisplay = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--surface-700);
  margin-bottom: 0.5rem;
`;

const CaseNumber = styled.div`
  display: inline-block;
  background-color: var(--primary-100);
  color: var(--primary-700);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const RelatedItems = styled.div`
  margin-top: 1rem;
`;

const RelatedTitle = styled.div`
  font-size: 0.875rem;
  color: var(--surface-600);
  margin-bottom: 0.5rem;
  text-align: right;
  direction: rtl;
`;

const RelatedTag = styled.span`
  display: inline-block;
  background-color: var(--surface-100);
  color: var(--surface-700);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  margin: 0.25rem;
  font-size: 0.875rem;
`;

const GroupTag = styled(RelatedTag)`
  background-color: var(--yellow-100);
  color: var(--yellow-800);
`;

export default VerticalTimelineElement;
