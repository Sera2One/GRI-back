import { sequelize } from "../../db/config/database.js";
import { Op } from "sequelize";
import initModels from "../../db/models/init-models.js";
import moment from "moment";
var models = initModels(sequelize);

/************************************************************************
 **************** Create history_ip_addresss ******************************
 ************************************************************************/
export const postHistoryIPAddress = async (req, res) => {
  const hipAddresse = req.body.hipAddresse;
  const limit = parseInt(req.query.limit) || 5;
  const hipPrefix = "hip";
  const PrefixSeparator = "-";

  try {
    const history_ip_address_is_exist = await models.HistoryIpAddress.findOne({
      where: { hipAddresse },
    });
    if (history_ip_address_is_exist) {
      return res
        .status(400)
        .json({ error: `Le nom du history_ip_address existe déjà` });
    }

    //générer l'id du history_ip_address
    const getHistoryIPAddress = await models.HistoryIpAddress.findAll({
      order: [["hipCreatedDate", "DESC"]],
      raw: true,
      limit: limit,
    });
    console.log("log", getHistoryIPAddress);
    const last_id = !getHistoryIPAddress.length
      ? 0
      : getHistoryIPAddress
          .map(function (id) {
            return parseInt(id.hipCode.match(/\d+/g));
          })
          .reduce((previousId, currentId) =>
            previousId > currentId ? previousId : currentId,
          );

    req.body.hipCode = hipPrefix + PrefixSeparator + (last_id + 1);
    // Set date
    req.body.hipCreatedDate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Create a new history_ip_address
    console.log("logA", req.body);
    const newHistoryIPAddress = await models.HistoryIpAddress.create(req.body);
    const message = `Création history_ip_address éffectue avec succès.`;
    res.json({ message, history_ip_address: newHistoryIPAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/************************************************************************
 **************** search and get all history_ip_addresss ******************************
 ************************************************************************/
const capitalize = (str) => str.charAt(0).toUpperCase() + str.substring(1);
export const getHistoryIPAddress = async (req, res) => {
  if (req.query.texte) {
    const hipAddresse = req.query.ip_addresse;
    const limit = parseInt(req.query.limit) || 5;

    if (hipAddresse.length < 2) {
      const message = `Le terme de recherche doit contenir au minimum 2 caractères.`;
      return res.status(400).json({ message });
    }

    return models.HistoryIpAddress.findAndCountAll({
      where: {
        hipAddresse: {
          [Op.or]: {
            [Op.like]: `%${hipAddresse}%`,
            [Op.startsWith]: capitalize(hipAddresse),
          },
        },
      },
      order: ["hip_addresse"],
      limit: limit,
    }).then(({ count, rows }) => {
      const message = `Il y a ${count} qui correspondent au terme de recherche ${hipAddresse}.`;
      return res.json({ message, data: rows });
    });
  } else {
    models.HistoryIpAddress.findAll({
      order: ["hip_addresse"],
    })
      .then((history_ip_address) => {
        const message = "La liste des history_ip_addresss a bien été récupéré.";
        res.json({ message, data: history_ip_address });
      })
      .catch((error) => {
        const message = `La liste des history_ip_addresss n'a pas pu être récupéré.`;
        res.status(500).json({ message, data: error });
      });
  }
};
