import { NS } from '@ns';
import { loadTargetNames } from 'utils/target-loader';

/** @param {NS} ns */
export async function main(ns: NS) {
  const servers = ns.getPurchasedServers();
  servers.push(...(await loadTargetNames(ns)));
  for (const server of servers) {
    ns.killall(server);
  }
  ns.killall('home', true);
}
