import { useAppContext } from '../Context';
import { deleteEvent } from '../firebase/events';
import { FormDialog } from './AddNewEvent';
import { Dialog } from 'primereact/dialog';
import { Menu } from 'primereact/menu';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ItemMenu = React.forwardRef((props, ref) => {
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
        style={{ width: "50vw" }}
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

ItemMenu.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  content: PropTypes.string,
  date: PropTypes.string,
  fileURL: PropTypes.array,
};

ItemMenu.displayName = 'ItemMenu';

export default ItemMenu;