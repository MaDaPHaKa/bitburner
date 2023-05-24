import { Corporation, NS, Product } from '@ns';
import {
  TOB_DIV_NAME,
  TOB_PROD_ADJUST_END,
  TOB_PROD_ADJUST_INC,
  TOB_PROD_ADJUST_LOW,
  TOB_PROD_ADJUST_START,
  TOB_PROD_CHECK_CYCLE,
  TOB_PROD_CHECK_END,
  TOB_PROD_CHECK_FIRST,
  TOB_PROD_CHECK_START,
  TOB_PROD_SETUP_END,
  TOB_PROD_SETUP_FIRST,
  TOB_PROD_SETUP_LOOP,
  TOB_PROD_SETUP_START,
} from 'const/corp';

export async function manageProductSell(ns: NS, c: Corporation, p: Product): Promise<void> {
  // setup\adjustment state 0=never sold, 1=first setup, 2=cyclic check and adjustment, 3=complete
  let state = prodNotSelling(p) ? TOB_PROD_CHECK_START : TOB_PROD_CHECK_CYCLE;
  while (state < 3) {
    while (c.getCorporation().state !== 'EXPORT') {
      //when you make your main script, put things you want to be done
      //potentially multiple times every cycle, like buying upgrades, here.
      await ns.sleep(0);
    }

    while (c.getCorporation().state === 'EXPORT') {
      //same as above
      await ns.sleep(0);
    }
    //and to this part put things you want done exactly once per cycle
    p = c.getProduct(TOB_DIV_NAME, p.name);
    switch (state) {
      case TOB_PROD_CHECK_START: {
        c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', 'MP*1', true);
        state = TOB_PROD_CHECK_FIRST;
        break;
      }
      case TOB_PROD_CHECK_FIRST: {
        await setupProdRate(ns, c, p);
        state = TOB_PROD_CHECK_END;
        break;
      }
      case TOB_PROD_CHECK_CYCLE: {
        await checkAndAdjustProdRate(ns, c, p);
        state = TOB_PROD_CHECK_END;
        break;
      }
    }
  }
}

async function setupProdRate(ns: NS, c: Corporation, p: Product): Promise<void> {
  // setup state, 0=before bisection, 1=first bisection, 2=bisection loop, 3=complete
  // honestly i don't really like.. will refactor.. maybe
  let state = TOB_PROD_SETUP_START;
  let x_min = 1;
  let x_max = 1;
  let x_avg = 1;
  while (state < TOB_PROD_SETUP_END) {
    while (c.getCorporation().state !== 'EXPORT') {
      //when you make your main script, put things you want to be done
      //potentially multiple times every cycle, like buying upgrades, here.
      await ns.sleep(0);
    }

    while (c.getCorporation().state === 'EXPORT') {
      //same as above
      await ns.sleep(0);
    }
    //and to this part put things you want done exactly once per cycle
    p = c.getProduct(TOB_DIV_NAME, p.name);
    const x = Number.parseInt((p.sCost as string).slice(3));
    const prod: number = p.cityData.Aevum[1];
    const sell: number = p.cityData.Aevum[2];
    const rate = prod - sell;
    switch (state) {
      case TOB_PROD_SETUP_START: {
        if (rate <= 0) {
          setProductValueSafe(ns, c, p, x * 2);
        } else {
          state = TOB_PROD_SETUP_FIRST;
        }
        break;
      }
      case TOB_PROD_SETUP_FIRST: {
        x_min = x / 2;
        x_max = x;
        x_avg = (x_min + x_max) / 2;
        setProductValueSafe(ns, c, p, x_avg);
        state = TOB_PROD_SETUP_LOOP;
        break;
      }
      case TOB_PROD_SETUP_LOOP: {
        if (prod >= sell) x_min = x_avg;
        else x_max = x_avg;
        x_avg = (x_min + x_max) / 2;
        if (x_max - x_min > 0.5 && x_avg > 1) {
          setProductValueSafe(ns, c, p, x_avg);
        } else {
          setProductValueSafe(ns, c, p, Math.floor(x_avg));
          state = TOB_PROD_SETUP_END;
        }
        break;
      }
    }
  }
}

