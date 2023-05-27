import { NS } from '@ns';
import { ServerInfo } from 'utils/server-info';

export class HwgwServerInfo {
  name: string;
  minSecurity: number;
  maxMoney: number;
  hackChance: number;
  currentSec = 100;
  currentMoney = 0;
  prepped = false;
  score = -1;
  hwgwScore = -1;
  newHwgwScore = -1;
  constructor(ns: NS, target: ServerInfo) {
    this.name = target.name;
    this.minSecurity = target.minSecurity;
    this.maxMoney = target.maxMoney;
    this.score = target.score;
    this.hwgwScore = target.hwgwScore;
    this.hackChance = target.hackChance;
    this.ricalcolaVariabili(ns);
  }

  ricalcolaVariabili(ns: NS) {
    this.currentSec = ns.getServerSecurityLevel(this.name);
    this.currentMoney = ns.getServerMoneyAvailable(this.name);
    this.prepped = this.currentSec == this.minSecurity && this.currentMoney == this.maxMoney;
  }
}
