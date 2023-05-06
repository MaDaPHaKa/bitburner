import { NS, Server } from '@ns';
import { HOME_FREE_RAM_TO_KEEP } from 'const/servers';

export class ServerData {
  ns: NS;
  name: string;
  freeRam: number;
  maxRam: number;
  cores = 1;

  constructor(ns: NS, name: string) {
    this.ns = ns;
    this.name = name;
    const nsServer: Server = ns.getServer(name);
    this.maxRam = nsServer.maxRam;
    this.freeRam = this.maxRam - this.ns.getServerUsedRam(name);
    this.cores = nsServer.cpuCores;
  }

  calcolaThreadRunnabili(costoScript: number): number {
    return this.freeRam > 0 ? Math.floor(this.freeRam / costoScript) : 0;
  }

  aggiornaServer() {
    this.maxRam = this.ns.getServerMaxRam(this.name);
    if (this.name == 'home') this.freeRam = this.maxRam - this.ns.getServerUsedRam(this.name) - HOME_FREE_RAM_TO_KEEP;
    else this.freeRam = this.maxRam - this.ns.getServerUsedRam(this.name);
  }
}
