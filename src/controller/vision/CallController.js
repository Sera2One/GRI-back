import { sequelize } from "../../db/config/database.js";
import initModels from "../../db/models/init-models.js";
import moment from "moment";
var models = initModels(sequelize);

/************************************************************************
 **************** Create appels ******************************
 ************************************************************************/
export const postCall = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const callPrefix = "call";
  const PrefixSeparator = "-";

  try {
    //générer l'id de l'appels
    const getCall = await models.Call.findAll({
      order: [["callCreatedDate", "DESC"]],
      raw: true,
      limit: limit,
    });
    const last_id = !getCall.length
      ? 0
      : getCall
          .map(function (id) {
            return parseInt(id.callCode.match(/\d+/g));
          })
          .reduce((previousId, currentId) =>
            previousId > currentId ? previousId : currentId
          );

    req.body.callCode = callPrefix + PrefixSeparator + (last_id + 1);
    req.body.callIsMissed = false;
    // Set date
    req.body.callCreatedDate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Create a new groupe
    console.log("logA", req.body);
    const newCall = await models.Call.create(req.body);
    const createDest = await models.CallDest.create({
      usrCode : req.body.callDest,
      callCode : req.body.callCode,
      callSource : req.body.usrCode,
      callDestIsIsAccepted : null,
      callDestCreatedDate : req.body.callCreatedDate
    });
    const message = `Ajouter à la liste des appels OK.`;
    res.json({ message, appel: newCall });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/************************************************************************
 **************** search and get all appels ******************************
 ************************************************************************/
export const getCall = async (req, res) => {
  if (req.query.appel_dest) {
    const usrDest = req.query.appel_dest;
    const limit = parseInt(req.query.limit) || 5;

    return models.CallDest.findAndCountAll({
      where: {
        usrCode: usrDest
      },
      attributes :["call_code","call_source",["usr_code","call_dest"],"call_dest_is_accepted","call_dest_created_date"],
      order: ["call_dest_created_date"],
      limit: limit,
    }).then(({ count, rows }) => {
      const message = `Voici la liste ${count} des appels sortant de  ${usrDest}.`;
      return res.json({ message, data: rows });
    });
  }
  
  if (req.query.appel_sortant) {
    const usrCode = req.query.appel_sortant;
    const limit = parseInt(req.query.limit) || 5;

    return models.CallDest.findAndCountAll({
      where: {
        usrCode: usrCode
      },
      attributes :["call_code","call_source",["usr_code","call_dest"],"call_dest_is_accepted","call_dest_created_date"],
      order: ["call_dest_created_date"],
      limit: limit,
    }).then(({ count, rows }) => {
      const message = `Voici la liste ${count} des appels sortant de ${usrCode}.`;
      return res.json({ message, data: rows });
    });
  }
    models.CallDest.findAll({
      attributes :["call_code","call_source",["usr_code","call_dest"],"call_dest_is_accepted","call_dest_created_date"],
      order: ["call_dest_created_date"],
    })
      .then((groupe) => {
        const message = "La liste des appels a bien été récupéré.";
        res.json({ message, data: groupe });
      })
      .catch((error) => {
        const message = `La liste des appels n'a pas pu être récupéré.`;
        res.status(500).json({ message, data: error });
      });

};

/************************************************************************
 ****************  Update appels ***********************************
 ************************************************************************/
export const updateCall = async (req, res) => {
  const id = req.params.id;
  const is_applCode_match_to_url = req.body.applCode != id;
  var is_not_valid_input = req.body.applName.length <= 2;

  models.CallDest.findByPk(id).then(async (appel) => {
    if (appel === null) {
      const message = `Le groupe demandée n'existe pas.`;
      return res.status(404).json({ message });
    }
    if (is_not_valid_input) {
      const message = `Formulaire invalid : Nom du groupe trop petite `;
      return res.status(404).json({ message });
    }
    if (is_applCode_match_to_url) {
      const message = `Formulaire invalid: id URL et formulaire ne corresponde pas `;
      return res.status(404).json({ message });
    }

    req.body.applCreatedDate = appel.applCreatedDate;
    models.CallDest.update({applIsMissed : false}, {
      where: { applCode: id },
    })
      .then(() => {
        models.CallDest.findByPk(id).then((groupe) => {
          const message = `L'appel a bien été modifié.`;
          res.json({ message, data: groupe });
        });
      })
      .catch((err) => {
        try {
          const message = `L'appel n'a pas pu être modifié.`;
          res.status(500).json({ message, data: err.parent.detail });
        } catch (higth_err) {
          const message = `Serveur error.`;
          res.status(500).json({ message, data: higth_err });
        }
      });
  });
};
