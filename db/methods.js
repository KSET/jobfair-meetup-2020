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
  () =>
    pool
      .connect()
;
