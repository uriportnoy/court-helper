import React, { useState } from "react";
import { Button } from "primereact/button";
import { FileText } from "lucide-react";
import PDFViewerDesktop from "./PDFViewerDesktop";
import PDFViewerMobile from "./PDFViewerMobile";
import styled from "styled-components";
import { ItemMenuProps } from "../ItemMenu";

interface PDFViewerProps {
  url: string;
  title?: string;
  className?: string;
  type: string;
  item: ItemMenuProps;
  contentView?: boolean;
}
export default function PDFViewer({
  url,
  title = "PDF Document",
  className = "",
  type,
  item,
  contentView
}: PDFViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile] = useState(
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  );

  // const PdfViewer = isMobile ? PDFViewerMobile : PDFViewerDesktop;
  if (contentView) {
    return (
      <PDFViewerDesktop
        isOpen
        onClose={() => setIsOpen(false)}
        url={url}
        title={title}
        item={item}
        contentView={contentView}
      />
    );
  }
  return (
    <>
      <ViewButton onClick={() => setIsOpen(true)} data-type={type}>
        <FileText className="w-4 h-4" />
        {title}
      </ViewButton>
      <PDFViewerDesktop
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        url={url}
        title={title}
        item={item}
      />
    </>
  );
}

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
