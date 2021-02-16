import {
  post,
} from "../helpers/axios";
import SettingsService from "./settings-service";

const clamp = (min, max, number) => Math.max(min, Math.min(number, max));

class GotifyPayload {
  /**
   * @type string
   */
  #message;

  /**
   * @type string
   */
  #title;

  /**
   * @type number
   */
  #priority;

  constructor(message, title = "", priority = 5) {
    this.#message = message;
    this.#title = title;
    this.#priority = clamp(1, 10, priority);
  }

  /**
   * @returns {string}
   */
  urlencoded() {
    const payload = {
      message: this.#message,
      priority: this.#priority,
    };

    if (this.#title) {
      payload.title = this.#title;
    }

    return (
      Object
        .entries(payload)
        .map(([ k, v ]) => `${ encodeURIComponent(k) }=${ encodeURIComponent(v) }`)
        .join("&")
    );
  }
}

export default class MobileNotificationService {
  /**
   * @param {string} title
   * @param {string} message
   * @param {number} priority
   * @returns {Promise<null|*>}
   */
  static async notify({ message, title = "", priority = 5 }) {
    const payload = new GotifyPayload(message, title, priority);

    return await this.#send(payload);
  }

  /**
   * @param {GotifyPayload} payload
   * @returns {Promise<null|*>}
   */
  static async #send(payload) {
    const endpointUrl = await this.#messageEndpoint();

    if (!endpointUrl) {
      return null;
    }

    return await post(
      endpointUrl,
      payload.urlencoded(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
  }

  /**
   * @returns {Promise<string|null>}
   */
  static async #messageEndpoint() {
    const endpointUrl = await SettingsService.getValue("Gotify Base URL");
    const appToken = await SettingsService.getValue("Gotify App Token");

    if (!endpointUrl || !appToken) {
      return null;
    }

    const { origin } = new URL(endpointUrl);

    if (!origin) {
      return null;
    }

    return `${ origin }/message?token=${ encodeURIComponent(appToken) }`;
  }
}
