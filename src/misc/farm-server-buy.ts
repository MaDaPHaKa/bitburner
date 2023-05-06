import { NS } from '@ns';
import { FARM_SERVER_GB, MAX_FARMER_SERVER_NUM, XP_FARMER_SERVER_PREFIX } from 'const/servers';

/** @param {NS} ns */
export async function main(ns: NS) {
  const purch = ns.getPurchasedServers().filter((el) => el.startsWith(XP_FARMER_SERVER_PREFIX));
  FARM_SERVER_GB;
  for (let server of purch) {
    const serverRam = ns.getServerMaxRam(server);
    if (serverRam != FARM_SERVER_GB) {
      //ns.tprint('dry run upgrade');
      ns.upgradePurchasedServer(server, FARM_SERVER_GB);
    }
  }
  for (let count = purch.length; count < MAX_FARMER_SERVER_NUM; count++) {
    //ns.tprint('dry run buy');
    ns.purchaseServer(XP_FARMER_SERVER_PREFIX + (count + 1), FARM_SERVER_GB);
  }
  ns.exec('/prep/prep-servers.js', 'home', 1);
}
