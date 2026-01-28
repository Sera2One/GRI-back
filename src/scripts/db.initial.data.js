import { exec } from "child_process";
import "dotenv/config";

function dbInitial(){
    const DB_DATABASE= process.env.DB_DATABASE;
    const DB_USERNAME= process.env.DB_USERNAME;
    const DB_FILE_PATH="./src/db/seeders/initial-data.sql";
    exec(`psql -U ${DB_USERNAME} -d ${DB_DATABASE} -f ${DB_FILE_PATH} `, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
      }
      if (stderr) {
        console.log(`stderr: ${stderr.message}`);
      }
      console.log(`stdout: ${stdout}`);
    });
  };

  dbInitial();