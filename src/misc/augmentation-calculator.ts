import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const augmentations: Augmentation[] = [
    // TIANDAN
    // new Augmentation('Wired Reflexes', 2500000, 'tiandan'),
    // new Augmentation('Speech Enhancement', 12500000, 'tiandan'),
    // new Augmentation('ADR-V1 Pheromone Gene', 17500000, 'tiandan'),
    // new Augmentation('Nuoptimal Nootropic Injector Implant', 20000000, 'tiandan'),
    // new Augmentation('Social Negotiation Assistant (S.N.A)', 30000000, 'tiandan'),
    // new Augmentation('Speech Processor Implant', 50000000, 'tiandan'),
    // new Augmentation('Nanofiber Weave', 125000000, 'tiandan'),
    // new Augmentation('Neuroreceptor Management Implant', 550000000, 'tiandan'),

    // SEC12
    // new Augmentation('Augmented Targeting I', 15000000, 'sec12'),
    // new Augmentation('Augmented Targeting II', 42500000, 'sec12'),
    // new Augmentation('Speech Processor Implant', 50000000, 'sec12'),
    // new Augmentation('CashRoot Starter Kit', 125000000, 'sec12'),
    new Augmentation('Neuralstimulator', 3000000000, 'sec12'),

    // CSEC
    // new Augmentation('Neurotrainer I', 4000000, 'csec'),
    // new Augmentation('Synaptic Enhancement Implant', 7500000, 'csec'),
    // new Augmentation('BitWire', 10000000, 'csec'),
    // new Augmentation('Cranial Signal Processors - Gen I', 70000000, 'csec'),
    new Augmentation('Cranial Signal Processors - Gen II', 125000000, 'csec'),

    // NITESEC
    new Augmentation('Neurotrainer II', 45000000, 'nitesec'),
    new Augmentation('Artificial Synaptic Potentiation', 80000000, 'nitesec'),
    new Augmentation('Cranial Signal Processors - Gen II', 125000000, 'nitesec'),
    new Augmentation('CRTX42-AA Gene Modification', 225000000, 'nitesec'),
    new Augmentation('Neural-Retention Enhancement', 250000000, 'nitesec'),
    new Augmentation('Embedded Netburner Module', 250000000, 'nitesec'),
    new Augmentation('DataJack', 450000000, 'nitesec'),
    new Augmentation('Cranial Signal Processors - Gen III', 550000000, 'nitesec'),
    new Augmentation('BitWire', 10000000, 'nitesec'),
    new Augmentation('Cranial Signal Processors - Gen I', 70000000, 'nitesec'),

    // BLACK HAND
    new Augmentation('Artificial Synaptic Potentiation', 80000000, 'blackhand'),
    new Augmentation('Embedded Netburner Module', 250000000, 'blackhand'),
    new Augmentation('DataJack', 450000000, 'blackhand'),
    new Augmentation('Cranial Signal Processors - Gen III', 550000000, 'blackhand'),
    new Augmentation('The Black Hand', 550000000, 'blackhand'),
    new Augmentation('Cranial Signal Processors - Gen IV', 1100000000, 'blackhand'),
    new Augmentation('Enhanced Myelin Sheathing', 1375000000, 'blackhand'),
    new Augmentation('Embedded Netburner Module Core Implant', 2500000000, 'blackhand'),
    new Augmentation('Neuralstimulator', 3000000000, 'blackhand'),
  ];
  const singled: Augmentation[] = [];
  augmentations.forEach((el) => {
    const duplicate = singled.find((sin) => el.name == sin.name);
    if (duplicate) {
      duplicate.faction += '/' + el.faction;
    } else {
      singled.push(el);
    }
  });
  singled.sort(function (a, b) {
    return b.cost - a.cost;
  });
  ns.tprint('ordine acquisto: ', singled);
  const costoTotale = calcolaSpesa(singled);
  ns.tprint('costo totale: ', ns.formatNumber(costoTotale, 3));
}

function calcolaSpesa(augmentations: Augmentation[] = []) {
  if (augmentations.length <= 0) return 0;
  const comprato: Augmentation | undefined = augmentations.shift();
  if (comprato) {
    let costo = comprato.cost;
    augmentations.forEach((el) => {
      el.cost = el.cost * 2;
    });
    augmentations.sort(function (a, b) {
      return b.cost - a.cost;
    });
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
