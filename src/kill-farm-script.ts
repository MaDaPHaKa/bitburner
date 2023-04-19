import { NS } from '@ns';
import { XP_FARMER_SERVER_PREFIX } from './const/files';

/** @param {NS} ns */
export async function main(ns: NS) {
  const servers = ns.getPurchasedServers();
  for (let server of servers) {
    if (server.startsWith(XP_FARMER_SERVER_PREFIX)) ns.killall(server);
  }
}
