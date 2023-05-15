import { CityName, Corporation, CorporationInfo, NS } from '@ns';
import { CORP_NAME, JOBS, TOB_DIV_NAME, TOB_PROD1_NAME, TOB_PROD2_NAME, UPGRADES } from 'const/corp';
import { CORP_STARTUP } from 'const/scripts';
import { checkAndSpeedEmpStats, checkAndUpdateStage, manageProductSell } from 'corp/utils/functions';
import { CORP_TOB_SETUP_STAGE, CorpSetupStage } from 'corp/utils/stages';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  const c: Corporation = ns.corporation;
  if (!c.hasCorporation()) {
    const created = c.createCorporation(CORP_NAME, false);
    if (!created) c.createCorporation(CORP_NAME, true);
  }
  const corp: CorporationInfo = c.getCorporation();
  try {
    let currentStage: CorpSetupStage = checkAndUpdateStage(ns, c, corp);
    let setupComplete = false;
    let error = false;
    if (currentStage === undefined) {
      error = true;
      ns.print('ERROR undefined stage!');
      ns.tail();
    } else if (currentStage.mainStage.val !== 2) {
      error = true;
      ns.print('WARN stage not tobacchi prep, this script should not have started.');
      ns.tail();
    }
    const expectedStageVal = CORP_TOB_SETUP_STAGE.mainStage.val;
    while (currentStage !== undefined && currentStage.mainStage.val === expectedStageVal) {
      ns.print('INFO: Cycle start stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
      switch (currentStage.mainStage.val) {
        case expectedStageVal: {
          await manageStage(ns, c, currentStage);
          break;
        }
        // this should not be needed.. better safe than sorry :D
        default: {
          setupComplete = true;
          break;
        }
      }
      if (setupComplete) break;
      currentStage = checkAndUpdateStage(ns, c, corp, currentStage);
      ns.print('INFO: Cycle end stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
      await ns.sleep(500);
    }
    if (!error) {
      ns.print('SUCCESS Tobacchi startup complete, moving into midgame.');
      ns.tail();
    }
    ns.spawn(CORP_STARTUP, 1);
  } catch (e) {
    ns.print('ERROR ', e);
    ns.tail();
  }
}

async function manageStage(ns: NS, c: Corporation, currentStage: CorpSetupStage) {
  switch (currentStage.subStage.val) {
    case 0: {
      c.expandIndustry('Tobacco', TOB_DIV_NAME);
      break;
    }
    case 1: {
      for (const city of Object.values(CityName)) {
        if (!c.getDivision(TOB_DIV_NAME).cities.includes(city)) {
          c.expandCity(TOB_DIV_NAME, city);
          c.purchaseWarehouse(TOB_DIV_NAME, city);
        }
        c.setSmartSupply(TOB_DIV_NAME, city, true);
      }
      break;
    }
    case 2: {
      hireIntoAevum(c);
      hireIntoOthers(c);
      currentStage.lastEmpStatsCheck = Date.now();
      break;
    }
    case 3: {
      c.makeProduct(TOB_DIV_NAME, CityName.Aevum, TOB_PROD1_NAME, 1e9, 1e9);
      checkAndSpeedEmpStats(ns, c, currentStage);
      break;
    }
    case 4: {
      for (const upgr of [UPGRADES.FWI, UPGRADES.SPI, UPGRADES.NAC, UPGRADES.NNI]) {
        while (c.getUpgradeLevel(upgr) < 20) {
          c.levelUpgrade(upgr);
        }
      }
      while (c.getUpgradeLevel(UPGRADES.DSE) < 30) {
        c.levelUpgrade(UPGRADES.DSE);
      }
      while (c.getUpgradeLevel(UPGRADES.PIN) < 10) {
        c.levelUpgrade(UPGRADES.PIN);
      }
      break;
    }
    case 5: {
      const prod1 = c.getProduct(TOB_DIV_NAME, TOB_PROD1_NAME);
      if (prod1.developmentProgress == 100) {
        try {
          c.getProduct(TOB_DIV_NAME, TOB_PROD2_NAME);
        } catch (e) {
          c.makeProduct(TOB_DIV_NAME, CityName.Aevum, TOB_PROD2_NAME, 1e9, 1e9);
        }
        await manageProductSell(ns, c, prod1);
      }
      break;
    }
    case 6: {
      while (c.getUpgradeLevel(UPGRADES.WAN) < 10) {
        c.levelUpgrade(UPGRADES.WAN);
      }
      while (c.getCorporation().funds > 4e9) {
        c.hireAdVert(TOB_DIV_NAME);
      }
      break;
    }
  }
}

function hireIntoAevum(c: Corporation) {
  const toAdd = 30 - c.getOffice(TOB_DIV_NAME, CityName.Aevum).employees;
  if (toAdd > 0) c.upgradeOfficeSize(TOB_DIV_NAME, CityName.Aevum, toAdd);
  while (c.hireEmployee(TOB_DIV_NAME, CityName.Aevum)) {}
  c.setAutoJobAssignment(TOB_DIV_NAME, CityName.Aevum, JOBS.OPS, 8);
  c.setAutoJobAssignment(TOB_DIV_NAME, CityName.Aevum, JOBS.ENG, 9);
  c.setAutoJobAssignment(TOB_DIV_NAME, CityName.Aevum, JOBS.BUS, 5);
  c.setAutoJobAssignment(TOB_DIV_NAME, CityName.Aevum, JOBS.MAN, 8);
}

function hireIntoOthers(c: Corporation) {
  for (const city of Object.values(CityName).filter((el) => el !== CityName.Aevum)) {
    const toAdd = 9 - c.getOffice(TOB_DIV_NAME, city).employees;
    if (toAdd > 0) c.upgradeOfficeSize(TOB_DIV_NAME, city, toAdd);
    while (c.hireEmployee(TOB_DIV_NAME, city)) {}
    c.setAutoJobAssignment(TOB_DIV_NAME, city, JOBS.BUS, 1);
    c.setAutoJobAssignment(TOB_DIV_NAME, city, JOBS.ENG, 1);
    c.setAutoJobAssignment(TOB_DIV_NAME, city, JOBS.MAN, 1);
    c.setAutoJobAssignment(TOB_DIV_NAME, city, JOBS.OPS, 1);
    c.setAutoJobAssignment(TOB_DIV_NAME, city, JOBS.RND, 5);
  }
}
