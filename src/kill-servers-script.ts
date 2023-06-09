import { NS } from '@ns';
import { SERVER_NAME_PREFIX } from 'const/servers';

/** @param {NS} ns */
export async function main(ns: NS) {
  const servers = ns.getPurchasedServers().filter((el) => el.startsWith(SERVER_NAME_PREFIX));
  for (const server of servers) {
    ns.killall(server);
  }
}
