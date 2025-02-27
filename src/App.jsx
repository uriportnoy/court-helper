import LoginWrapper from './LoginWrapper';
import { default as TimelineApp } from './timeline/App';
import { default as PDFCreator } from './pdfCreator/App';
import { Menubar } from 'primereact/menubar';
import { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const PDF = 'PDF';
const TIMELINE = 'Timeline';

function MainApp({ logout }) {
  const [selection, setSelection] = useState(TIMELINE);
  const items = [
    {
      label: 'PDF',
      icon: 'pi pi-file-pdf',
      disabled: selection === PDF,
      command: () => setSelection(PDF),
    },
    {
      label: 'Timeline',
      icon: 'pi pi-calendar',
      disabled: selection === TIMELINE,
      command: () => setSelection(TIMELINE),
    },
    {
      label: 'Sign out',
      icon: 'pi pi-sign-out',
      command: logout,
      className: 'sign-out-button',
    },
  ];

  return (
    <AppWrapper>
      <StyledMenubar model={items} />
      <MainContent>
        {selection === TIMELINE ? <TimelineApp /> : <PDFCreator />}
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
  padding: var(--spacing-md);
  max-width: 1400px;
  margin: 0 auto;
`;

const StyledMenubar = styled(Menubar)`
  background: var(--surface-0);
  border: none;
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-sm) var(--spacing-lg);

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
  <LoginWrapper>
    {({ logout }) => <MainApp logout={logout} />}
  </LoginWrapper>
);

export default App;