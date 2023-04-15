import { NS } from "@ns";
import { SERVER_NAME_PREFIX } from "const/files";

export class ScanResult {
  ns: NS;
  allServers: string[] = [];
  hackable: string[] = [];

  constructor(ns: NS) {
    this.ns = ns;
    this.scanAndCheckNetwork();
  }

  scanAndCheckNetwork(): void {
    let device = "home";
    this.scan(device);
  }

  private scan(device: string, depth = 1, maxDepth = Infinity) {
    if (depth > maxDepth) return {};
    const scanTargets = this.ns.scan(device);
    const localTargets: string[] = [];
    scanTargets.forEach((newDevice) => {
      const alreadyThere = this.allServers.includes(newDevice);
      const canHack = this.nukeServer(
        this.ns,
        newDevice,
        this.ns.getHostname()
      );
      const isMine =
        newDevice === "home" || newDevice.startsWith(SERVER_NAME_PREFIX);
      const profitable = this.ns.getServerMaxMoney(newDevice) > 0;
      if (!alreadyThere && !isMine) {
        localTargets.push(newDevice);
        this.allServers.push(newDevice);
        if (canHack && profitable) this.hackable.push(newDevice);
      }
    });
    for (let target of localTargets) {
      this.scan(target, depth + 1);
    }
    return;
  }

  nukeServer(ns: NS, target: string, runningHost: string) {
    if (ns.hasRootAccess(target)) return true;
    const reqHackLevel = ns.getServerRequiredHackingLevel(target);
    const myHackLevel = ns.getHackingLevel();
    if (reqHackLevel > myHackLevel) return false;
    const portRequired = ns.getServerNumPortsRequired(target);
    const cracks = [];
    if (ns.fileExists("brutessh.exe", runningHost)) {
      cracks.push(ns.brutessh);
    }
    if (ns.fileExists("ftpcrack.exe", runningHost)) {
      cracks.push(ns.ftpcrack);
    }
    if (ns.fileExists("httpworm.exe", runningHost)) {
      cracks.push(ns.httpworm);
    }
    if (ns.fileExists("relaysmtp.exe", runningHost)) {
      cracks.push(ns.relaysmtp);
    }
    if (ns.fileExists("sqlinject.exe", runningHost)) {
      cracks.push(ns.sqlinject);
    }
    if (portRequired > cracks.length) {
      ns.print("cannot crack ", target);
      return false;
    }
    for (let crack of cracks) crack(target);
    // Get root access to target server
    ns.print("cracked ", target);
    ns.nuke(target);
    return true;
  }
}
