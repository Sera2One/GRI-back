import { exec } from "child_process";
function getInterface() {
  exec(`ls /sys/class/net`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(stdout.split("\n").filter((a) => a));
  });
}
getInterface();
