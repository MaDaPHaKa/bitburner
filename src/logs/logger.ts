import { NS } from '@ns';
import { LOG_MANAGER_PORT } from 'const/ports';

export class Log {
  time: number;
  log: string;
  logType: 'TRACE' | 'INFO' | 'ERROR' | 'WARN';
  constructor(time: number, logType: 'TRACE' | 'INFO' | 'ERROR' | 'WARN', log: string) {
    this.log = log;
    this.time = time;
    this.logType = logType;
  }
}

export function trace(ns: NS, data: string) {
  const log = new Log(Date.now(), 'TRACE', data);
  ns.writePort(LOG_MANAGER_PORT, JSON.stringify(log));
}
export function info(ns: NS, data: string) {
  const log = new Log(Date.now(), 'INFO', data);
  ns.writePort(LOG_MANAGER_PORT, JSON.stringify(log));
}
export function warn(ns: NS, data: string) {
  const log = new Log(Date.now(), 'WARN', data);
  ns.writePort(LOG_MANAGER_PORT, JSON.stringify(log));
}
export function error(ns: NS, data: string) {
  const log = new Log(Date.now(), 'ERROR', data);
  ns.writePort(LOG_MANAGER_PORT, JSON.stringify(log));
}
