import React from "react";
import { killOldScript } from '@lib/utils'
import { ServerlistUI } from "./ServerListUI";
import { DrawerButton } from "./ui/DrawerButton";
import { createMountingPoint } from "@lib/MountingPoint";
import { bbContainer, bbContentContainer, bbDrawer, doc } from "@lib/bbElements";

export async function main(ns: NS) {
  killOldScript(ns, ns.getScriptName(), 'home');

  deleteElement('serverlist-drawer-button-container');
  const drawerButton = doc.createElement('div');
  drawerButton.id = 'serverlist-drawer-button-container';

  bbDrawer().prepend(drawerButton);

  deleteElement('serverlist-drawer-button');
  const mpButton = createMountingPoint(ns);
  mpButton.mount(<DrawerButton bbContentContainer={bbContentContainer()} />, drawerButton);

  mpButton.addCleanup(() => {
    deleteElement('serverlist-drawer-button-container');
  });

  const mpApp = createMountingPoint(ns);
  deleteElement('serverlist-content-container');
  const serverlistContentContainer = doc.createElement('div');
  serverlistContentContainer.id = 'serverlist-content-container';
  serverlistContentContainer.style.display = 'none';
  serverlistContentContainer.style.width = '100%';
  serverlistContentContainer.style.height = '100vh';
  bbContainer().appendChild(serverlistContentContainer);

  ns.atExit(() => {
    mpButton.cleanup();
    mpApp.cleanup();
  });
  return mpApp.mount(<ServerlistUI />, serverlistContentContainer);
}

function deleteElement(id: string) {
  const el = doc.getElementById(id);
  if (el) el.remove();
}
