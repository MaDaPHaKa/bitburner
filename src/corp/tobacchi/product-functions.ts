
import { Corporation, NS, Product } from '@ns';
import { TOB_DIV_NAME } from 'const/corp';

export async function manageProductSell(ns: NS, c: Corporation, p: Product): Promise<void> {
    // setup\adjustment state 0=never sold, 1=first setup, 2=cyclic check and adjustment, 3=complete
    let state = (p.sCost === undefined || p.sCost === 0 || p.cityData.Aevum[1] <= 0) ? 0 : 2;
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
            case 0: {
                c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', 'MP*1', true);
                state = 1;
                break;
            }
            case 1: {
                await setupProdRate(ns, c, p);
                state = 3;
                break;
            }
            case 2: {
                await checkAndAdjustProdRate(ns, c, p);
                state = 3;
                break;
            }
        }
    }
}

async function setupProdRate(ns: NS, c: Corporation, p: Product): Promise<void> {
    // setup state, 0=before bisection, 1=first bisection, 2=bisection loop, 3=complete
    // honestly i don't really like this.. will refactor.. maybe
    let state = 0;
    let x_min = 1;
    let x_max = 1;
    let x_avg = 1;
    while (state < 3) {
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
            case 0: {
                if (rate <= 0) {
                    c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', `MP*${x * 2}`, true);
                } else {
                    state = 1;
                } break;
            }
            case 1: {
                x_min = x / 2;
                x_max = x;
                x_avg = (x_min + x_max) / 2;
                c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', `MP*${x_avg}`, true);
                state = 2;
                break;
            }
            case 2: {
                if (prod >= sell)
                    x_min = x_avg;
                else
                    x_max = x_avg;
                x_avg = (x_min + x_max) / 2;
                if ((x_max - x_min) > 0.5) {
                    c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', `MP*${x_avg}`, true);
                } else {
                    c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', `MP*${Math.floor(x_avg)}`, true);
                    state = 3;
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
    // adjust state, 0=start, 1=firstCheck (needed to know if the price really needs to be adjusted in case rate = 0), 2=adjust, 3=end
    let state = 0;
    while (state < 3) {
        p = c.getProduct(TOB_DIV_NAME, p.name);
        const x = Number.parseInt((p.sCost as string).slice(3));
        const prod: number = p.cityData.Aevum[1];
        const sell: number = p.cityData.Aevum[2];
        const rate = prod - sell;
        if (rate < 0 && rate > -0.3) {
            state = 3;
        }
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
        switch (state) {
            case 0: {
                c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', `MP*${x + 1}`, true);
                state = 1;
                break;
            }
            case 1: {
                if (rate > 0) {
                    c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', `MP*${x - 1}`, true);
                    state = 3;
                } else {
                    c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, p.name, 'MAX', `MP*${x - 1}`, true);
                    state = 2;
                }
                break;
            }
            case 2: {
                // if (rate === 0.0) {
                //     if (previousRate !== undefined) {
                //         return;
                //     }
                // } else if (rate > 0) {
                //     return;
                // } else if (rate < -0.3) {
                //     return;
                // }
                break;
            }
        }
    }
    return;
}
