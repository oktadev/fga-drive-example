import "server-only";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
});

export const query = (
  text: string,
  params: Array<unknown>,
  callback?: () => void,
) => {
  return pool.query(text, params, callback);
};
