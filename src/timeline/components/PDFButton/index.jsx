import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import PDFViewer from '../PDFViewer';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const PDFButton = ({ url, label }) => {
    const [visible, setVisible] = React.useState(false);

    if (!url) return null;

    return (
        <>
            <ViewButton
                onClick={() => setVisible(true)}
                icon="pi pi-file-pdf"
                label={label || 'View PDF'}
            />

            <Dialog
                visible={visible}
                onHide={() => setVisible(false)}
                header="PDF Document"
                maximizable
                style={{ width: '90vw', height: '90vh' }}
                contentStyle={{ height: 'calc(90vh - 6rem)', padding: 0 }}
            >
                <PDFViewer url={url} />
            </Dialog>
        </>
    );
};

const ViewButton = styled(Button)`
  background: var(--primary-600);
  border: none;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-700) !important;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  .p-button-icon {
    font-size: 1rem;
  }
`;

PDFButton.propTypes = {
    url: PropTypes.string,
    label: PropTypes.string
};

export default PDFButton;