import {
  createClientAsync,
} from "soap";
import {
  checkVAT,
  countries,
} from "jsvat";

const countriesWithoutBrazil = countries.filter(({ name }) => "Brazil" !== name);

export default class VatValidator {
  static get URL() {
    return "https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl";
  }

  static async validate(vat) {
    return {
      local: this.validateLocal(vat),
      remote: await this.validateRemote(vat),
    };
  }

  static async remoteInfo(vat) {
    vat = String(vat);

    if (3 > vat.length) {
      return false;
    }

    const countryCode = vat.slice(0, 2);
    const vatNumber = vat.slice(2);

    if (isNaN(Number(vatNumber))) {
      return false;
    }

    const args = {
      countryCode,
      vatNumber,
    };

    try {
      const client = await createClientAsync(this.URL);

      const [ result ] = await client.checkVatAsync(args);

      return this.#formatRemote(result);
    } catch {
      return null;
    }
  }

  static async validateRemote(vat) {
    const data = await this.remoteInfo(vat);

    return Boolean(data && data.valid);
  }

  static validateLocal(vat) {
    const { isValid } = checkVAT(vat, countriesWithoutBrazil);

    return isValid;
  }

  static #formatRemote(remoteData) {
    const {
            valid,
            name,
            address,
          } = remoteData;

    return {
      valid,
      address,
      legalName: name,
    };
  }
}
