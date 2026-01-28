import { exec } from "child_process";
import ipExtractor from "./ipExtractor.js";
import macExtractror from "./macExtractror.js";

export default async function macScan(ipRange) {
  return new Promise((resolve, reject) => {
    exec(`arp-scan ${ipRange}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        //reject(error);
      } else {
        const pattern = /Starting(.*?)packets received/s;
        const line = stdout.match(pattern)[1].split("\n").slice(1, -2);
        const result = line.map((terminal) => {
          const ip = ipExtractor(terminal);
          const mac = macExtractror(terminal);
          const macDescription = terminal.split("\t")[2];
          return { ip: ip, mac: mac, macDescription: macDescription };
        });
        //console.log(result)
        resolve(result);
      }
    });
  });
}

//const ipToScan = "192.168.200.1/24"
//const ipToScan = "192.168.200.252"
//const ipToScan = "192.168.200.232-255";
// const ipToScan = "192.168.200.1-255";
//const a = await macScan(ipToScan);
//console.log("out",a);
