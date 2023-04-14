import { NS } from "@ns";
import { SERVERS_DETAIL_FILENAME, SERVERS_FILENAME } from "const/files";
import { FileHandler } from "files/filehandler";
import { ServerInfo } from "utils/server-info";

/** @param {NS} ns */
export async function main(ns: NS) {
  while (true) {
    let handler = new FileHandler(ns, SERVERS_FILENAME);
    const servers = await handler.read();
    let serverInfo: ServerInfo[] = [];
    for (let target of servers) {
      const minSecurity = ns.getServerMinSecurityLevel(target);
      const maxMoney = ns.getServerMaxMoney(target);
      const serverMoney = ns.getServerMoneyAvailable(target);
      const serverSecurity = ns.getServerSecurityLevel(target);
      const growth = ns.getServerGrowth(target);
      const growt = ns.getGrowTime(target);
      const weakent = ns.getWeakenTime(target);
      const hackA = ns.hackAnalyze(target);
      const hackChance = ns.hackAnalyzeChance(target);
      const hackT = ns.getHackTime(target);
      const hackReq = ns.getServerRequiredHackingLevel(target);
      const infoObj = new ServerInfo();
      infoObj.name = target;
      infoObj.minSecurity = minSecurity;
      infoObj.maxMoney = maxMoney;
      infoObj.growValue = growth;
      infoObj.growTm = growt;
      infoObj.weakenTm = weakent;
      infoObj.hackChance = hackChance;
      infoObj.prepped =
        serverSecurity == minSecurity && serverMoney == maxMoney;
      infoObj.hackValue = hackA;
      infoObj.hackTm = hackT;
      infoObj.minHackLevel = hackReq;
      infoObj.currHackLevel = ns.getHackingLevel();
      infoObj.calcolaScore();
      serverInfo = [...serverInfo, infoObj];
    }
    handler = new FileHandler(ns, SERVERS_DETAIL_FILENAME);
    await handler.write(serverInfo, "w");
    await ns.sleep(500);
  }
}
