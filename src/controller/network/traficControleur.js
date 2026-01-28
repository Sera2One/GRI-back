import { sequelize } from "../../db/config/database.js";
import { Op } from "sequelize";
import initModels from "../../db/models/init-models.js";
import moment from "moment";
var models = initModels(sequelize);

/************************************************************************
 **************** Create trafics ******************************
 ************************************************************************/
export const postTrafic = async (req, res) => {
  const termCodeCreate = req.body.termCodeCreate;
  const limit = parseInt(req.query.limit) || 5;
  const traficPrefix = "trafic";
  const PrefixSeparator = "-";

  try {
    //générer l'id du trafic
    const getTrafic = await models.Trafics.findAll({
      order: [["traficCreatedDate", "DESC"]],
      raw: true,
      limit: limit,
    });

    console.log("log", getTrafic);
    const last_id = !getTrafic.length
      ? 0
      : getTrafic
          .map(function (id) {
            return parseInt(id.traficCode.match(/\d+/g));
          })
          .reduce((previousId, currentId) =>
            previousId > currentId ? previousId : currentId,
          );

    req.body.traficCode = traficPrefix + PrefixSeparator + (last_id + 1);
    // Set date
    req.body.traficCreatedDate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Create a new trafic
    console.log("logA", req.body);
    const newTrafic = await models.Trafics.create(req.body);
    const message = `Création trafic éffectue avec succès.`;
    res.json({ message, trafic: newTrafic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/************************************************************************
 **************** search and get all trafics ******************************
 ************************************************************************/
const capitalize = (str) => str.charAt(0).toUpperCase() + str.substring(1);
export const getTrafic = async (req, res) => {
  if (req.query.texte) {
    const texte = req.query.texte;
    const limit = parseInt(req.query.limit) || 5;

    if (texte.length < 2) {
      const message = `Le terme de recherche doit contenir au minimum 2 caractères.`;
      return res.status(400).json({ message });
    }

    return models.Trafics.findAndCountAll({
      where: {
        termCodeCreate: {
          [Op.or]: {
            [Op.like]: `%${texte}%`,
            [Op.startsWith]: capitalize(texte),
          },
        },
      },
      order: ["trafic_name"],
      limit: limit,
    }).then(({ count, rows }) => {
      const message = `Il y a ${count} qui correspondent au terme de recherche ${texte}.`;
      return res.json({ message, data: rows });
    });
  } else {
    models.Trafics.findAll({
      order: ["trafic_name"],
    })
      .then((trafic) => {
        const message = "La liste des trafics a bien été récupéré.";
        res.json({ message, data: trafic });
      })
      .catch((error) => {
        const message = `La liste des trafics n'a pas pu être récupéré.`;
        res.status(500).json({ message, data: error });
      });
  }
};
