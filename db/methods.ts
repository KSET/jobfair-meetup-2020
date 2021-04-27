import type {
  PoolClient,
} from "pg";
import {
  Pool,
} from "pg";

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const query =
  async <T>(
    text: string,
    params?: unknown[],
  ): Promise<T[]> => {
    try {
      const result = await pool.query<T>(text, params);

      return result.rows || [];
    } catch (e) {
      console.log("|> QUERY ERROR", e);

      return [];
    }
  }
;

interface QueryByObject {
  text: string;
  values?: unknown[];
}

export type Query = QueryByObject | string;

export class Client {
  #instance: PoolClient;

  #inTransaction = false;

  #ended = false;

  static async connected(): Promise<Client> {
    return await (new Client()).connect();
  }

  static async queryOnce<T>(...args: Query[]): Promise<T[] | null> {
    return await this.once(
      (client) =>
        client.query<T>(...args)
      ,
    );
  }

  static async queryOneOnce<T>(...args: Query[]): Promise<T | null> {
    const rows = await this.queryOnce<T>(...args);

    return rows?.pop() || null;
  }

  static async inTransaction(): Promise<Client> {
    const client = await Client.connected();

    return await client.startTransaction();
  }

  static async transaction<T>(fn: (client: Client) => Promise<T>): Promise<T> {
    return await this.once<T>(async (client) => {
      try {
        await client.startTransaction();
        const result = await fn(client);
        await client.commit();

        return result;
      } catch (e) {
        await client.rollback();
        throw e;
      }
    });
  }

  static async once<T>(fn: (client: Client) => Promise<T>): Promise<T> {
    const client = new Client();
    try {
      await client.connect();

      return await fn(client);
    } finally {
      client.end();
    }
  }

  get isQueryable(): boolean {
    return this.#instance && !this.#ended;
  }

  async connect(): Promise<this> {
    if (!this.#instance) {
      this.#instance = await pool.connect();
    }

    return this;
  }

  async startTransaction(): Promise<this> {
    await this.connect();

    if (!this.#inTransaction) {
      await this.query("BEGIN");

      this.#inTransaction = true;
    }

    return this;
  }

  async query<T>(...args: Query[]): Promise<T[] | null> {
    if (!this.isQueryable) {
      return null;
    }

    try {
      const [ first, ...rest ] = args as any[];
      const { rows } = await this.#instance.query<T>(first, ...rest);

      return rows;
    } catch (e) {
      await this.query("ROLLBACK");
      throw e;
    }
  }

  async queryOne<T>(...args: Query[]): Promise<T | null> {
    const res: T[] | null = await this.query(...args);

    if (!res) {
      return null;
    }

    return res.pop() || null;
  }

  async commit(end = false): Promise<void> {
    await this.query("COMMIT");

    this.#inTransaction = false;

    if (end) {
      this.end();
    }
  }

  async rollback(end = false): Promise<void> {
    await this.query("ROLLBACK");

    this.#inTransaction = false;

    if (end) {
      this.end();
    }
  }

  end(): void {
    if (!this.isQueryable) {
      return;
    }

    this.#instance.release();
    this.#ended = true;
  }
}

export const getClient =
  (): Client => new Client()
;
