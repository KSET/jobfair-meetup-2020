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

  /**
   * @returns {Promise<Client>}
   */
  static async connected() {
    return await (new Client()).connect();
  }

  /**
   * @returns {Promise<Client>}
   */
  static async inTransaction() {
    const client = await Client.connected();

    return await client.startTransaction();
  }

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

  async query(...args) {
    if (!this.#instance) {
      return;
    }

    return await (
      this
        .#instance
        .query(...args)
        .then(({ rows }) => rows)
        .catch(async (e) => {
          await this.query("ROLLBACK");

          throw e;
        })
    );
  }

  async queryOne(...args) {
    const res = await this.query(...args);

    if (!res) {
      return;
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
    if (!this.#instance) {
      return;
    }

    if (this.#inTransaction) {
      await this.commit();
    }

    await this.#instance.release();
  }
}

export const getClient =
  () => new Client()
;
