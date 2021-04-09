import {
  Pool,
} from "pg";

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const query =
  <T>(
    text: string,
    params?: unknown[],
  ): T[] => {
    try {
      return pool
        .query(text, params)
        .then(({ rows }) => rows || []);
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
  #instance;

  #inTransaction = false;

  #ended = false;

  static async connected(): Promise<Client> {
    return await (new Client()).connect();
  }

  static async queryOnce<T>(...args: Query[]): Promise<T[] | null> {
    let client;
    try {
      client = await this.connected();

      return await client.query(...args);
    } finally {
      if (client) {
        await client.end();
      }
    }
  }

  static async queryOneOnce<T>(...args: Query[]): Promise<T | null> {
    let client;
    try {
      client = await this.connected();

      return await client.queryOne(...args);
    } finally {
      if (client) {
        await client.end();
      }
    }
  }

  static async inTransaction(): Promise<Client> {
    const client = await Client.connected();

    return await client.startTransaction();
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
      const { rows } = await this.#instance.query(...args);

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
      await this.end();
    }
  }

  async rollback(end = false): Promise<void> {
    await this.query("ROLLBACK");

    this.#inTransaction = false;

    if (end) {
      await this.end();
    }
  }

  async end(): Promise<void> {
    if (!this.isQueryable) {
      return;
    }

    await this.#instance.release();
    this.#ended = true;
  }
}

export const getClient =
  (): Client => new Client()
;
