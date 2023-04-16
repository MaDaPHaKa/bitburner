import { NS } from '@ns';
import { MAX_SERVER_NUM, SERVER_GB, SERVER_NAME_PREFIX } from 'const/files';

/** @param {NS} ns */
export async function main(ns: NS) {
  const purch = ns.getPurchasedServers().filter((el) => el.startsWith(SERVER_NAME_PREFIX));
  for (let server of purch) {
    const serverRam = ns.getServerMaxRam(server);
    if (serverRam != SERVER_GB) {
      //ns.tprint('dry run upgrade');
      ns.upgradePurchasedServer(server, SERVER_GB);
    }
  }
  for (let count = purch.length; count < MAX_SERVER_NUM; count++) {
    //ns.tprint('dry run buy');
    ns.purchaseServer(SERVER_NAME_PREFIX + (count + 1), SERVER_GB);
  }
  ns.exec('/prep/prep-servers.js', 'home', 1);
}
