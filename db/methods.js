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

export const getClient =
  () => ({
    _instance: null,

    async connect() {
      if (!this._instance) {
        this._instance = await pool.connect();
      }

      return this._instance;
    },

    async query(...args) {
      if (!this._instance) {
        return;
      }

      return await (
        this
          ._instance
          .query(...args)
          .then(({ rows }) => rows)
          .catch(async (e) => {
            await this._instance.query("ROLLBACK");

            throw e;
          })
      );
    },

    async end() {
      if (!this._instance) {
        return;
      }

      await this._instance.release();
    },
  })
;
