import { sequelize } from "../../db/config/database.js";
import { Op } from "sequelize";
import initModels from "../../db/models/init-models.js";
import moment from "moment";
var models = initModels(sequelize);

/************************************************************************
 **************** Create groupes ******************************
 ************************************************************************/
export const postGroupeIp = async (req, res) => {
  const gIpName = req.body.gIpName;
  const limit = parseInt(req.query.limit) || 5;
  const gIpPrefix = "";
  const PrefixSeparator = "";

  try {
    const g_ip_name_is_exist = await models.GroupeIp.findOne({
      where: { gIpName },
    });
    if (g_ip_name_is_exist) {
      return res.status(400).json({ error: `Le nom du groupe existe déjà` });
    }

    //générer l'id du groupe
    const getGroupeIp = await models.GroupeIp.findAll({
      order: [["gIpCreate", "DESC"]],
      raw: true,
      limit: limit,
    });
    console.log("log", getGroupeIp);
    const last_id = !getGroupeIp.length
      ? 0
      : getGroupeIp
          .map(function (id) {
            return parseInt(id.gIpCode.match(/\d+/g));
          })
          .reduce((previousId, currentId) =>
            previousId > currentId ? previousId : currentId,
          );

    req.body.gIpCode = gIpPrefix + PrefixSeparator + (last_id + 1);
    // Set date
    req.body.gIpCreate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Create a new groupe
    const newGroupeIp = await models.GroupeIp.create(req.body);
    const message = `Création groupe éffectue avec succès.`;
    res.json({ message, groupeIp: newGroupeIp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/************************************************************************
 **************** search and get all groupes ******************************
 ************************************************************************/
const capitalize = (str) => str.charAt(0).toUpperCase() + str.substring(1);
export const getGroupeIp = async (req, res) => {
  if (req.query.texte) {
    const texte = req.query.texte;
    const table = req.query.table;
    const limit = parseInt(req.query.limit) || 5;

    if (texte.length < 2) {
      const message = `Le terme de recherche doit contenir au minimum 2 caractères.`;
      return res.status(400).json({ message });
    }

    return models.GroupeIp.findAndCountAll({
      where: {
        gIpName: {
          [Op.or]: {
            [Op.like]: `%${texte}%`,
            [Op.startsWith]: capitalize(texte),
          },
        },
      },
      order: ["gIp_name"],
      limit: limit,
    }).then(({ count, rows }) => {
      const message = `Il y a ${count} qui correspondent au terme de recherche ${texte}.`;
      return res.json({ message, data: rows });
    });
  } else {
    models.GroupeIp.findAll({
      order: ["gIp_name"],
    })
      .then((groupe_ip) => {
        const message = "La liste des groupes IP a bien été récupéré.";
        res.json({ message, data: groupe_ip });
      })
      .catch((error) => {
        const message = `La liste des groupes IP n'a pas pu être récupéré.`;
        res.status(500).json({ message, data: error });
      });
  }
};

/************************************************************************
 ****************  Update groupes ***********************************
 ************************************************************************/
export const updateGroupeIp = async (req, res) => {
  const id = req.params.id;
  const gIpName = req.body.gIpName;
  const is_gIpCode_match_to_url = req.body.gIpCode != id;
  var is_not_valid_input = req.body.gIpName.length <= 2;

  models.GroupeIp.findByPk(id).then(async (groupe_ip) => {
    if (groupe_ip === null) {
      const message = `Le groupe IP demandée n'existe pas.`;
      return res.status(404).json({ message });
    }
    if (is_not_valid_input) {
      const message = `Formulaire invalid : Nom du groupe IP trop petite `;
      return res.status(404).json({ message });
    }
    if (is_gIpCode_match_to_url) {
      const message = `Formulaire invalid: id URL et formulaire ne corresponde pas `;
      return res.status(404).json({ message });
    }

    const finded_name = await models.GroupeIp.findOne({
      where: {
        [Op.and]: {
          gIpName: gIpName,
          [Op.not]: {
            gIpCode: id,
          },
        },
      },
    });

    if (finded_name) {
      return res.status(400).json({ error: `Le nom du groupe IP existe déjà` });
    }

    req.body.gIpCreate = groupe_ip.gIpCreate;
    req.body.gIpModifDate = moment().format("YYYY-MM-DD HH:mm:ss");
    models.GroupeIp.update(req.body, {
      where: { gIpCode: id },
    })
      .then(() => {
        models.GroupeIp.findByPk(id).then((groupe) => {
          const message = `Le groupe IP a bien été modifié.`;
          res.json({ message, data: groupe });
        });
      })
      .catch((err) => {
        try {
          const message = `Le groupe IP n'a pas pu être modifié.`;
          res.status(500).json({ message, data: err.parent.detail });
        } catch (higth_err) {
          const message = `Serveur error.`;
          res.status(500).json({ message, data: higth_err });
        }
      });
  });
};

/************************************************************************
 ****************  Delete groupes *****************************************
 ************************************************************************/
export const deleteGroupeIp = async (req, res) => {
  const id = req.params.id;
  models.GroupeIp.findByPk(id).then(async (groupe_ip) => {
    if (groupe_ip === null) {
      const message = `Le groupe IP demandé n'existe pas.`;
      return res.status(404).json({ message });
    }

    models.GroupeIp.destroy({ where: { gIpCode: id } })
      .then((_) => {
        const message = `Le groupe IP est supprimé.`;
        res.json({ message });
      })
      .catch((err) => {
        try {
          const message = `Le groupe IP n'a pas pu être supprimé.`;
          res.status(500).json({ message, data: err.parent.detail });
        } catch (higth_err) {
          const message = `Serveur error.`;
          res.status(500).json({ message, data: higth_err });
        }
      });
  });
};
