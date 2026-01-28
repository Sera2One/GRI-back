import { exec } from "child_process";
import { hostname } from "os";
import getMacAdresse from "./getMacAdresse.js";
import ipExtractor from "./ipExtractor.js";

const ipToScan = "192.168.200.1/24"

export async function CompleteScan(ipRange){
    var nmapScan = [];
    var nbtScan = [];
    exec(`nmap -PS  ${ipRange}` , (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        const vag = stdout.split('Nmap scan report for ').map((terminal)=>{
            const ip = terminal.split('\n')[0];
            const hostname = " ";
            const mac = " ";
            const port = terminal.split('SERVICE\n')[1]?.split('\n').filter((n)=> n!=='' && !n.includes('Nmap') );
            return {ip : ip , hostname : hostname , port: port, mac : mac  }
        })
        
        nmapScan =  vag.filter((n)=>!n.ip.includes('Nmap'));

        exec(`nbtscan -q ${ipRange}` , (error, stdout, stderr) => {
            if (error) {
              console.log(`error: ${error.message}`);
              return;
            }
            
            stdout.split('\n').forEach(element => {
                const ip = element.replace(/  +/g, ' ').split(' ')[0]
                const hostname = element.replace(/  +/g, ' ').split(' ')[1]
                nbtScan.push({ip: ip, hostname : hostname})
            });
            const result = nmapScan.map( async (allScanedIP) =>{
                allScanedIP.ip = ipExtractor(allScanedIP.ip);
                allScanedIP.mac = await getMacAdresse(allScanedIP.ip,"eno1")
                nbtScan.map((WindowsIP)=>{
                if(allScanedIP.ip === WindowsIP.ip){
                  allScanedIP.hostname = WindowsIP.hostname;
                }
              } )
            return allScanedIP;
            });
      
           
        //   const message = `Voici la liste des addresse IP scané.`;
        //   res.json({ message, data: allData })
            //console.log(result);
            //console.log(nbtScan);
            Promise.all(result).then((results) => {
                console.log(results);
                // return results; // If needed for further processing
              });
            return nmapScan;
      
          });

        //return vag.filter((n)=>!n.ip.includes('Nmap'));
      });
}

CompleteScan(ipToScan);



