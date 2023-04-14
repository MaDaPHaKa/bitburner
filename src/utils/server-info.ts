export class ServerInfo {
  name: string = "";
  minSecurity = -1;
  maxMoney = -1;
  growValue = -1;
  growTm = Infinity;
  weakenTm = Infinity;
  hackTm = Infinity;
  hackValue = 0;
  hackChance = 0;
  prepped = false;
  minHackLevel = 10000;
  currHackLevel = 0;
  score = -1;
  prepScore = -1;
  cheesyScore = -1;
  cheesyScoreTest = -1;
  hgwgScore = -1;
  constructor() {}

  calcolaScore() {
    // scommentare dopo soft reset
    // if (this.minHackLevel > this.currHackLevel * 0.65) return;
    // if (this.minHackLevel > this.currHackLevel * 0.8) return;
    const hackLevelFactor =
      this.minHackLevel > this.currHackLevel * 0.65 ? 0.4 : 1;
    let upper = this.maxMoney * this.hackValue;
    let lower = Math.max(this.hackTm, this.weakenTm, this.growTm);
    this.score = (upper / lower) * hackLevelFactor;
    if (isNaN(this.score)) {
      this.score = -1;
    }
    lower = (this.hackTm + this.weakenTm + this.growTm) / 3;
    this.prepScore = (upper / lower) * hackLevelFactor;

    const maxminutes = 4;
    if (this.weakenTm > 1000 * 60 * maxminutes) this.cheesyScore = -1;

    this.cheesyScore = (this.maxMoney / this.minSecurity) * hackLevelFactor;
    upper = this.maxMoney * this.hackValue * this.currHackLevel;
    lower =
      (Math.max(this.hackTm, this.weakenTm, this.growTm) /
        1000 /
        this.minSecurity) *
      this.minHackLevel;
    this.cheesyScoreTest = (upper / lower) * hackLevelFactor;

    if (this.hackChance > 0.8) {
      this.hgwgScore = this.cheesyScoreTest;
    }
  }
}
