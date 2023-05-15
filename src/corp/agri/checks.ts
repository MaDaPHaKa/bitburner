import { CityName, Corporation, CorporationInfo, NS } from '@ns';
import { AGRI_DIV_NAME, AGRI_MATERIAL, UNLOCKS, UPGRADES } from 'const/corp';
import {
  checkAgroEmployees,
  checkAgroMaterials,
  checkAgroWarehouse,
  checkEmployeeStats,
  checkUpgrades,
  setSubstage,
} from 'corp/utils/functions';
import { CORP_AGRI_MAN_STAGE, CORP_AGRI_SETUP_STAGE, CorpSetupStage } from 'corp/utils/stages';

// SETUP AGRI CHECK
export function checkAgriSetupStage(ns: NS, c: Corporation, corp: CorporationInfo): CorpSetupStage | undefined {
  let currentStage = undefined;
  if (!corp.divisions.includes(AGRI_DIV_NAME)) {
    return CORP_AGRI_SETUP_STAGE;
  } else if (!c.hasUnlockUpgrade(UNLOCKS.SSU)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 1);
  } else if (c.getDivision(AGRI_DIV_NAME).cities.length < Object.keys(CityName).length) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 2);
  } else if (c.getDivision(AGRI_DIV_NAME).awareness + c.getDivision(AGRI_DIV_NAME).popularity < 0.1) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 3);
  } else if (!checkAgroWarehouse(c, 2)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 4);
  } else if (!checkUpgrades(c, 2)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 5);
  } else if (!checkAgroMaterials(c, AGRI_MATERIAL.stage1)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 6);
  } else if (!checkEmployeeStats(ns, c)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 7);
  }
  return currentStage;
}

// MANTAINANCE AGRI CHECK
export function checkAgriManStage(ns: NS, c: Corporation): CorpSetupStage | undefined {
  let currentStage = undefined;
  if (c.getInvestmentOffer().round === 1) {
    return CORP_AGRI_MAN_STAGE;
  } else if (!checkAgroEmployees(c, false)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 1);
  } else if (!checkUpgrades(c, 10, [UPGRADES.SFA, UPGRADES.SST])) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 2);
  } else if (!checkAgroWarehouse(c, 9)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 3);
  } else if (!checkAgroMaterials(c, AGRI_MATERIAL.stage2)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 4);
  } else if (!checkEmployeeStats(ns, c)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 5);
  } else if (c.getInvestmentOffer().round === 2) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 6);
  } else if (!checkAgroWarehouse(c, 18)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 7);
  } else if (!checkAgroMaterials(c, AGRI_MATERIAL.stage3)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 8);
  }
  return currentStage;
}
