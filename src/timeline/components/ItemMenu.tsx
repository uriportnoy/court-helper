import { useAppContext } from "timeline/Context";
import { deleteEvent } from "../firebase/events";
import { FormDialog } from "./AddNewEvent";
import { Dialog } from "primereact/dialog";
import { Menu } from "primereact/menu";
import React, { useState } from "react";

export interface ItemMenuProps {
  id: string;
  type: string;
  title: string;
  content: string;
  date: string;
  fileURL: string[];
}

const ItemMenu = React.forwardRef((props: ItemMenuProps, ref) => {
  const [visible, setVisible] = useState(false);
  const { loadEvents } = useAppContext();
  const openEditDialog = () => {
    setVisible(true);
  };
  return (
    <>
      <Dialog
        header="Header"
        visible={visible}
        style={{
          width: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
            ? "48vw"
            : "100vw",
        }}
        onHide={() => {
          if (!visible) {
            return;
          }
          setVisible(false);
        }}
      >
        <FormDialog eventData={props} close={() => setVisible(false)} />
      </Dialog>
      <Menu
        model={[
          {
            label: "Options",
            items: [
              {
                label: "Edit",
                icon: "pi pi-pencil",
                command: openEditDialog,
              },
              {
                label: "Remove",
                icon: "pi pi-times",
                command: () => {
                  deleteEvent(props).then(loadEvents);
                },
              },
            ],
          },
        ]}
        popup
        ref={ref}
        id="popup_menu_left"
      />
    </>
  );
});

ItemMenu.displayName = "ItemMenu";

export default ItemMenu;
