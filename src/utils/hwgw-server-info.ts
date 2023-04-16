import { NS } from '@ns';
import { ServerInfo } from 'utils/server-info';

export class HwgwServerInfo {
  name: string;
  minSecurity: number;
  maxMoney: number;
  currentSec: number = 100;
  currentMoney: number = 0;
  prepped = false;
  constructor(ns: NS, target: ServerInfo) {
    this.name = target.name;
    this.minSecurity = target.minSecurity;
    this.maxMoney = target.maxMoney;
    this.ricalcolaVariabili(ns);
  }

  ricalcolaVariabili(ns: NS) {
    this.currentSec = ns.getServerSecurityLevel(this.name);
    this.currentMoney = ns.getServerMoneyAvailable(this.name);
    this.prepped = this.currentSec == this.minSecurity && this.currentMoney == this.maxMoney;
  }
}
