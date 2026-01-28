import moment from "moment";
import nmapScan from "./nmapScan.js";
import windowScan from "./windowsScan.js";
import { sequelize } from "../../../db/config/database.js";
import initModels from "../../../db/models/init-models.js";
import macScan from "./macScan.js";
var models = initModels(sequelize);

export const scanIP = async (req, res) => {
  const ipToScan = "192.168.200.1/24";

  nmapScan(ipToScan).then((scanResult) => {
    console.log("scanning all mac addresse");
    macScan(ipToScan).then((scanMacResulte) => {
      console.log("scanning windows OS devices");
      windowScan(ipToScan).then(async (scanedWindow) => {
        const scanedWindowWithoutMac = scanedWindow.map((windowsDevice) => {
          return {
            ip: windowsDevice.ip,
            hostname: windowsDevice.hostname,
            os: "windows",
          };
        });
        let mergedWindows = [];
        let mergedMac = [];

        for (let i = 0; i < scanResult.length; i++) {
          mergedWindows.push({
            ...scanResult[i],
            ...scanedWindowWithoutMac.find(
              (itmInner) => itmInner.ip === scanResult[i].ip,
            ),
          });
        }

        //
        for (let i = 0; i < mergedWindows.length; i++) {
          mergedMac.push({
            ...mergedWindows[i],
            ...scanMacResulte.find(
              (itmInner) => itmInner.ip === mergedWindows[i].ip,
            ),
          });
        }

        const dataToSave = mergedMac.map((device, index) => {
          return {
            netScanCode:
              "scan_" +
              moment().format("YYYY-MM-DD_HH:mm:ss_SSS") +
              "_" +
              index,
            netScanDate: moment().format("YYYY-MM-DD HH:mm:ss"),
            netScanIpAddress: device.ip,
            netScanSnmpIsOn: false,
            netScanHasClientApp: false,
            netScanHostname: device.hostname,
            netScanMac: device.mac,
            netScanOperatingSystem: device.os,
            netScanInfo: JSON.stringify({
              macDescription: device.macDescription,
              port: device?.port?.join(" , "),
            }),
            netDevicesIsOk: true,
          };
        });

        const saveStatus = await models.NetworkScan.bulkCreate(dataToSave);
        const message = `Voici la liste des addresse IP scané.`;
        res.json({ message, data: dataToSave });
      });
    });
  });
};
