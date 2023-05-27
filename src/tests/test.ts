import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  for (let i = 0; i < 17; i++) {
    calcolaTempiBatch(ns, 25000, 35246, 28765, i);
  }
  // testHackCalc(ns);
}

function calcolaTempiBatch(
  ns: NS,
  tempoHack: number,
  tempoWeak: number,
  tempoGrow: number,
  iteration = 0,
  scritpDelay = 100
) {
  const sleepWeakHack = scritpDelay * iteration * 4;

  const sleepHack = tempoWeak - tempoHack - scritpDelay + sleepWeakHack;
  const endHack = sleepHack + tempoHack;

  const endWeakHack = tempoWeak + sleepWeakHack;

  const sleepGrow = endWeakHack - tempoGrow + scritpDelay;
  const endGrow = sleepGrow + tempoGrow;

  const sleepWeakGrow = endGrow - tempoWeak + scritpDelay;
  const endWeakGrow = sleepWeakGrow + tempoWeak;

  ns.print('iterazione ' + iteration + ' end hack: ', endHack);
  ns.print('iterazione ' + iteration + ' end endWeakHack: ', endWeakHack);
  ns.print('iterazione ' + iteration + ' end endGrow: ', endGrow);
  ns.print('iterazione ' + iteration + ' end endWeakGrow: ', endWeakGrow);

  const sleepGrow2 = Math.max(1, Math.ceil(tempoWeak - tempoGrow)) + scritpDelay;
  const endGrow2 = sleepGrow + tempoGrow;
  const sleepWeakGrow2 = Math.max(1, Math.ceil(endGrow - tempoWeak)) + scritpDelay;
  const endWeakGrow2 = sleepWeakGrow2 + tempoWeak;
  // ns.print('end endWeak: ', tempoWeak);
  // ns.print('end endGrow2: ', endGrow2);
  // ns.print('end endWeakGrow2: ', endWeakGrow2);
}

function testHackCalc(ns: NS) {
  const server = ns.getServer('joesguns');
  if (server.moneyMax) {
    const maxMoney = server.moneyMax;
    const moneyPerThread = 0.06 * maxMoney;
    const minWanted = maxMoney * 0.9;
    const rate = minWanted / moneyPerThread;
    const threads = Math.max(1, Math.floor(rate));

    const WEAKEN_PER_THREAD = ns.weakenAnalyze(1, 1);
    const HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    const GW_THREADS = ns.growthAnalyzeSecurity(1, undefined, 1) / WEAKEN_PER_THREAD;
    const hackWeakThreads = Math.max(1, Math.ceil(HW_THREADS * threads));
    server.moneyAvailable = minWanted;
    const growThreads = ns.formulas.hacking.growThreads(server, ns.getPlayer(), server.moneyMax, 1);
    const growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * growThreads));

    ns.print('max money: ', maxMoney);
    ns.print('hackthread ', threads);
    ns.print('hackWeakThreads ', hackWeakThreads);
    ns.print('growThreads ', growThreads);
    ns.print('growWeakThreads ', growWeakThreads);
    ns.print('GW_THREADS ', GW_THREADS);
    ns.print('HW_THREADS ', HW_THREADS);
    ns.print('WEAKEN_PER_THREAD ', WEAKEN_PER_THREAD);
    ns.print('ns.hackAnalyzeSecurity(1) ', ns.hackAnalyzeSecurity(1));
    ns.print("ns.growthAnalyzeSecurity(1, 'joesguns', 1) ", ns.growthAnalyzeSecurity(1, undefined, 1));
  }
}
