import { Sequelize } from "sequelize";
import "../../services/env.js";

const dbname = process.env.DB_DATABASE;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const dialect = process.env.DB_CONNECTION;
const port = process.env.DB_PORT;
const schema = process.env.DB_SCHEMA;
// disable logging; default: console.log
const ShowSQLLoggingInTerminale =  JSON.parse( process.env.APP_DEBUG );

// ✅ Forcer le fuseau UTC dans Node.js
process.env.TZ = 'UTC';

var sequelize;
if (!process.env.DB_DATABASE) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    "ERROR : Le fichier .env absent ou le repertoire d'execution ne se situe pas dans le même repertoire que .env"
  );
}

if (process.env.NODE_ENV) {
  if (process.env.NODE_ENV === "production") {
    sequelize = new Sequelize(dbname, username, password, {
      host: host,
      dialect: dialect,
      port: port,
      schema: schema ,
      logging: ShowSQLLoggingInTerminale,
    });
  }
} else {
  sequelize = new Sequelize(dbname, username, password, {
    host: host,
    dialect: dialect,
    port: port,
    schema: schema ,
    logging: ShowSQLLoggingInTerminale,
  });
}

export { sequelize };
