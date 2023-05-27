import { NS } from '@ns';

export class FileHandler {
  #file: string;
  #ns: NS;

  constructor(ns: NS, file: string) {
    this.#ns = ns;
    this.#file = file;
  }

  newFile() {
    this.#ns.write(this.#file, '', 'w');
  }

  write(data: any, mode: 'w' | 'a' | undefined = 'a') {
    this.#ns.write(this.#file, JSON.stringify(data), mode);
  }

  writeText(data: any, mode: 'w' | 'a' | undefined = 'a') {
    this.#ns.write(this.#file, data, mode);
  }

  read() {
    const dataString = this.#ns.read(this.#file);
    if (dataString.length > 1) {
      return JSON.parse(dataString);
    } else {
      return [];
    }
  }
}
