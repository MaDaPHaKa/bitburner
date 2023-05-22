export class ServerInfo {
  name = '';
  minSecurity = -1;
  maxMoney = -1;
  weakenTm = Infinity;
  hackValue = 0;
  hackChance = 0;
  hackXp = 0;
  prepped = false;
  minHackLevel = 10000;
  currHackLevel = 0;
  score = -1;
  hwgwScore = -1;
  farmScore = -1;

  calcolaScore() {
    const hackLevelFactor = this.minHackLevel > this.currHackLevel * 0.65 ? 0.4 : 1;

    const upper = this.maxMoney * this.hackValue * this.currHackLevel;
    const lower = (this.weakenTm / 1000 / this.minSecurity) * this.minHackLevel;
    this.score = (upper / lower) * hackLevelFactor;
    if (isNaN(this.score)) {
      this.score = -1;
    }
    if (this.hackChance > 0.8) {
      this.hwgwScore = this.score;
    } else {
      this.hwgwScore = this.score / 2;
    }

    if (this.hackXp > 0) {
      this.farmScore = this.hackXp / (this.weakenTm / 1000);
    } else if (this.name == 'joesguns') {
      this.farmScore = 0;
    }
  }
}
