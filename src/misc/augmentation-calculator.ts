import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  const augmentations: Augmentation[] = [
    new Augmentation("DataJack", 450000000, "tokyo/nitesec"),
    new Augmentation("Neuregen Gene Modification", 375000000, "chancho"),
    new Augmentation(
      "Cranial Signal Processors - Gen III",
      550000000,
      "nitesec"
    ),
    new Augmentation("CRTX42-AA Gene Modification", 225000000, "nitesec"),
    new Augmentation("Neural-Retention Enhancement", 250000000, "nitesec"),
    new Augmentation("Embedded Netburner Module", 250000000, "nitesec"),
    new Augmentation("Neurotrainer II", 45000000, "nitesec"),
    new Augmentation("Artificial Synaptic Potentiation", 80000000, "nitesec"),
    new Augmentation("INFRARET Enhancement", 30000000, "ishima"),
    new Augmentation("Combat Rib I", 23000000, "nitesec"),
    new Augmentation("NutriGen Implant", 2500000, "tokio"),
    // new Augmentation("Artificial Synaptic Potentiation", 80000, "black hand"),
    // new Augmentation("Embedded Netburner Module", 250000000, "black hand"),
    // new Augmentation("Enhanced Myelin Sheathing", 1375000000, "black hand"),
    // new Augmentation("The Black Hand", 550000000, "black hand"),
    // // richiedono roba sopra, si comprano next iteration
    // new Augmentation(
    //   "Cranial Signal Processors - Gen IV",
    //   1100000000,
    //   "black hand"
    // ),
    // new Augmentation(
    //   "Embedded Netburner Module Core Implant",
    //   2500000000,
    //   "black hand"
    // ),
  ];
  const singled: Augmentation[] = [];
  augmentations.forEach((el) => {
    if (!singled.find((sin) => el.name == sin.name)) {
      singled.push(el);
    }
  });
  singled
    .sort(function (a, b) {
      return a.cost - b.cost;
    })
    .reverse();
  ns.tprint("ordine acquisto: ", augmentations);
  const costoTotale = calcolaSpesa(augmentations);
  ns.tprint("costo totale: ", ns.formatNumber(costoTotale, 3));
}

function calcolaSpesa(augmentations: Augmentation[] = []) {
  if (augmentations.length <= 0) return 0;
  const comprato: Augmentation | undefined = augmentations.shift();
  if (comprato) {
    let costo = comprato.cost;
    augmentations.forEach((el) => {
      el.cost = el.cost * 2;
    });
    augmentations
      .sort(function (a, b) {
        return a.cost - b.cost;
      })
      .reverse();
    costo += calcolaSpesa(augmentations);
    return costo;
  }
  return 0;
}

export class Augmentation {
  name: string;
  cost: number;
  faction: string;

  constructor(name: string, cost: number, faction: string) {
    this.name = name;
    this.cost = cost;
    this.faction = faction;
  }
}
