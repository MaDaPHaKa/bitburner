import { NS } from '@ns';
import { XP_FARMER_SERVER_PREFIX } from './const/files';

/** @param {NS} ns */
export async function main(ns: NS) {
  const servers = ns.getPurchasedServers().filter((el) => el.startsWith(XP_FARMER_SERVER_PREFIX));
  for (let server of servers) {
    ns.killall(server);
  }
}
