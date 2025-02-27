import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

interface DialogBtnProps {
  children: React.ReactNode;
  title: string;
  dialogClassName?: string;
  btnClassName?: string;
  header?: string;
  isOpen?: boolean;
  onClick?: () => { preventShow: boolean };
  onClose?: () => void;
  type: "mine" | "notMine" | "court" | "trd-party";
}
export default function DialogBtn({
  children,
  title,
  dialogClassName,
  btnClassName,
  header = "Header",
  isOpen,
  onClick,
  onClose,
  type,
}: DialogBtnProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen !== null && isOpen !== undefined && isOpen !== visible) {
      setVisible(isOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TypeButton
        label={title}
        data-type={type}
        onClick={() => {
          let preventShow = false;
          if (onClick) {
            preventShow = onClick()?.preventShow || false;
          }
          if (!preventShow) {
            setVisible(true);
          }
        }}
        className={btnClassName}
      />
      <Dialog
        header={header}
        visible={visible}
        className={dialogClassName}
        onHide={() => {
          if (!visible) {
            return;
          }
          setVisible(false);
          onClose && onClose();
        }}
      >
        {visible && children}
      </Dialog>
    </>
  );
}

const TypeButton = styled(Button)`
  background: #333;
  color: #eee;
  border-radius: 4px;
  padding-inline: 8px;
  display: flex;
  justify-content: center;
  border: 0;
  margin: 2px;
`;
