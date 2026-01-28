import { sequelize } from "../../db/config/database.js";
import { Op } from "sequelize";
import initModels from "../../db/models/init-models.js";
import moment from "moment";
var models = initModels(sequelize);

/************************************************************************
 **************** Create groupes ******************************
 ************************************************************************/
export const postGroupe = async (req, res) => {
  const grpName = req.body.grpName;
  const limit = parseInt(req.query.limit) || 5;
  const grpPrefix ="grp";
  const PrefixSeparator ="-";

  try {
    const groupe_is_exist = await models.Groupes.findOne({
      where: {grpName}
    });
    if (groupe_is_exist) {
        return res.status(400).json({ error: `Le nom du groupe existe déjà` });
    }
    
    //générer l'id du groupe
  const getGroupe = await models.Groupes.findAll({
    order: [["grpCreatedDate", "DESC"]],
    raw: true,
    limit: limit,
  });
  console.log("log", getGroupe);
  const last_id = !getGroupe.length
    ? 0
    : getGroupe
        .map(function (id) {
          return parseInt(id.grpCode.match(/\d+/g));
        })
        .reduce((previousId, currentId) =>
          previousId > currentId ? previousId : currentId
        );

    req.body.grpCode = grpPrefix + PrefixSeparator + (last_id + 1);
    // Set date
    req.body.grpCreatedDate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Create a new groupe
    console.log("logA", req.body);
    const newGroupe = await models.Groupes.create(req.body);
    const message = `Création groupe éffectue avec succès.`;
    res.json({ message, groupe: newGroupe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/************************************************************************
 **************** search and get all groupes ******************************
 ************************************************************************/
const capitalize = (str) => str.charAt(0).toUpperCase() + str.substring(1);
export const getGroupe = async (req, res) => {
  if (req.query.texte) {
    const texte = req.query.texte;
    const table = req.query.table;
    const limit = parseInt(req.query.limit) || 5;

    if (texte.length < 2) {
      const message = `Le terme de recherche doit contenir au minimum 2 caractères.`;
      return res.status(400).json({ message });
    }

    return models.Groupes.findAndCountAll({
      where: {
        grpName: {
          [Op.or]: {
            [Op.like]: `%${texte}%`,
            [Op.startsWith]: capitalize(texte),
          },
        },
      },
      order: ["grp_name"],
      limit: limit,
    }).then(({ count, rows }) => {
      const message = `Il y a ${count} qui correspondent au terme de recherche ${texte}.`;
      return res.json({ message, data: rows });
    });
  } else {
    models.Groupes.findAll({
      order: ["grp_name"],
    })
      .then((groupe) => {
        const message = "La liste des groupes a bien été récupéré.";
        res.json({ message, data: groupe });
      })
      .catch((error) => {
        const message = `La liste des groupes n'a pas pu être récupéré.`;
        res.status(500).json({ message, data: error });
      });
  }
};

/************************************************************************
 **************** get button by id **********************************
 ************************************************************************/
export const getGroupeById = async (req, res) => {
  models.Groupes.findByPk(req.params.id)
    .then((groupe) => {
      if (groupe === null) {
        const message = `La groupe demandé n'existe pas.`;
        return res.status(404).json({ message });
      }

      const message = `La groupe a bien été trouvée.`;
      res.json({ message, data: groupe });
    })
    .catch((error) => {
      const message = `Serveur erreur`;
      res.status(500).json({ message, data: error });
    });
};

/************************************************************************
 ****************  Update groupes ***********************************
 ************************************************************************/
export const updateGroupe = async (req, res) => {
  const id = req.params.id;
  const grpName = req.body.grpName;
  const is_grpCode_match_to_url = req.body.grpCode != id;
  var is_not_valid_input =
    req.body.grpName.length <= 2 ;

  models.Groupes.findByPk(id).then(async (groupe) => {
    if (groupe === null) {
      const message = `Le groupe demandée n'existe pas.`;
      return res.status(404).json({ message });
    }
    if (is_not_valid_input) {
      const message = `Formulaire invalid : Nom du groupe trop petite `;
      return res.status(404).json({ message });
    }
    if (is_grpCode_match_to_url) {
      const message = `Formulaire invalid: id URL et formulaire ne corresponde pas `;
      return res.status(404).json({ message });
    }
    console.log('grt ' + grpName);
    const finded_name = await models.Groupes.findOne({
      where: {
        [Op.and]:{
            grpName: grpName,
        [Op.not]:{
            grpCode: id,
        }
      }}
    });

    if (finded_name) {
      return res.status(400).json({ error: `Le nom du groupe existe déjà` });
    }

    req.body.grpCreatedDate = groupe.grpCreatedDate;
    req.body.grpModifDate = moment().format("YYYY-MM-DD HH:mm:ss");
    models.Groupes.update(req.body, {
      where: { grpCode: id },
    })
      .then(() => {
        models.Groupes.findByPk(id).then((groupe) => {
          const message = `La groupe a bien été modifié.`;
          res.json({ message, data: groupe });
        });
      })
      .catch((err) => {
        try {
          const message = `La groupe n'a pas pu être modifié.`;
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
export const deleteGroupe = async (req, res) => {
  const id = req.params.id;
  models.Groupes.findByPk(id).then(async (groupe) => {
    if (groupe === null) {
      const message = `Le groupe demandé n'existe pas.`;
      return res.status(404).json({ message });
    }

    models.Groupes.destroy({ where: { grpCode: id } })
      .then((_) => {
        const message = `Le groupe est supprimé.`;
        res.json({ message });
      })
      .catch((err) => {
        try {
          const message = `Le groupe n'a pas pu être supprimé.`;
          res.status(500).json({ message, data: err.parent.detail });
        } catch (higth_err) {
          const message = `Serveur error.`;
          res.status(500).json({ message, data: higth_err });
        }
      });
  });
};
