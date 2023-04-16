import { NS } from '@ns';
import { ServerInfo } from './server-info';

export function calcolaThreadGrow(ns: NS, serverInfo: ServerInfo, debug = false) {
  const currentMoney = ns.getServerMoneyAvailable(serverInfo.name);
  const rate = serverInfo.maxMoney / (currentMoney > 0 ? currentMoney : 1);
  const thr = ns.growthAnalyze(serverInfo.name, rate);
  if (debug) {
    ns.print('------ grow thread calc ------');
    ns.print('currentMoney: ', currentMoney);
    ns.print('grow rate: ', rate);
    ns.print('growthAna: ', thr);
    ns.print('-----------------------------');
  }
  return Math.ceil(thr);
}

export function calcolaThreadWeak(ns: NS, serverInfo: ServerInfo, debug = false) {
  const currentSec = ns.getServerSecurityLevel(serverInfo.name);
  const secWeak = ns.weakenAnalyze(1);
  const rate = (currentSec - serverInfo.minSecurity) / secWeak;
  if (debug) {
    ns.print('------ weak thread calc ------');
    ns.print('currSec: ', currentSec);
    ns.print('minSec: ', serverInfo.minSecurity);
    ns.print('weakSec: ', secWeak);
    ns.print('secRate: ', rate);
    ns.print('-----------------------------');
  }
  return Math.ceil(rate);
}

export function calcolaThreadHack(ns: NS, serverInfo: ServerInfo, debug = false) {
  const maxMoney = serverInfo.maxMoney;
  const moneyPerThread = ns.hackAnalyze(serverInfo.name) * maxMoney;
  const minWanted = maxMoney * 0.65;
  const rate = (maxMoney - minWanted) / moneyPerThread;
  const threads = Math.floor(rate);
  if (debug) {
    ns.print('------ hack thread calc ------');
    ns.print('moneyPerThread: ', moneyPerThread);
    ns.print('maxMoney: ', maxMoney);
    ns.print('minWanted: ', minWanted);
    ns.print('hack rate: ', rate);
    ns.print('growthAna: ', threads);
    ns.print('-----------------------------');
  }
  return threads;
}

export function calcolaWeakThreadPerGrow(growThreads: number) {
  return Math.ceil((growThreads * 0.004) / 0.05);
}

export function calcolaTempiBatch(
  tempoHack: number,
  tempoWeak: number,
  tempoGrow: number,
  batchStartDelay: number = 200,
  scritpDelay: number = 100,
  iteration: number = 0
) {
  const sleepWeakHack = (batchStartDelay + scritpDelay * 2) * iteration;

  const sleepHack = tempoWeak - tempoHack - scritpDelay + sleepWeakHack;
  const endHack = sleepHack + tempoHack;

  const endWeakHack = tempoWeak + sleepWeakHack;

  const sleepGrow = endWeakHack - tempoGrow + scritpDelay;
  const endGrow = sleepGrow + tempoGrow;

  const sleepWeakGrow = endGrow - tempoWeak + scritpDelay;
  const endWeakGrow = sleepWeakGrow + tempoWeak;
}
