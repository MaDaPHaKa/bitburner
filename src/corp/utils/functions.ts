import { CityName, Corporation, CorporationInfo, NS, Product } from '@ns';
import { AGRI_DIV_NAME, AgriMaterialStage, CORP_SETUP_UPGRADES, JOBS, MATERIALS, TOB_DIV_NAME } from 'const/corp';
import { checkAgriManStage, checkAgriSetupStage } from 'corp/agri/checks';
import { checkTobManStage, checkTobMidGameStage, checkTobSetupStage } from 'corp/tobacchi/checks';
import { CORP_TOB_SETUP_STAGE, CorpSetupStage } from 'corp/utils/stages';

export function checkAndUpdateStage(
  ns: NS,
  c: Corporation,
  corp: CorporationInfo,
  currentStage: CorpSetupStage | undefined = undefined
): CorpSetupStage {
  currentStage = checkAgriSetupStage(ns, c, corp);
  if (currentStage === undefined) {
    currentStage = checkAgriManStage(ns, c);
  }
  if (currentStage === undefined) currentStage = CORP_TOB_SETUP_STAGE;
  currentStage = checkTobSetupStage(ns, c, corp);
  if (currentStage === undefined) {
    currentStage = checkTobMidGameStage(ns, c);
  }
  if (currentStage === undefined) {
    currentStage = checkTobManStage(ns, c);
  }
  // No valid stage found, this shouldn't ever happen, throw error
  if (currentStage === undefined) {
    throw new Error("No valid stage found, this shouldn't ever happen");
  }
  return currentStage;
}

export function checkUpgrades(c: Corporation, level: number, upgrades = CORP_SETUP_UPGRADES): boolean {
  for (const upgr of upgrades) {
    if (c.getUpgradeLevel(upgr) < level) {
      return false;
    }
  }
  return true;
}

export function checkAgroWarehouse(c: Corporation, level: number): boolean {
  for (const city of Object.values(CityName)) {
    if (c.getWarehouse(AGRI_DIV_NAME, city).level < level) {
      return false;
    }
  }
  return true;
}

export function checkAgroMaterials(c: Corporation, stage: AgriMaterialStage): boolean {
  for (const city of Object.values(CityName)) {
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.AIC).qty < stage.aiCores) {
      return false;
    }
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.HDW).qty < stage.hardware) {
      return false;
    }
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.RES).qty < stage.realEstate) {
      return false;
    }
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.ROB).qty < stage.robot) {
      return false;
    }
  }
  return true;
}

export function checkAgroEmployees(c: Corporation, moveToRnD = false): boolean {
  for (const city of Object.values(CityName)) {
    const office = c.getOffice(AGRI_DIV_NAME, city);
    if (office.size < 9) return false;
    else if (office.employeeJobs['Research & Development'] > 0 && moveToRnD) return false;
  }
  return true;
}

export function checkTobEmployees(c: Corporation, devCityEmp: number): boolean {
  for (const city of Object.values(CityName)) {
    const office = c.getOffice(TOB_DIV_NAME, city);
    if (city === CityName.Aevum && office.size < devCityEmp) return false;
    if (city !== CityName.Aevum && office.size < (devCityEmp > 60 ? devCityEmp - 60 : 9)) return false;
  }
  return true;
}

export function checkEmployeeStats(ns: NS, c: Corporation): boolean {
  let avgMor = 0;
  let avgHap = 0;
  let avgEne = 0;
  for (const city of Object.values(CityName)) {
    avgMor += c.getOffice(AGRI_DIV_NAME, city).avgMor;
    avgHap += c.getOffice(AGRI_DIV_NAME, city).avgHap;
    avgEne += c.getOffice(AGRI_DIV_NAME, city).avgEne;
  }
  avgMor /= 6;
  avgHap /= 6;
  avgEne /= 6;
  ns.clearLog();
  ns.print('waiting for employee stats to rise');
  ns.print('   avg morale: ' + avgMor.toFixed(3) + '/97');
  ns.print('avg happiness: ' + avgHap.toFixed(3) + '/97');
  ns.print('   avg energy: ' + avgEne.toFixed(3) + '/97');
  if (avgMor >= 97 && avgHap / 6 >= 97 && avgEne >= 97) {
    return true;
  }
  return false;
}

export function checkProductAtLeastDevelopment(c: Corporation, division: string, name: string) {
  try {
    const prod = c.getProduct(division, name);
    return prod !== undefined;
  } catch (e) {
    return false;
  }
}
export function checkAndSpeedEmpStats(ns: NS, c: Corporation, stage: CorpSetupStage) {
  if (Date.now() - stage.lastEmpStatsCheck > 60 * 5 * 1000 && !checkEmployeeStats(ns, c)) {
    speedEmployeeStats(c, stage);
  }
}
export function setSubstage(stage: CorpSetupStage, substageIndex: number): CorpSetupStage {
  stage.subStage = stage.subStages[substageIndex];
  return stage;
}

