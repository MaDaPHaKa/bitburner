import { NS } from "@ns";

export class ServerData {
  ns: NS;
  name: string;
  freeRam: number;
  maxRam: number;

  constructor(ns: NS, name: string) {
    this.ns = ns;
    this.name = name;
    this.maxRam = this.ns.getServerMaxRam(name);
    this.freeRam = this.maxRam - this.ns.getServerUsedRam(name);
  }

  calcolaThreadRunnabili(costoScript: number): number {
    return this.freeRam > 0 ? Math.floor(this.freeRam / costoScript) : 0;
  }

  aggiornaServer() {
    if (this.name == "home")
      this.freeRam = this.maxRam - this.ns.getServerUsedRam(this.name) - 20;
    else this.freeRam = this.maxRam - this.ns.getServerUsedRam(this.name);
  }
}
