const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const query =
  (text, params) => {
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

export class Client {
  #instance;

  #inTransaction = false;

  #ended = false;

  /**
   * @returns {Promise<Client>}
   */
  static async connected() {
    return await (new Client()).connect();
  }

  /**
   * @param args
   * @returns {Promise<Array<Object>|null>}
   */
  static async queryOnce(...args) {
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

  /**
   * @param args
   * @returns {Promise<Object|null>}
   */
  static async queryOneOnce(...args) {
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

  /**
   * @returns {Promise<Client>}
   */
  static async inTransaction() {
    const client = await Client.connected();

    return await client.startTransaction();
  }

  /**
   * @returns {boolean}
   */
  get #queryable() {
    return this.#instance && !this.#ended;
  }

  /**
   * @returns {Promise<Client>}
   */
  async connect() {
    if (!this.#instance) {
      this.#instance = await pool.connect();
    }

    return this;
  }

  async startTransaction() {
    if (!this.#inTransaction) {
      await this.query("BEGIN");

      this.#inTransaction = true;
    }

    return this;
  }

  /**
   * @param args
   * @returns {Promise<Array<Object>|null>}
   */
  async query(...args) {
    if (!this.#queryable) {
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

  /**
   * @param args
   * @returns {Promise<Object|null>}
   */
  async queryOne(...args) {
    const res = await this.query(...args);

    if (!res) {
      return null;
    }

    return res.pop();
  }

  async commit(end = false) {
    await this.query("COMMIT");

    this.#inTransaction = false;

    if (end) {
      await this.end();
    }
  }

  async rollback(end = false) {
    await this.query("ROLLBACK");

    this.#inTransaction = false;

    if (end) {
      await this.end();
    }
  }

  async end() {
    if (!this.#queryable) {
      return;
    }

    await this.#instance.release();
    this.#ended = true;
  }
}

export const getClient =
  () => new Client()
;
