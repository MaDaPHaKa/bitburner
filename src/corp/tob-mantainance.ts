import { Corporation, NS, Product } from '@ns';
import {
  ADV_OR_HIRE_FUNDS_CHECK_MULTIPLIER,
  CorpResearchName,
  JOBS,
  ROUND_3_MIN_AMOUNT,
  ROUND_4_MIN_AMOUNT,
  TOBACCHI_LAB_POINT_THRESHOLD,
  TOBACCHI_MK_POINT_THRESHOLD,
  TOB_DIV_NAME,
  UPGRADES,
} from 'const/corp';
import { CORP_STARTUP } from 'const/scripts';
import { checkAndUpdateStage, manageAevumEmployees, manageInvestors, speedEmployeeStats } from 'corp/corp-functions';
import { CORP_TOB_MANTAINANCE_STAGE, CorpSetupStage } from 'corp/corp-stages';
import { manageProductSell, prodNotSelling } from 'corp/product-functions';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  const c: Corporation = ns.corporation;
  if (!c.hasCorporation()) {
    ns.print('ERROR no corporation, this script should not have started!');
    ns.spawn(CORP_STARTUP, 1);
  } else {
    await runStage(c, ns);
  }
}

async function runStage(c: Corporation, ns: NS) {
  try {
    let currentStage: CorpSetupStage = checkAndUpdateStage(ns);
    let setupComplete = false;
    let error = false;
    if (currentStage === undefined) {
      error = true;
      ns.print('ERROR undefined stage!');
      ns.tail();
    } else if (currentStage.mainStage.val !== CORP_TOB_MANTAINANCE_STAGE.mainStage.val) {
      error = true;
      ns.print('WARN stage not tobacchi mantainance, this script should not have started.');
      ns.tail();
    }
    const expectedStageVal = CORP_TOB_MANTAINANCE_STAGE.mainStage.val;
    while (currentStage !== undefined && currentStage.mainStage.val === expectedStageVal) {
      ns.print('INFO: Cycle start');
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
      switch (currentStage.mainStage.val) {
        case expectedStageVal: {
          await manageStage(ns, c, currentStage);
          break;
        }
        // this should not be possible..
        default: {
          setupComplete = true;
          break;
        }
      }
      if (setupComplete) {
        ns.print('ERROR Tobacchi mantainance complete, should not be possible.');
        ns.tail();
        break;
      }
      currentStage = checkAndUpdateStage(ns, currentStage);
      ns.print('INFO: Cycle end');
    }
    if (!error) {
      ns.print('ERROR Tobacchi mantainance complete, should not be possible.');
      ns.tail();
    }
    ns.spawn(CORP_STARTUP, 1);
  } catch (e) {
    ns.print('ERROR ', e);
    ns.tail();
    throw e;
  }
}

async function manageStage(ns: NS, c: Corporation, stage: CorpSetupStage) {
  manageMoney(ns, c);
  ns.print('INFO Check reasearch');
  checkReasearch(ns, c);
  ns.print('INFO Check Wilson');
  await checkWilson(ns, c);
  ns.print('INFO Check Ads/Emps');
  await adsOrEmployees(ns, c);
  ns.print('INFO Upgrade other cities');
  upgradeOtherCities(ns, c);
  ns.print('INFO Check emp stats');
  await speedEmployeeStats(ns, stage);
  ns.print('INFO Check products');
  if (hasNoConfiguredProducts(c)) {
    await checkProducts(ns, c);
  } else {
    startDevelop(ns, c);
  }
}

function manageMoney(ns: NS, c: Corporation) {
  if (!c.getCorporation().public) {
    try {
      const round = c.getInvestmentOffer().round;
      if (round < 4) manageInvestors(ns, ROUND_3_MIN_AMOUNT, 3);
      if (round === 4 && manageInvestors(ns, ROUND_4_MIN_AMOUNT, 4)) {
        ns.print('SUCCESS Time to go public');
        ns.tail();
      }
    } catch (e) {
      ns.print('ERROR investment offer: ', e);
      ns.tail();
    }
  }
}

function checkReasearch(ns: NS, c: Corporation) {
  const division = c.getDivision(TOB_DIV_NAME);
  if (!c.hasResearched(TOB_DIV_NAME, CorpResearchName.RES_LAB) && division.research > TOBACCHI_LAB_POINT_THRESHOLD) {
    c.research(TOB_DIV_NAME, CorpResearchName.RES_LAB);
  }
  if (
    !c.hasResearched(TOB_DIV_NAME, CorpResearchName.MKT2) &&
    !c.hasResearched(TOB_DIV_NAME, CorpResearchName.MKT1) &&
    division.research > TOBACCHI_MK_POINT_THRESHOLD
  ) {
    c.research(TOB_DIV_NAME, CorpResearchName.MKT1);
    c.research(TOB_DIV_NAME, CorpResearchName.MKT2);
    for (const prod of c.getDivision(TOB_DIV_NAME).products) {
      enableMkTa(ns, c, prod);
    }
  }
}

