import { NS } from '@ns';
import { FILES_TO_COPY } from 'const/scripts';

/** @param {NS} ns */
export async function main(ns: NS) {
  const servers = ns.getPurchasedServers();
  for (const server of servers) {
    ns.scp(FILES_TO_COPY, server);
  }
}
