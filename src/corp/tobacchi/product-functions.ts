
import { Corporation, NS, Product } from '@ns';
import { TOB_DIV_NAME, TOB_PROD_ADJUST_END, TOB_PROD_ADJUST_INC, TOB_PROD_ADJUST_LOW, TOB_PROD_ADJUST_START, TOB_PROD_CHECK_CYCLE, TOB_PROD_CHECK_END, TOB_PROD_CHECK_FIRST, TOB_PROD_CHECK_START, TOB_PROD_SETUP_END, TOB_PROD_SETUP_FIRST, TOB_PROD_SETUP_LOOP, TOB_PROD_SETUP_START } from 'const/corp';

export async function manageProductSell(ns: NS, c: Corporation, p: Product): Promise<void> {
    // setup\adjustment state 0=never sold, 1=first setup, 2=cyclic check and adjustment, 3=complete
    let state = (p.sCost === undefined || (typeof p.sCost === 'string' && !p.sCost.startsWith('MP*')) || p.sCost === 0 || p.cityData.Aevum[1] <= 0) ? TOB_PROD_CHECK_START : TOB_PROD_CHECK_CYCLE;
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
        while (c.getCorporation().state != 'EXPORT') {
            //when you make your main script, put things you want to be done
            //potentially multiple times every cycle, like buying upgrades, here.
            await ns.sleep(0);
        }

        while (c.getCorporation().state == 'EXPORT') {
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
                } break;
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
                if (prod >= sell)
                    x_min = x_avg;
                else
                    x_max = x_avg;
                x_avg = (x_min + x_max) / 2;
                if ((x_max - x_min) > 0.5 && x_avg > 1) {
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

async function checkAndAdjustProdRate(ns: NS,
    c: Corporation,
    p: Product,
): Promise<void> {
    // adjust state, 0=start, 1=incr, 2=lower, 3=end
    let state = TOB_PROD_ADJUST_START;
    let previousState = -1;
    while (state < TOB_PROD_ADJUST_END) {
        while (c.getCorporation().state != 'EXPORT') {
            //when you make your main script, put things you want to be done
            //potentially multiple times every cycle, like buying upgrades, here.
            await ns.sleep(0);
        }

        while (c.getCorporation().state == 'EXPORT') {
            //same as above
            await ns.sleep(0);
        }
        p = c.getProduct(TOB_DIV_NAME, p.name);
        const x = Number.parseInt((p.sCost as string).slice(3));
        const prod: number = p.cityData.Aevum[1];
        const sell: number = p.cityData.Aevum[2];
        const rate = prod - sell;
        if (rate < 0 && rate > -0.3) {
            // rate is ok, no need to adjust
            break;
        }
        //and to this part put things you want done exactly once per cycle
        previousState = state;
        if (rate > 0)
            state = TOB_PROD_ADJUST_LOW;
        else if (previousState !== TOB_PROD_ADJUST_LOW)
            state = TOB_PROD_ADJUST_INC;
        else
            state = TOB_PROD_ADJUST_END;
        switch (state) {
            case TOB_PROD_ADJUST_START: {
                break;
            }
            case TOB_PROD_ADJUST_INC: {
                setProductValueSafe(ns, c, p, x + 1);
                break;
            }
            case TOB_PROD_ADJUST_LOW: {
                setProductValueSafe(ns, c, p, x - 1);
                break;
            }
        }
    }
    return;
}

function setProductValueSafe(ns: NS,
    c: Corporation,
    p: Product,
    value: number): void {
    value = Math.max(1, value);
    c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', `MP*${value}`, true);
}