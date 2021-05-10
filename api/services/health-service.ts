import {
  industriesQuery,
} from "../graphql/queries";
import type {
  Industry,
} from "../graphql/types";
import {
  graphQlQuery,
} from "../helpers/axios";

const PING_INTERVAL_MS = 30 * 1000;
const ON_ERROR_SLEEP_FOR_MS = 3 * 1000;

export default class HealthService {
  #live = true;

  #timer: ReturnType<typeof setInterval> | null = null;

  public static async start(): Promise<HealthService> {
    return await new this().startChecker();
  }

  public get isLive(): boolean {
    return this.#live;
  }

  public async check(): Promise<boolean> {
    this.#live = await this.doCheck();

    return this.#live;
  }

  public async startChecker(): Promise<this> {
    if (this.#timer) {
      clearInterval(this.#timer);
    }

    await this.check();
    this.#timer = setInterval(() => this.check(), PING_INTERVAL_MS);

    return this;
  }

  private async doCheck(): Promise<boolean> {
    for (let i = 0; 5 > i; i++) {
      try {
        const { industries }: { industries: Industry[] } = await graphQlQuery(industriesQuery());

        if (industries) {
          return true;
        }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, ON_ERROR_SLEEP_FOR_MS));
      }
    }

    return false;
  }
}
