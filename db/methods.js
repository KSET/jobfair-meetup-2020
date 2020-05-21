const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const query =
  (text, params) =>
    pool
      .query(text, params)
      .then(({ rows }) => rows)
;

export const getClient =
  () =>
    pool
      .connect()
;
