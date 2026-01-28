import { sequelize } from "../../db/config/database.js";
import { Op, Sequelize } from "sequelize";
import initModels from "../../db/models/init-models.js";
import moment from "moment";
var models = initModels(sequelize);

/************************************************************************
 **************** search and get all NetworkScanaires ******************************
 ************************************************************************/
export const getNetworkScanHistory = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = 0 + (page - 1) * limit;
  const netScanDate = req.query.netScanDate
    ? moment(req.query.netScanDate, "YYYY-MM-DD")
    : moment();
  const netScanTime = req.query.netScanTime
    ? moment(req.query.netScanTime, "HH:mm:ss")
    : null;

  try {
    let startDateTime, endDateTime, results;

    if (netScanTime) {
      startDateTime = moment(netScanDate).set({
        hour: netScanTime.get("hour"),
        minute: netScanTime.get("minute"),
        second: netScanTime.get("second"),
      });
      endDateTime = startDateTime.clone().endOf("day");

      results = await models.NetworkScan.findAll({
        where: {
          netScanDate: {
            [Op.between]: [startDateTime.toDate(), endDateTime.toDate()],
          },
        },
        offset: offset,
        limit: limit,
      });
    } else {
      startDateTime = netScanDate.clone().startOf("day");
      endDateTime = netScanDate.clone().endOf("day");

      results = await models.NetworkScan.findAll({
        where: {
          netScanDate: {
            [Op.between]: [startDateTime.toDate(), endDateTime.toDate()],
          },
        },
        attributes: ["net_scan_date"],
        group: ["net_scan_date"],
        order: [["net_scan_date", "DESC"]],
        offset: offset,
        limit: limit,
      });
    }

    const count = (
      await models.NetworkScan.findAll({
        where: {
          netScanDate: {
            [Op.between]: [startDateTime.toDate(), endDateTime.toDate()],
          },
        },
        attributes: ["net_scan_date"],
        group: ["net_scan_date"],
        order: [["net_scan_date", "DESC"]],
      })
    ).length;

    const nbPage = Math.ceil(count / limit);
    const message = `Il y a ${count} NetworkScanaire pour la date : ${netScanDate}. page ${page}/${nbPage}`;
    return res.json({
      message: message,
      page: page,
      nbPage: nbPage,
      data: results,
    });
  } catch (err) {
    const message = `404 Not Found.`;
    console.log(err);
    res.status(404).json({ message: message });
  }
};
