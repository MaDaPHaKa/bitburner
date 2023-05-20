import { NS } from '@ns';
import { AGRI_DIV_NAME, AGRI_MATERIAL, CORP_NAME, CORP_SETUP_UPGRADES, JOBS, UNLOCKS } from 'const/corp';
import { CORP_STARTUP } from 'const/scripts';
import { checkAndUpdateStage, purchaseAgroMaterials, speedEmployeeStats } from 'corp/corp-functions';
import { CORP_AGRI_SETUP_STAGE, CorpSetupStage } from 'corp/corp-stages';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.enableLog('spawn');
  ns.tail();
  const c = ns.corporation;
  if (!c.hasCorporation()) {
    try {
      c.createCorporation(CORP_NAME, false);
    } catch (e) {
      c.createCorporation(CORP_NAME, true);
    }
  }
  try {
    let currentStage: CorpSetupStage = checkAndUpdateStage(ns);
    let setupComplete = false;
    let error = false;
    if (currentStage === undefined) {
      error = true;
      ns.print('ERROR undefined stage!');
      ns.tail();
    } else if (currentStage.mainStage.val !== CORP_AGRI_SETUP_STAGE.mainStage.val) {
      error = true;
      ns.print('WARN stage not agri prep, this script should not have started.');
      ns.tail();
    }
    const expectedStageVal = CORP_AGRI_SETUP_STAGE.mainStage.val;
    while (currentStage !== undefined && currentStage.mainStage.val === expectedStageVal) {
      ns.print('INFO: Cycle start stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
      switch (currentStage.mainStage.val) {
        case expectedStageVal: {
          await manageStage(ns, currentStage);
          break;
        }
        // this should not be needed.. better safe than sorry :D
        default: {
          setupComplete = true;
          break;
        }
      }
      if (setupComplete) break;
      currentStage = checkAndUpdateStage(ns, currentStage);
      ns.print('INFO: Cycle end stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
      await ns.sleep(500);
    }

    if (!error) {
      ns.print('SUCCESS Agri startup complete, moving into mantainance.');
      ns.tail();
    }
    ns.spawn(CORP_STARTUP, 1);
  } catch (e) {
    ns.print('ERROR ', e);
    ns.tail();
  }
}

async function manageStage(ns: NS, currentStage: CorpSetupStage) {
  const c = ns.corporation;
  switch (currentStage.subStage.val) {
    case 0: {
      c.expandIndustry('Agriculture', AGRI_DIV_NAME);
      break;
    }
    case 1: {
      c.unlockUpgrade(UNLOCKS.SSU);
      break;
    }
    case 2: {
      for (const city of Object.values(ns.enums.CityName)) {
        if (!c.getDivision(AGRI_DIV_NAME).cities.includes(city)) {
          c.expandCity(AGRI_DIV_NAME, city);
          c.purchaseWarehouse(AGRI_DIV_NAME, city);
        }
        c.setSmartSupply(AGRI_DIV_NAME, city, true);
        while (c.hireEmployee(AGRI_DIV_NAME, city)) {}
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.OPS, 1);
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.ENG, 1);
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.BUS, 1);
        c.sellMaterial(AGRI_DIV_NAME, city, 'Plants', 'MAX', 'MP');
        c.sellMaterial(AGRI_DIV_NAME, city, 'Food', 'MAX', 'MP');
      }
      break;
    }
    case 3: {
      c.hireAdVert(AGRI_DIV_NAME);
      break;
    }
    case 4: {
      for (const city of Object.values(ns.enums.CityName)) {
        while (c.getWarehouse(AGRI_DIV_NAME, city).size < 300) {
          c.upgradeWarehouse(AGRI_DIV_NAME, city);
        }
      }
      break;
    }
    case 5: {
      for (const upgr of CORP_SETUP_UPGRADES) {
        while (c.getUpgradeLevel(upgr) < 2) {
          c.levelUpgrade(upgr);
        }
      }
      break;
    }
    case 6: {
      await purchaseAgroMaterials(ns, AGRI_MATERIAL.stage1);
      break;
    }
    case 7: {
      await speedEmployeeStats(ns, currentStage);
      break;
    }
  }
}
