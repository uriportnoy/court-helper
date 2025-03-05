import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import PDFViewer from "../PDFViewer";
import styled from "styled-components";
import { FileURL } from "timeline/types";

interface PDFButtonProps extends FileURL {}

const PDFButton = ({ url, label, type, date }: PDFButtonProps) => {
  const [visible, setVisible] = React.useState(false);
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  if (!url) return null;
  return (
    <>
      <ViewButton
        onClick={() => setVisible(true)}
        icon="pi pi-file-pdf"
        label={label || "View PDF"}
        data-type={type}
      />
      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        header={`${label} ${date}` || "PDF Document"}
        maximizable
        style={{ width: "90vw", height: "90vh" }}
        contentStyle={{ height: "calc(90vh - 6rem)", padding: 0 }}
      >
        <PDFViewer url={url} />
      </Dialog>
    </>
  );
};

const ViewButton = styled(Button)`
  border: none;
  transition: all 0.2s ease;
  height: 28px;
  border-radius: 2px;
  font-size: 14px;
  padding: 0 0 0 8px;
  gap: 8px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  .p-button-icon {
    font-size: 1rem;
  }
`;

export default PDFButton;
