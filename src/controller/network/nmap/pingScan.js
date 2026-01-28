import { exec } from "child_process";
export default function pingScan(ip, nbPacketTransmit = 1, timeout = 1) {
  return new Promise((resolve, reject) => {
    exec(
      `ping -c${nbPacketTransmit} -w ${timeout} ${ip}, `,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          //reject(error);
        } else {
          console.log(`stdout: ${stdout}`);
          const lines = stdout.split("\n");
          //console.log()
          const statisticsLines = lines.filter(
            (line) =>
              line.includes("packets transmitted") &&
              line.includes("packet loss"),
          );
          const [_, receivedPackets, packetLoss] =
            statisticsLines[0].split(", ");

          const ttl = lines[1].split("ttl")[1].match(/\d+/g)[0];
          const time = lines[1].split("ttl")[1].split("time=")[1];
          const Os =
            ttl > 128
              ? "Network devices"
              : ttl > 64
                ? "Windows"
                : "Linux/MAC OSX";

          resolve({
            Os: Os,
            time: time,
            ttl: ttl,
            receivedPackets: receivedPackets.trim(),
            packetLoss: packetLoss.trim(),
          });
        }
      },
    );
  });
}

console.log(await pingScan("192.168.200.216", 4));
