import { sequelize } from "../../db/config/database.js";
import { Op } from "sequelize";
import initModels from "../../db/models/init-models.js";
import moment from "moment";
var models = initModels(sequelize);

/************************************************************************
 **************** Create terminauls ******************************
 ************************************************************************/
export const postTerminaul = async (req, res) => {
  const termAdresseMac = req.body.termAdresseMac;
  const limit = parseInt(req.query.limit) || 5;
  const termPrefix = "term";
  const PrefixSeparator = "-";

  try {
    const terminaul_is_exist = await models.Terminaux.findOne({
      where: { termAdresseMac },
    });
    if (terminaul_is_exist) {
      return res
        .status(400)
        .json({ error: `Cet addresse  du terminaul existe déjà` });
    }

    //générer l'id du terminaul
    const getTerminaul = await models.Terminaux.findAll({
      order: [["termCreatedDate", "DESC"]],
      raw: true,
      limit: limit,
    });
    console.log("log", getTerminaul);
    const last_id = !getTerminaul.length
      ? 0
      : getTerminaul
          .map(function (id) {
            return parseInt(id.termCodeCreate.match(/\d+/g));
          })
          .reduce((previousId, currentId) =>
            previousId > currentId ? previousId : currentId,
          );

    req.body.termCodeCreate = termPrefix + PrefixSeparator + (last_id + 1);
    // Set date
    req.body.termCreatedDate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Create a new terminaul
    console.log("logA", req.body);
    const newTerminaul = await models.Terminaux.create(req.body);
    const message = `Création terminaul éffectue avec succès.`;
    res.json({ message, terminaul: newTerminaul });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/************************************************************************
 **************** search and get all terminauls ******************************
 ************************************************************************/
const capitalize = (str) => str.charAt(0).toUpperCase() + str.substring(1);
export const getTerminaul = async (req, res) => {
  if (req.query.texte) {
    const texte = req.query.texte;
    const limit = parseInt(req.query.limit) || 5;

    if (texte.length < 2) {
      const message = `Le terme de recherche doit contenir au minimum 2 caractères.`;
      return res.status(400).json({ message });
    }

    return models.Terminaux.findAndCountAll({
      where: {
        termAdresseMac: {
          [Op.or]: {
            [Op.like]: `%${texte}%`,
            [Op.startsWith]: capitalize(texte),
          },
        },
      },
      order: ["term_created_date"],
      limit: limit,
    }).then(({ count, rows }) => {
      const message = `Il y a ${count} qui correspondent au terme de recherche ${texte}.`;
      return res.json({ message, data: rows });
    });
  } else {
    models.Terminaux.findAll({
      order: ["term_created_date"],
    })
      .then((terminaul) => {
        const message = "La liste des terminauls a bien été récupéré.";
        res.json({ message, data: terminaul });
      })
      .catch((error) => {
        const message = `La liste des terminauls n'a pas pu être récupéré.`;
        res.status(500).json({ message, data: error });
      });
  }
};

/************************************************************************
 **************** get button by id **********************************
 ************************************************************************/
export const getTerminaulById = async (req, res) => {
  models.Terminaux.findByPk(req.params.id)
    .then((terminaul) => {
      if (terminaul === null) {
        const message = `La terminaul demandé n'existe pas.`;
        return res.status(404).json({ message });
      }

      const message = `La terminaul a bien été trouvée.`;
      res.json({ message, data: terminaul });
    })
    .catch((error) => {
      const message = `Serveur erreur`;
      res.status(500).json({ message, data: error });
    });
};

/************************************************************************
 ****************  Update terminauls ***********************************
 ************************************************************************/
export const updateTerminaul = async (req, res) => {
  const id = req.params.id;
  const termAdresseMac = req.body.termAdresseMac;
  const is_termCodeCreate_match_to_url = req.body.termCodeCreate != id;
  var is_not_valid_input = req.body.termAdresseMac.length <= 2;

  models.Terminaux.findByPk(id).then(async (terminaul) => {
    if (terminaul === null) {
      const message = `Le terminaul demandée n'existe pas.`;
      return res.status(404).json({ message });
    }
    if (is_not_valid_input) {
      const message = `Formulaire invalid : Nom du terminaul trop petite `;
      return res.status(404).json({ message });
    }
    if (is_termCodeCreate_match_to_url) {
      const message = `Formulaire invalid: id URL et formulaire ne corresponde pas `;
      return res.status(404).json({ message });
    }
    console.log("grt " + termAdresseMac);
    const finded_name = await models.Terminaux.findOne({
      where: {
        [Op.and]: {
          termAdresseMac: termAdresseMac,
          [Op.not]: {
            termCodeCreate: id,
          },
        },
      },
    });

    if (finded_name) {
      return res
        .status(400)
        .json({ error: `Cet addresse  du terminaul existe déjà` });
    }

    req.body.termCreatedDate = terminaul.termCreatedDate;
    req.body.termModifDate = moment().format("YYYY-MM-DD HH:mm:ss");
    models.Terminaux.update(req.body, {
      where: { termCodeCreate: id },
    })
      .then(() => {
        models.Terminaux.findByPk(id).then((terminaul) => {
          const message = `La terminaul a bien été modifié.`;
          res.json({ message, data: terminaul });
        });
      })
      .catch((err) => {
        try {
          const message = `La terminaul n'a pas pu être modifié.`;
          res.status(500).json({ message, data: err.parent.detail });
        } catch (higth_err) {
          const message = `Serveur error.`;
          res.status(500).json({ message, data: higth_err });
        }
      });
  });
};

/************************************************************************
 ****************  Delete terminauls *****************************************
 ************************************************************************/
export const deleteTerminaul = async (req, res) => {
  const id = req.params.id;
  models.Terminaux.findByPk(id).then(async (terminaul) => {
    if (terminaul === null) {
      const message = `Le terminaul demandé n'existe pas.`;
      return res.status(404).json({ message });
    }

    models.Terminaux.destroy({ where: { termCodeCreate: id } })
      .then((_) => {
        const message = `Le terminaul est supprimé.`;
        res.json({ message });
      })
      .catch((err) => {
        try {
          const message = `Le terminaul n'a pas pu être supprimé.`;
          res.status(500).json({ message, data: err.parent.detail });
        } catch (higth_err) {
          const message = `Serveur error.`;
          res.status(500).json({ message, data: higth_err });
        }
      });
  });
};