function hasNoConfiguredProducts(c: Corporation): boolean {
  const products = c.getDivision(TOB_DIV_NAME).products;
  return products.some((product) => prodNotSelling(c.getProduct(TOB_DIV_NAME, product)));
}

function startDevelop(ns: NS, c: Corporation) {
  const products = c.getDivision(TOB_DIV_NAME).products;
  const prods: Product[] = [];
  for (const product of products) {
    prods.push(c.getProduct(TOB_DIV_NAME, product));
  }
  const prodToUpdate = prods.sort((a, b) => a.rat - b.rat)[0];
  const prodName = prodToUpdate.name;
  c.discontinueProduct(TOB_DIV_NAME, prodName);
  const investment = Math.floor(c.getCorporation().funds / 3);
  c.makeProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, prodName, investment, investment);
}

async function checkProducts(ns: NS, c: Corporation) {
  const productNames = c.getDivision(TOB_DIV_NAME).products;
  if (c.hasResearched(TOB_DIV_NAME, CorpResearchName.MKT2) && c.hasResearched(TOB_DIV_NAME, CorpResearchName.MKT1)) {
    for (const product of productNames) {
      if (prodNotSelling(c.getProduct(TOB_DIV_NAME, product))) {
        c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, product, 'MAX', 'MP', true);
        enableMkTa(ns, c, product);
      }
    }
  } else {
    const products = productNames
      .map((product) => c.getProduct(TOB_DIV_NAME, product))
      .filter((el) => el.developmentProgress >= 100)
      .sort((a, b) => b.rat - a.rat);

    // OLD
    const all = [];
    for (const prod of products) {
      if (prodNotSelling(prod)) {
        all.unshift(prod);
      } else {
        all.push(prod);
      }
    }
    for (const product of all) {
      ns.print('INFO cycle check ', product.name);
      await manageProductSell(ns, c, product);
    }
  }
}

async function checkWilson(ns: NS, c: Corporation) {
  while (c.getCorporation().funds > c.getUpgradeLevelCost(UPGRADES.WAN)) {
    c.levelUpgrade(UPGRADES.WAN);
    await ns.sleep(10);
  }
}

async function adsOrEmployees(ns: NS, c: Corporation) {
  let canBuy = true;
  let adsBought = 0;
  while (canBuy) {
    const funds = c.getCorporation().funds * ADV_OR_HIRE_FUNDS_CHECK_MULTIPLIER;
    const advCost = c.getHireAdVertCost(TOB_DIV_NAME);
    const employeeCost = c.getOfficeSizeUpgradeCost(TOB_DIV_NAME, ns.enums.CityName.Aevum, 15);
    const aevumSize = c.getOffice(TOB_DIV_NAME, ns.enums.CityName.Aevum).size;
    if (advCost < employeeCost || aevumSize >= 300) {
      if (funds > advCost && adsBought < 50) {
        adsBought++;
        c.hireAdVert(TOB_DIV_NAME);
      } else {
        canBuy = false;
      }
    } else {
      if (funds > employeeCost) {
        c.upgradeOfficeSize(TOB_DIV_NAME, ns.enums.CityName.Aevum, 15);
        manageAevumEmployees(ns);
      } else {
        canBuy = false;
      }
    }
    await ns.sleep(10);
  }
}

function upgradeOtherCities(ns: NS, c: Corporation) {
  const funds = c.getCorporation().funds;
  const aevumSize = c.getOffice(TOB_DIV_NAME, ns.enums.CityName.Aevum).size;
  for (const city of Object.values(ns.enums.CityName).filter((el) => el !== ns.enums.CityName.Aevum)) {
    const citySize = c.getOffice(TOB_DIV_NAME, city).size;

    if (citySize < aevumSize - 60) {
      const toAdd = aevumSize - citySize - 60;
      const upgradeCost = c.getOfficeSizeUpgradeCost(TOB_DIV_NAME, city, toAdd);
      if (upgradeCost < funds / 3) {
        c.upgradeOfficeSize(TOB_DIV_NAME, city, toAdd);
        while (c.hireEmployee(TOB_DIV_NAME, city, JOBS.RND)) {}
      }
    }
  }
}

function enableMkTa(ns: NS, c: Corporation, prodName: string) {
  if (
    c.getProduct(TOB_DIV_NAME, prodName).developmentProgress >= 100 &&
    prodNotSelling(c.getProduct(TOB_DIV_NAME, prodName))
  ) {
    c.sellProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, prodName, 'MAX', 'MP', true);
  }
  c.setProductMarketTA1(TOB_DIV_NAME, prodName, true);
  c.setProductMarketTA2(TOB_DIV_NAME, prodName, true);
}
