import { ServerlistUI } from "@/servers/home/tools/Serverlist/ServerListUI";
import { createMountingPoint } from "@lib/MountingPoint";
import React from "react";

export async function main(ns: NS) {
  const windowApp = createMountingPoint(ns);
  ns.ui.setTailTitle('Serverlist');

  ns.atExit(() => windowApp.cleanup());

  return windowApp.mount(<ServerlistUI />);
}
