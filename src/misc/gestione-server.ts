import { NS } from '@ns';
import {
  FARM_SERVER_GB,
  MAX_FARMER_SERVER_NUM,
  MAX_RAM,
  MAX_SERVER_NUM,
  SERVER_GB_WANTED,
  SERVER_NAME_PREFIX,
  XP_FARMER_SERVER_PREFIX,
} from 'const/files';

/** @param {NS} ns */
export async function main(ns: NS) {
  const purch = ns.getPurchasedServers().filter((el) => el.startsWith(SERVER_NAME_PREFIX));
  const farm = ns.getPurchasedServers().filter((el) => el.startsWith(XP_FARMER_SERVER_PREFIX));
  let totalCost = 0;
  let farmingCost = 0;
  let serverCost = 0;

  for (let server of purch) {
    if (server == 'home') continue;
    const serverRam = ns.getServerMaxRam(server);
    const cost = ns.getPurchasedServerUpgradeCost(server, SERVER_GB_WANTED);
    if (cost > 0) {
      serverCost += cost;
      totalCost += cost;
    }
  }
  for (let count = purch.length; count < MAX_SERVER_NUM; count++) {
    const cost = ns.getPurchasedServerCost(SERVER_GB_WANTED);
    if (cost > 0) {
      serverCost += cost;
      totalCost += cost;
    }
  }

  for (let server of farm) {
    if (server == 'home') continue;
    const serverRam = ns.getServerMaxRam(server);
    const cost = ns.getPurchasedServerUpgradeCost(server, FARM_SERVER_GB);
    if (cost > 0) {
      farmingCost += cost;
      totalCost += cost;
    }
  }
  for (let count = farm.length; count < MAX_FARMER_SERVER_NUM; count++) {
    const cost = ns.getPurchasedServerCost(FARM_SERVER_GB);
    if (cost > 0) {
      farmingCost += cost;
      totalCost += cost;
    }
  }

  ns.tprint(
    'costo per arrivare a ' + MAX_SERVER_NUM + ' server da ' + SERVER_GB_WANTED + ' : ',
    ns.formatNumber(serverCost, 3)
  );
  ns.tprint(
    'costo per arrivare a ' + MAX_FARMER_SERVER_NUM + ' xp farm server da ' + FARM_SERVER_GB + ' : ',
    ns.formatNumber(farmingCost, 3)
  );
  ns.tprint('costo totale: ', ns.formatNumber(totalCost, 3));
  ns.tprint('costo server a massima ram : ', ns.formatNumber(ns.getPurchasedServerCost(MAX_RAM), 3));
}
