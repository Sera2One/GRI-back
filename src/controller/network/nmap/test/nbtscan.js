import { exec } from "child_process";
const startIP = '192.168.200.0';
const number = '255' ;
var array = [];
// nbtscan ${startIP}-${number}

exec(`nbtscan -q 192.168.200.0-255` , (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    
    stdout.split('\n').forEach(element => {
        const hostIP = element.replace(/  +/g, ' ').split(' ')[0]
        const hostName = element.replace(/  +/g, ' ').split(' ')[1]
        console.log('hostIP',hostIP);
        console.log('hostName',hostName);
        array.push({hostIP: hostIP, hostName : hostName})
    });

    console.log(array);
  });