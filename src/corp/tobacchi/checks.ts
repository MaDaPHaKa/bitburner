import { CityName, Corporation, CorporationInfo, NS } from '@ns';
import { TOB_DIV_NAME, TOB_PROD1_NAME, TOB_PROD2_NAME, TOB_PROD3_NAME, UPGRADES } from 'const/corp';
import { checkProductAtLeastDevelopment, checkTobEmployees, checkUpgrades, setSubstage } from 'corp/utils/functions';
import {
  CORP_TOB_MANTAINANCE_STAGE,
  CORP_TOB_MIDGAME_STAGE,
  CORP_TOB_SETUP_STAGE,
  CorpSetupStage,
} from 'corp/utils/stages';

// SETUP TOB CHECK
export function checkTobSetupStage(ns: NS, c: Corporation, corp: CorporationInfo): CorpSetupStage | undefined {
  let currentStage = undefined;
  if (!corp.divisions.includes(TOB_DIV_NAME)) {
    return CORP_TOB_SETUP_STAGE;
  } else if (c.getDivision(TOB_DIV_NAME).cities.length < Object.keys(CityName).length) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 1);
  } else if (checkTobEmployees(c, 30)) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 2);
  } else if (
    c.getDivision(TOB_DIV_NAME).products.length === 0 &&
    !checkProductAtLeastDevelopment(c, TOB_DIV_NAME, TOB_PROD1_NAME)
  ) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 3);
  } else if (
    !checkUpgrades(c, 20, [UPGRADES.FWI, UPGRADES.SPI, UPGRADES.NAC, UPGRADES.NNI]) &&
    !checkUpgrades(c, 30, [UPGRADES.DSE]) &&
    !checkUpgrades(c, 10, [UPGRADES.PIN])
  ) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 4);
  } else if (!checkProductAtLeastDevelopment(c, TOB_DIV_NAME, TOB_PROD2_NAME)) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 5);
  } else if (!checkUpgrades(c, 10, [UPGRADES.WAN])) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 6);
  }
  return currentStage;
}
export function checkTobMidGameStage(ns: NS, c: Corporation): CorpSetupStage | undefined {
  let currentStage = undefined;
  if (c.getDivision(TOB_DIV_NAME).products.length < 3) {
    return CORP_TOB_MIDGAME_STAGE;
  }
  return currentStage;
}
// MANTAINANCE TOBACCHI CHECK
export function checkTobManStage(ns: NS, c: Corporation): CorpSetupStage | undefined {
  if (c.getDivision(TOB_DIV_NAME).products.length >= 3) return CORP_TOB_MANTAINANCE_STAGE;
  return undefined;
}
