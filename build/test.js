// main();
mainWGw();

function main() {
  const tempoHack = 1000;
  const tempoWeak = 3000;
  const tempoGrow = 2000;
  let batchStartDelay = 300;
  const scritpDelay = 200;
  let i = 0;
  for (i; i < 10; i++) {
    const sleepWeakHack = (batchStartDelay + scritpDelay * 2) * i;

    const sleepHack = tempoWeak - tempoHack - scritpDelay + sleepWeakHack;
    const endHack = sleepHack + tempoHack;

    const endWeakHack = tempoWeak + sleepWeakHack;

    const sleepGrow = endWeakHack - tempoGrow + scritpDelay;
    const endGrow = sleepGrow + tempoGrow;

    const sleepWeakGrow = endGrow - tempoWeak + scritpDelay;
    const endWeakGrow = sleepWeakGrow + tempoWeak;

    // console.log('sleep hack:', sleepHack);
    // console.log('sleep weak hack:', batchStartSleep);
    // console.log('sleep grow:', sleepGrow);
    // console.log('sleep weak grow:', sleepWeakGrow);
    // console.log('batch sleep: ', batchStartSleep);
    console.log(i + " hack finisce: ", endHack);
    console.log(i + " weak hack finisce: ", endWeakHack);
    console.log(i + " grow finisce: ", endGrow);
    console.log(i + " weak grow finisce: ", endWeakGrow);
  }
}

function mainWGw() {
  const tempoWeak = 3000;
  const tempoGrow = 2000;
  let batchStartDelay = 300;
  const scritpDelay = 200;
  let i = 0;
  for (i; i < 10; i++) {
    const sleepWeakHack = (batchStartDelay + scritpDelay * 2) * i;
    const endWeakHack = tempoWeak + sleepWeakHack;
    const sleepGrow = endWeakHack - tempoGrow + scritpDelay;
    const endGrow = sleepGrow + tempoGrow;
    const sleepWeakGrow = endGrow - tempoWeak + scritpDelay;
    const endWeakGrow = sleepWeakGrow + tempoWeak;

    // console.log('sleep hack:', sleepHack);
    // console.log('sleep weak hack:', batchStartSleep);
    // console.log('sleep grow:', sleepGrow);
    // console.log('sleep weak grow:', sleepWeakGrow);
    // console.log('batch sleep: ', batchStartSleep);
    console.log(i + " weak standard finisce: ", endWeakHack);
    console.log(i + " grow finisce: ", endGrow);
    console.log(i + " weak grow finisce: ", endWeakGrow);
  }
}
