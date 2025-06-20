import React, { useContext, useEffect, useState } from "react";
import { doc } from "@lib/bbElements";
import { CleanupContext } from "@lib/MountingPoint";

const classNameMaps = {
  drawerButton: {
    active: "css-jycw4o-listitem-active",
    inactive: "css-1ep7lp0-listitem",
  },
  icon: {
    active: "css-wz14si",
    inactive: "css-16w0lv1",
  },
  text: {
    active: "css-nb0kay",
    inactive: "css-1dosjox",
  },
};

function toggleStyle(btnElement: 'drawerButton' | 'icon' | 'text', active: boolean) {
  return classNameMaps[btnElement][active ? 'active' : 'inactive'];
}

function toggleElement(btnElement: 'drawerButton' | 'icon' | 'text', active: boolean) {
  const elements = doc.querySelectorAll<HTMLElement>(`.MuiCollapse-root .${toggleStyle(btnElement, !active)}`);

  elements.forEach((element) => {
    if (element.id === 'serverlist-drawer-button') return;

    element.classList.remove(classNameMaps[btnElement].active);
    element.classList.add(classNameMaps[btnElement].inactive);
  });
}

export function DrawerButton({bbContentContainer}: {bbContentContainer: HTMLElement}) {
  const cleanUp = useContext(CleanupContext);
  const [open, setOpen] = useState(false);

  const [bbContainerStyle, setBBContainerStyle] = useState('');

  const allOtherButtons = doc.querySelectorAll<HTMLElement>(`.${classNameMaps.drawerButton.inactive}`);
  const handler = (button) => {
    button.addEventListener('click', () => {
      setOpen(false);
    });
  };
  allOtherButtons.forEach(handler);
  cleanUp(() => {
    allOtherButtons.forEach((button) => {
      button.removeEventListener('click', handler);
    });
  });

  useEffect(() => {
    const serverlistContentContainer = doc.querySelector<HTMLElement>('#serverlist-content-container');

    toggleElement('drawerButton', !open);
    toggleElement('icon', !open);
    toggleElement('text', !open);

    if(open) {
      setBBContainerStyle(bbContentContainer.style.display);
      bbContentContainer.style.display = 'none';
      serverlistContentContainer.style.display = 'block';
    } else {
      bbContentContainer.style.display = bbContainerStyle;
      serverlistContentContainer.style.display = 'none';
    }
  }, [open]);

  return (
    <div id="serverlist-drawer-button" className={[
      "MuiButtonBase-root MuiListItem-root MuiListItem-gutters MuiListItem-padding MuiListItem-button",
      open ? classNameMaps.drawerButton.active : classNameMaps.drawerButton.inactive
    ].join(' ')} onClick={() => setOpen(true)}>
      <ButtonStyled open={open} />
    </div>
  );
}

function ButtonStyled({open}: {open: boolean}) {
  return (
    <>
      <div className="MuiListItemIcon-root css-1f8bwsm">
        <svg
          className={[
            "MuiSvgIcon-root MuiSvgIcon-colorPrimary MuiSvgIcon-fontSizeMedium",
            open ? classNameMaps.icon.active : classNameMaps.icon.inactive
          ].join(' ')}
          viewBox="0 0 20 20"
          focusable="false" aria-hidden="true" aria-label="Active Scripts"
        >
          <g id="Page-1" stroke-width="1" fill-rule="evenodd">
            <g id="icon-shape">
              <path d="M0,2 L20,2 L20,18 L0,18 L0,2 Z M2,4 L18,4 L18,16 L2,16 L2,4 Z M6,4 L8,4 L8,16 L6,16 L6,4 Z M12,4 L14,4 L14,16 L12,16 L12,4 Z" id="Combined-Shape"></path>
            </g>
          </g>
        </svg>
      </div>
      <div className="MuiListItemText-root css-1tsvksn">
        <p className={[
          "MuiTypography-root MuiTypography-body1",
          open ? classNameMaps.text.active : classNameMaps.text.inactive
        ].join(' ')}>
          Serverlist
        </p>
      </div>
      <span className="MuiTouchRipple-root css-w0pj6f"></span>
    </>
  );
}
