import React, { useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ContextMenu } from "primereact/contextmenu";
import { MenuItem } from "primereact/menuitem";
import PDFViewer from "../PDFViewer";
import styled from "styled-components";
import { FileURL } from "timeline/types";
import { ItemMenuProps } from "../ItemMenu.tsx";
import { getCurrentDevice } from "../PDFViewer/utils/index.ts";
import { downloadPDF } from "../PDFComponent/utils";

interface PDFButtonProps extends FileURL {
  item: ItemMenuProps;
}

const PDFButton = ({ url, label, type, date, item }: PDFButtonProps) => {
  const [visible, setVisible] = React.useState(false);
  const contextMenuRef = useRef<ContextMenu>(null);
  
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  const contextMenuItems: MenuItem[] = [
    {
      label: 'הורד קובץ',
      icon: 'pi pi-download',
      command: () => downloadPDF(url, label || 'document', item),
    },
    {
      label: 'פתח בלשונית חדשה',
      icon: 'pi pi-external-link',
      command: () => window.open(url, '_blank'),
    },
    {
      label: 'העתק קישור',
      icon: 'pi pi-copy',
      command: () => {
        navigator.clipboard.writeText(url).then(() => {
          // Could show a toast notification here
          console.log('URL copied to clipboard');
        }).catch(err => {
          console.error('Failed to copy URL:', err);
        });
      },
    },
    {
      separator: true,
    },
    {
      label: 'הצג PDF',
      icon: 'pi pi-eye',
      command: () => setVisible(true),
    },
  ];

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    contextMenuRef.current?.show(event);
  };

  if (!url) return null;
  const size = getCurrentDevice() === "mobile" ? 100 : 90;
  
  return (
    <>
      <ViewButton
        onClick={() => setVisible(true)}
        onContextMenu={handleRightClick}
        icon="pi pi-file-pdf"
        label={label || "View PDF"}
        data-type={type}
      />
      
      <ContextMenu
        ref={contextMenuRef}
        model={contextMenuItems}
      />
      
      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        header={`${label} ${date}` || "PDF Document"}
        maximizable
        style={{ width: `${size}vw`, height: `${size}vh` }}
        contentStyle={{ height: `calc(${size}vh - 6rem)`, padding: 0 }}
      >
        <PDFViewer url={url} item={item} type={type} label={label} />
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
  
  /* Add cursor context indicator */
  cursor: pointer;
  position: relative;
  
  &:hover::after {
    content: '';
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    background: var(--primary-500);
    border-radius: 50%;
    opacity: 0.7;
  }
`;

export default PDFButton;