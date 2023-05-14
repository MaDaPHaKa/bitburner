import { Corporation, CorporationInfo, NS } from '@ns';
import { AGRI_MATERIAL, UPGRADES } from 'const/corp';
import {
  checkAgroEmployeeStats,
  checkAgroEmployees,
  checkAgroMaterials,
  checkAgroWarehouse,
  checkUpgrades,
} from 'corp/utils/functions';
import { CORP_AGRI_MAN_STAGE, CorpSetupStage } from 'corp/utils/stages';

export function checkAgriManStage(ns: NS, c: Corporation, corp: CorporationInfo): CorpSetupStage | undefined {
  let currentStage = CORP_AGRI_MAN_STAGE;
  if (c.getInvestmentOffer().round === 1) {
    return CORP_AGRI_MAN_STAGE;
  } else if (checkAgroEmployees(c, false)) {
    currentStage.subStage = currentStage.subStages[1];
  } else if (checkUpgrades(c, 10, [UPGRADES.SFA, UPGRADES.SST])) {
    currentStage.subStage = currentStage.subStages[2];
  } else if (checkAgroWarehouse(c, 9)) {
    currentStage.subStage = currentStage.subStages[3];
  } else if (checkAgroMaterials(c, AGRI_MATERIAL.stage2)) {
    currentStage.subStage = currentStage.subStages[4];
  } else if (checkAgroEmployeeStats(ns, c)) {
    currentStage.subStage = currentStage.subStages[5];
  } else if (c.getInvestmentOffer().round === 2) {
    currentStage.subStage = currentStage.subStages[6];
  } else if (checkAgroWarehouse(c, 18)) {
    currentStage.subStage = currentStage.subStages[7];
  } else if (checkAgroMaterials(c, AGRI_MATERIAL.stage3)) {
    currentStage.subStage = currentStage.subStages[7];
  } else {
    // AGRI MANTAINANCE COMPLETED
    return undefined;
  }
  return currentStage;
}
