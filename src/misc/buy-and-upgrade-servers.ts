import { NS } from "@ns";
import { MAX_SERVER_NUM, SERVER_GB } from 'const/files';

/** @param {NS} ns */
export async function main(ns: NS) {
	const purch = ns.getPurchasedServers();
	for (let server of purch) {
		const serverRam = ns.getServerMaxRam(server);
		if (serverRam != SERVER_GB) {
			//ns.tprint('dry run upgrade');
			ns.upgradePurchasedServer(server, SERVER_GB);
		}
	}
	for (let count = purch.length; count < MAX_SERVER_NUM; count++) {
		//ns.tprint('dry run buy');
		ns.purchaseServer('srv-' + (count + 1), SERVER_GB);
	}
}