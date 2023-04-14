import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
	const target = ns.args[0] as string;
	const secThresh = ns.args[1] as number;
	const moneyThresh = ns.args[2] as number;
	const numberOfThread = ns.args[3] as number;
	let securityLevel = ns.getServerSecurityLevel(target);
	let serverMoney = ns.getServerMoneyAvailable(target);
	let moneyOk = serverMoney > moneyThresh;
	let secOk = securityLevel < secThresh;
	while (moneyOk && secOk) {
		await ns.hack(target, { threads: numberOfThread });
		securityLevel = ns.getServerSecurityLevel(target);
		serverMoney = ns.getServerMoneyAvailable(target);
		moneyOk = serverMoney > moneyThresh;
		secOk = securityLevel < secThresh;
	}
}