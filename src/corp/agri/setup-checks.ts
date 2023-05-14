import { CityName, Corporation, CorporationInfo, NS } from '@ns';
import { AGRI_DIV_NAME, AGRI_MATERIAL, UPGRADES } from 'const/corp';
import { checkAgroEmployeeStats, checkAgroMaterials, checkAgroWarehouse, checkUpgrades } from 'corp/utils/functions';
import { CORP_AGRI_SETUP_STAGE, CorpSetupStage } from 'corp/utils/stages';

export function checkAgriSetupStage(ns: NS, c: Corporation, corp: CorporationInfo): CorpSetupStage | undefined {
  let currentStage = CORP_AGRI_SETUP_STAGE;
  if (!corp.divisions.includes(AGRI_DIV_NAME)) {
    return CORP_AGRI_SETUP_STAGE;
  } else if (!c.hasUnlockUpgrade(UPGRADES.SSU)) {
    currentStage.subStage = currentStage.subStages[1];
  } else if (c.getDivision(AGRI_DIV_NAME).cities.length < Object.keys(CityName).length) {
    currentStage.subStage = currentStage.subStages[2];
  } else if (c.getDivision(AGRI_DIV_NAME).awareness + c.getDivision(AGRI_DIV_NAME).popularity < 0.1) {
    currentStage.subStage = currentStage.subStages[3];
  } else if (checkAgroWarehouse(c, 2)) {
    currentStage.subStage = currentStage.subStages[4];
  } else if (checkUpgrades(c, 2)) {
    currentStage.subStage = currentStage.subStages[5];
  } else if (checkAgroMaterials(c, AGRI_MATERIAL.stage1)) {
    currentStage.subStage = currentStage.subStages[6];
  } else if (!checkAgroEmployeeStats(ns, c)) {
    currentStage.subStage = currentStage.subStages[7];
  } else {
    // AGRI STARTUP COMPLETED
    return undefined;
  }
  return currentStage;
}
