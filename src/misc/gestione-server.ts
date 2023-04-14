import { NS } from "@ns";
import { SERVER_GB_WANTED, MAX_SERVER_NUM } from 'const/files';

/** @param {NS} ns */
export async function main(ns: NS) {
	const purch = ns.getPurchasedServers();
	const serverMaxRam = SERVER_GB_WANTED;
	const maxServers = MAX_SERVER_NUM;
	let totalCost = 0;
	for (let server of purch) {
		if (server == 'home')
			continue;
		const serverRam = ns.getServerMaxRam(server);
		totalCost += ns.getPurchasedServerUpgradeCost(server, serverMaxRam);
	}
	for (let count = purch.length; count < maxServers; count++) {
		totalCost += ns.getPurchasedServerCost(serverMaxRam);
	}
	ns.tprint('costo per arrivare a ' + maxServers + ' server da ' + serverMaxRam + ' : ', ns.formatNumber(totalCost, 3));
}