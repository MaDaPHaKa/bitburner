import { NS } from "@ns";
import { ServerInfo } from "utils/server-info";
const THREAD_COST = 1.75;

export class HgwgTargetManager {
  target: ServerInfo;
  ns: NS;
  constructor(ns: NS, target: ServerInfo) {
    this.target = target;
    this.ns = ns;
  }
}
