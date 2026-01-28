import { exec } from "child_process";
import ipExtractor from "./ipExtractor.js";
import macExtractror from "./macExtractror.js";

export default async function nmapScan(
  ipRange,
  scanPort = true,
  privileged = true,
) {
  return new Promise((resolve, reject) => {
    const params = scanPort ? "-F" : "-sn";
    const runPrivileged = privileged ? "--privileged" : " ";
    exec(
      `nmap ${runPrivileged} ${params} ${ipRange}`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          //reject(error);
        } else {
          const result = stdout
            .split("Nmap scan report for ")
            .map((terminal) => {
              const line = terminal.split("\n");
              const macLine = terminal.split("MAC Address:");
              const ip = ipExtractor(line[0]);
              const hostname = " ";
              const mac = macExtractror(macLine[1]);
              const macDescription = macLine[1]?.match(/\(([^)]+)\)/)
                ? macLine[1]?.match(/\(([^)]+)\)/)[0]?.replace(/\(|\)/gi, "")
                : "";
              const port = scanPort
                ? terminal
                    .split("SERVICE\n")[1]
                    ?.split("\n")
                    .filter(
                      (n) =>
                        n !== "" && !n.includes("Nmap") && !n.includes("MAC"),
                    )
                : null;
              return {
                ip: ip,
                hostname: hostname,
                mac: mac,
                port: port,
                macDescription: macDescription,
                os: " ",
              };
            });
          resolve(result.filter((n) => !n.ip.includes(" ")));
        }
      },
    );
  });
}

//const ipToScan = "192.168.200.1/24"
//const ipToScan = "192.168.200.252"
//const ipToScan = "192.168.200.232-255";
// const ipToScan = "192.168.200.1-255";
// const a = await nmapScan(ipToScan, true);
// console.log("out",a);