export function purchaseAgroMaterials(c: Corporation, stage: AgriMaterialStage) {
  for (const city of Object.values(CityName)) {
    let material = c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.AIC);
    if (material.qty < stage.aiCores) {
      const toBuy = stage.aiCores - material.qty;
      c.bulkPurchase(AGRI_DIV_NAME, city, MATERIALS.AIC, toBuy);
    }
    material = c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.HDW);
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.HDW).qty < stage.hardware) {
      const toBuy = stage.aiCores - material.qty;
      c.bulkPurchase(AGRI_DIV_NAME, city, MATERIALS.HDW, toBuy);
    }
    material = c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.RES);
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.RES).qty < stage.realEstate) {
      const toBuy = stage.aiCores - material.qty;
      c.bulkPurchase(AGRI_DIV_NAME, city, MATERIALS.RES, toBuy);
    }
    material = c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.ROB);
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.ROB).qty < stage.robot) {
      const toBuy = stage.aiCores - material.qty;
      c.bulkPurchase(AGRI_DIV_NAME, city, MATERIALS.ROB, toBuy);
    }
  }
}

export function speedEmployeeStats(c: Corporation, stage: CorpSetupStage) {
  if (stage.lastEmpStatsCheck === -1) {
    stage.lastEmpStatsCheck = Date.now();
  } else if (Date.now() - stage.lastEmpStatsCheck > 60 * 5 * 1000) {
    for (const city of Object.values(CityName)) {
      c.buyCoffee(AGRI_DIV_NAME, city);
      c.throwParty(AGRI_DIV_NAME, city, 500000);
    }
    stage.lastEmpStatsCheck = -1;
  }
}

export function manageInvestors(c: Corporation, minValue: number, round: number) {
  const offer = c.getInvestmentOffer();
  if (offer.round === round && offer.funds > minValue) c.acceptInvestmentOffer();
}

export async function manageProductSell(ns: NS, c: Corporation, p: Product): Promise<void> {
  let previousRate: number | undefined;
  let startedThisTurn = false;
  while (true) {
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
    const prod: number = p.cityData.Aevum[1];
    const sell: number = p.cityData.Aevum[2];
    if (p.sCost === undefined || p.sCost === 0 || prod <= 0) {
      c.sellProduct(TOB_DIV_NAME, CityName.Aevum, p.name, 'MAX', 'MP*1', true);
      startedThisTurn = true;
    } else {
      let x = Number.parseInt((p.sCost as string).slice(3));
      if (startedThisTurn) {
        await setupProdRate(ns, c, prod, sell, p, x);
        break;
      } else {
        previousRate = checkAndAdjustProdRate(c, prod, sell, previousRate, x);
        if (previousRate === undefined) break;
      }
    }
  }
}

async function setupProdRate(ns: NS, c: Corporation, prod: number, sell: number, p: Product, x: number): Promise<void> {
  const rate = prod - sell;
  if (rate <= 0) c.sellProduct(TOB_DIV_NAME, CityName.Aevum, p.name, 'MAX', `MP*${x * 2}`, true);
  else {
    let x_min = x / 2;
    let x_max = x;
    let x_avg = (x_min + x_max) / 2;
    c.sellProduct(TOB_DIV_NAME, CityName.Aevum, p.name, 'MAX', `MP*${x_avg}`, true);
    while (true) {
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
    }
  }
}

function checkAndAdjustProdRate(
  c: Corporation,
  prod: number,
  sell: number,
  previousRate: number | undefined,
  x: number
): number {
  const rate = prod - sell;
  if (rate === 0.0) {
    if (previousRate === undefined) {
    }
  } else if (rate > 0) {
  } else if (rate < -0.3) {
  }
  return rate;
}

export function manageAevumEmployees(c: Corporation, size: number) {
  while (c.hireEmployee(TOB_DIV_NAME, CityName.Aevum)) {}

  const baseline = Math.floor(size / 7);
  const business = Math.floor(baseline / 2);
  let remaining = business + baseline * 3;

  let ops = baseline;
  let eng = baseline;
  let man = baseline;
  let step = 0;
  while (remaining > 0) {
    switch (step) {
      case 0: {
        eng++;
      }
      case 1: {
        man++;
      }
      case 2: {
        ops++;
      }
    }
    remaining--;
    step = step == 2 ? 0 : step++;
  }

  c.setAutoJobAssignment(TOB_DIV_NAME, CityName.Aevum, JOBS.OPS, ops);
  c.setAutoJobAssignment(TOB_DIV_NAME, CityName.Aevum, JOBS.ENG, eng);
  c.setAutoJobAssignment(TOB_DIV_NAME, CityName.Aevum, JOBS.BUS, business);
  c.setAutoJobAssignment(TOB_DIV_NAME, CityName.Aevum, JOBS.MAN, man);
}
