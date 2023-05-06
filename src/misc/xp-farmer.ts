import { NS } from '@ns';
import { WG_COST } from 'const/hwgw';
import { XP_FARM_SCRIPT_NAME } from 'const/scripts';
import { FARM_SERVER_GB, XP_FARMER_SERVER_PREFIX } from 'const/servers';
import { ServerInfo } from 'utils/server-info';
import { loadTargetInfo } from 'utils/target-loader';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  const servers = ns.getPurchasedServers().filter((el) => el.startsWith(XP_FARMER_SERVER_PREFIX));
  const targets = ((await loadTargetInfo(ns)) as ServerInfo[]).sort(function (a, b) {
    return b.farmScore - a.farmScore;
  });
  let i = 0;
  for (let farmer of servers) {
    ns.exec(XP_FARM_SCRIPT_NAME, farmer, Math.floor(FARM_SERVER_GB / WG_COST), targets[0].name);
    i++;
  }
}
