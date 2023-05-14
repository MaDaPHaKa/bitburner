import { CityName, Corporation, CorporationInfo, NS } from '@ns';
import { AGRI_DIV_NAME, AGRI_MATERIAL, CORP_NAME, CORP_SETUP_UPGRADES, JOBS, UPGRADES } from 'const/corp';
import { CORP_STARTUP } from 'const/scripts';
import { checkAndUpdateStage, purchaseAgroMaterials } from 'corp/utils/functions';
import { CorpSetupStage } from 'corp/utils/stages';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  const c: Corporation = ns.corporation;
  if (!c.hasCorporation()) {
    const created = c.createCorporation(CORP_NAME, false);
    if (!created) c.createCorporation(CORP_NAME, true);
  }
  const corp: CorporationInfo = c.getCorporation();
  let currentStage: CorpSetupStage = checkAndUpdateStage(ns, c, corp);
  let setupComplete = false;
  if (currentStage === undefined) {
    ns.print('ERROR undefined stage!');
    ns.tail();
  }
  while (true) {
    ns.print('INFO: Cycle start stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
    switch (currentStage.mainStage.val) {
      case 0: {
        setupAgri(c, currentStage);
        break;
      }
      default: {
        setupComplete = true;
        break;
      }
    }
    if (setupComplete) break;
    currentStage = checkAndUpdateStage(ns, c, corp);
    ns.print('INFO: Cycle end stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
    await ns.sleep(500);
  }
  ns.spawn(CORP_STARTUP, 1);
}

function setupAgri(c: Corporation, currentStage: CorpSetupStage) {
  switch (currentStage.subStage.val) {
    case 0: {
      c.expandIndustry('Agriculture', AGRI_DIV_NAME);
    }
    case 1: {
      c.unlockUpgrade(UPGRADES.SSU);
    }
    case 2: {
      for (const city of Object.values(CityName)) {
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
    }
    case 3: {
      c.hireAdVert(AGRI_DIV_NAME);
    }
    case 4: {
      for (const city of Object.values(CityName)) {
        while (c.getWarehouse(AGRI_DIV_NAME, city).level < 2) {
          c.upgradeWarehouse(AGRI_DIV_NAME, city);
        }
      }
    }
    case 5: {
      for (const upgr of CORP_SETUP_UPGRADES) {
        while (c.getUpgradeLevel(upgr) < 2) {
          c.levelUpgrade(upgr);
        }
      }
    }
    case 6: {
      purchaseAgroMaterials(c, AGRI_MATERIAL.stage1);
    }
  }
}
