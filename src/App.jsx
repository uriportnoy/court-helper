import LoginWrapper from "./LoginWrapper";
import { default as TimelineAppOld } from "./timeline/App";
import { default as PDFCreator } from "./pdfCreator/App";
import { default as TimelineApp } from "./theTimeline";
import Cases from "./timeline/components/Cases";
import { Menubar } from "primereact/menubar";
import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { Toaster } from "sonner";

const PDF = "PDF";
const TIMELINE = "Timeline";
const CASES = "Cases";
const TIMELINE_OLD = "TimelineOld";

function MainApp({ logout }) {
  const [selection, setSelection] = useState(TIMELINE);
  const items = [
    {
      label: "ציר זמן",
      icon: "pi pi-calendar",
      disabled: selection === TIMELINE,
      command: () => setSelection(TIMELINE),
    },
    {
      label: "ציר זמן ישן",
      icon: "pi pi-calendar",
      disabled: selection === TIMELINE_OLD,
      command: () => setSelection(TIMELINE_OLD),
    },
    {
      label: "תיקים",
      icon: "pi pi-folder",
      disabled: selection === CASES,
      command: () => setSelection(CASES),
    },
    {
      label: "PDF",
      icon: "pi pi-file-pdf",
      disabled: selection === PDF,
      command: () => setSelection(PDF),
    },
    {
      label: "התנתק",
      icon: "pi pi-sign-out",
      command: logout,
      className: "sign-out-button",
    },
  ];

  return (
    <AppWrapper>
      <Toaster />
      <StyledMenubar
        model={items}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm  shadow-sm"
        id="topbar-body-anchor"
      />
      <MainContent>
        {selection === TIMELINE && <TimelineApp />}
        {selection === TIMELINE_OLD && <TimelineAppOld />}
        {selection === CASES && <Cases />}
        {selection === PDF && <PDFCreator />}
      </MainContent>
    </AppWrapper>
  );
}

MainApp.propTypes = {
  logout: PropTypes.func.isRequired,
};

const AppWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--surface-50);
`;

const MainContent = styled.main`
  margin: 0 auto;
`;

const StyledMenubar = styled(Menubar)`
  background: var(--surface-0);
  border: none;
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  .p-menuitem-link {
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-md);
    transition: all var(--transition-fast);

    &:hover {
      background-color: var(--surface-100);
    }

    &:active {
      background-color: var(--surface-200);
    }
  }

  .p-menuitem-icon {
    color: var(--primary-600);
  }

  .p-menuitem-text {
    color: var(--surface-700);
    font-weight: 500;
  }

  .sign-out-button {
    .p-menuitem-link {
      color: var(--surface-700);

      &:hover {
        color: var(--primary-600);
        background-color: var(--surface-100);
      }
    }
  }

  @media (max-width: 768px) {
    padding: var(--spacing-sm);

    .p-menuitem-link {
      padding: var(--spacing-sm);
    }
  }
`;

const App = () => (
  <LoginWrapper>{({ logout }) => <MainApp logout={logout} />}</LoginWrapper>
);

export default App;
