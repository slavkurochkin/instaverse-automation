import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres", // Use the environment variable, fallback to 'postgres'
  host: process.env.POSTGRES_HOST || "localhost", // Use the environment variable, fallback to 'postgres'
  database: process.env.POSTGRES_DB || "instaverse", // Use the environment variable, fallback to 'instaverse'
  password: process.env.POSTGRES_PASSWORD || "123", // Use the environment variable, fallback to '123'
  port: process.env.POSTGRES_PORT || 5432, // Use the environment variable, fallback to 5432
});

export default pool;
