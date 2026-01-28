import { exec } from "child_process";

export default async function windowScan(ipRange) {
  var result = [];
  return new Promise((resolve, reject) => {
    exec(`nbtscan -q ${ipRange}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        //reject(error);
      } else {
        stdout.split("\n").forEach((element) => {
          const ip = element.replace(/  +/g, " ").split(" ")[0];
          const hostname = element.replace(/  +/g, " ").split(" ")[1];
          const mac = element.replace(/  +/g, " ").split(" ")[4];
          if (ip) {
            result.push({
              ip: ip,
              hostname: hostname,
              mac: mac,
              os: "windows",
            });
          }
        });
        resolve(result);
      }
    });
  });
}

// const ipToScan = "192.168.200.1/24"
// const a = await windowScan(ipToScan);
// console.log("out",a);
