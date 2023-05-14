export class CorpSetupStage {
  mainStage: Stage;
  subStage: Stage;
  subStages: Stage[];
  lastEmpStatsCheck = -1;
  constructor(mainStage: Stage, subStages: Stage[]) {
    this.mainStage = mainStage;
    this.subStages = subStages;
    this.subStage = subStages[0];
  }

  nextStage() {
    this.subStage = this.subStages[this.subStage.val + 1];
  }
}

export class Stage {
  name: string;
  val: number;
  constructor(name: string, val: number) {
    this.name = name;
    this.val = val;
  }
}

export const CORP_AGRI_SETUP_STAGE = new CorpSetupStage(new Stage('SetupAgri', 0), [
  new Stage('CreateDivision', 0),
  new Stage('BuySmartSupply', 1),
  new Stage('ExpandToCities', 2),
  new Stage('BuyAdvert', 3),
  new Stage('ExpandWarehouse', 4),
  new Stage('BuyUpgrades', 5),
  new Stage('BuyMaterials', 6),
  new Stage('WaitForEmployees', 7),
]);

export const CORP_AGRI_MAN_STAGE = new CorpSetupStage(new Stage('ManAgri', 1), [
  new Stage('1stInvestor', 0),
  new Stage('UpgradeEmployees', 1),
  new Stage('BuyUpgrades', 2),
  new Stage('ExpandWarehouse', 3),
  new Stage('BuyMaterials', 4),
  new Stage('WaitForEmployees', 5),
  new Stage('2ndInvestor', 6),
  new Stage('ExpandWarehouse2', 7),
  new Stage('BuyMaterials2', 8),
]);

export const CORP_STAGES = [CORP_AGRI_SETUP_STAGE, CORP_AGRI_MAN_STAGE];

// | new CorpSetupStage('ManageAgri') | new CorpSetupStage('SetupTobacchi') | new CorpSetupStage('Mantainance')
