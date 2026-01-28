import { exec } from "child_process";
//get MAC Adress of linux or windows OS
//Ne pas scaner l'adresse IP du serveur avec arping

export default function getMacAdresse(ip = "", Interface = "") {
  return new Promise((resolve, reject) => {
    exec(`arping -I ${Interface} -c1 ${ip}`, (error, stdout, stderr) => {
      const noError = !error && !stderr;

      if (error) {
        console.log(`error: ${error.message}`);
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }

      if (noError) {
        //console.log(stdout.split('\n')[1].split('[')[1].split(']')[0] );
        console.log("str", stdout);
        resolve(stdout.split("\n")[1].split("[")[1].split("]")[0]);
      } else {
        resolve("null");
      }
    });
  });
}

//const a = await getMacAdresse("192.168.200.216","eno1");
//const b = await getMacAdresse("192.168.200.217","eno1");
//const a = await getMacAdresse("192.168.200.57","eno1");
//const a = await getMacAdresse("192.168.200.239","eno1");
// console.log(b);
//console.log('resu',a);
