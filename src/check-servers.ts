import { NS } from "@ns";
import {
	SERVERS_FILENAME
} from 'const/files';
import { FileHandler } from 'files/filehandler';

/** @param {NS} ns */
export async function main(ns: NS) {
	const handler = new FileHandler(ns, SERVERS_FILENAME);
	const servers = await handler.read();
	for (let server of servers) {
		ns.tprint('-------');
		ns.tprint('server: ', server);
		ns.tprint('MinSec: ', ns.getServerMinSecurityLevel(server));
		ns.tprint('CurSec: ', ns.getServerSecurityLevel(server));
		ns.tprint('MaxMoney: ', ns.formatNumber(ns.getServerMaxMoney(server), 3));
		ns.tprint('CurMoney: ', ns.formatNumber(ns.getServerMoneyAvailable(server), 3));
		ns.tprint('MinHackLevel: ', ns.formatNumber(ns.getServerRequiredHackingLevel(server), 3));
		ns.tprint('-------');
	}
}