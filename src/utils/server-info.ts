export class ServerInfo {
  name: string = '';
  minSecurity = -1;
  maxMoney = -1;
  growTm = Infinity;
  weakenTm = Infinity;
  hackTm = Infinity;
  hackValue = 0;
  hackChance = 0;
  hackXp = 0;
  prepped = false;
  minHackLevel = 10000;
  currHackLevel = 0;
  score = -1;
  hgwgScore = -1;
  farmScore = -1;
  constructor() {}

  calcolaScore() {
    const hackLevelFactor = this.minHackLevel > this.currHackLevel * 0.65 ? 0.4 : 1;

    const upper = this.maxMoney * this.hackValue * this.currHackLevel;
    const lower = (Math.max(this.hackTm, this.weakenTm, this.growTm) / 1000 / this.minSecurity) * this.minHackLevel;
    this.score = (upper / lower) * hackLevelFactor;
    if (isNaN(this.score)) {
      this.score = -1;
    }
    if (this.hackChance > 0.8) {
      this.hgwgScore = this.score;
    }

    if (this.hackXp > 0) {
      this.farmScore = this.hackXp / (this.weakenTm / 1000);
    } else if (this.name == 'joesguns') {
      this.farmScore = 0;
    }
  }
}