async function checkAndAdjustProdRate(ns: NS, c: Corporation, p: Product): Promise<void> {
  let state = 'start'; // Initial state
  let previousState = 'start'; // Previous State
  let consecutiveAction = 0; // Counter for consecutive actions
  let power = 1; // Power of 10 for multiplier adjustment
  let forceOne = false;
  let consecutiveIncrLower = 0;
  const consecutiveCycles = 3;
  while (state !== 'end') {
    while (c.getCorporation().state !== 'EXPORT') {
      //when you make your main script, put things you want to be done
      //potentially multiple times every cycle, like buying upgrades, here.
      await ns.sleep(0);
    }

    while (c.getCorporation().state === 'EXPORT') {
      //same as above
      await ns.sleep(0);
    }
    p = c.getProduct(TOB_DIV_NAME, p.name);
    let multiplier = Number.parseInt((p.sCost as string).slice(3));
    const prod: number = p.cityData.Aevum[1];
    const sell: number = p.cityData.Aevum[2];
    const rate = Math.round((prod - sell + Number.EPSILON) * 10000) / 10000;

    if (rate < 0 && rate >= -0.5) {
      // Rate is within the acceptable range, no adjustment needed
      state = 'end';
      break;
    }
    previousState = state;
    // Adjust the multiplier based on the rate and current state
    switch (state) {
      case 'start': {
        if (rate <= 0) {
          // Rate is negative, increase multiplier by one
          multiplier += 1;
          state = 'increment';
        } else {
          // Rate is positive, lower multiplier by one
          multiplier -= 1;
          state = 'lower';
        }
        consecutiveAction = 0;
        break;
      }
      case 'increment': {
        if (rate <= 0) {
          // Price too low, raise the multiplier, if over 5 cycles increment power of 5
          multiplier += power;
          consecutiveAction += 1;
          if (consecutiveAction >= consecutiveCycles) {
            if (!forceOne) power *= 10;
            consecutiveAction = 0;
          }
        } else {
          // Price incremented too much, lower power of 5 (not lower than 1) and decrement
          power = Math.max(1, power / 10);
          multiplier -= power;
          state = 'lower';
          consecutiveAction = 0;
        }
        break;
      }
      case 'lower': {
        if (rate <= 0) {
          // Gone too low, lower power of 5 and increment
          power = Math.max(1, power / 10);
          multiplier += power;
          consecutiveAction = 0;
          state = 'increment';
        } else {
          // Still too high, lower multiplier, if over 5 cycles increment power of 5
          multiplier -= power;
          if (consecutiveAction >= consecutiveCycles) {
            if (!forceOne) power *= 10;
            consecutiveAction = 0;
          }
        }
        break;
      }
    }

    if ((state === 'increment' && previousState === 'lower') || (state === 'lower' && previousState === 'increment')) {
      consecutiveIncrLower++;
      if (consecutiveIncrLower > consecutiveCycles) forceOne = true;
      if (forceOne && state === 'increment' && rate < 0 && consecutiveIncrLower > consecutiveCycles * 2) {
        ns.print('WARN infinite increment,lower loop, lower multiplier by one just in case and force exit');
        multiplier -= 1;
        state = 'end';
      }
    } else {
      consecutiveIncrLower = 0;
    }

    if (forceOne) power = 1;
    // Set the new multiplier value
    setProductValueSafe(ns, c, p, multiplier);
  }
}

function setProductValueSafe(ns: NS, c: Corporation, p: Product, value: number): void {
  value = Math.max(1, Math.floor(value));
  c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', `MP*${value}`, true);
}

export function prodNotSelling(p: Product): boolean {
  return (
    p.sCost === undefined ||
    (typeof p.sCost === 'string' && !p.sCost.startsWith('MP*')) ||
    p.sCost === 0 ||
    p.cityData.Aevum[1] <= 0
  );
}
