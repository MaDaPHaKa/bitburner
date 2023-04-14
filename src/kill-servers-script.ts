import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
	const servers = ns.getPurchasedServers();
	ns.killall('home', true);
	for (let server of servers) {
		ns.killall(server);
	}
}