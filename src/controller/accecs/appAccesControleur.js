// appAccesControleur.js
import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import { generateId } from '../../services/generateId.js';

const models = initModels(sequelize);
/**
 * GET /api/v.1/acces/groupes/:grpCode
 * Récupère TOUS les accès d'un groupe (sans pagination)
 */
export const getGroupAccess = async (req, res) => {
  try {
    const { grpCode } = req.params;
    const { entityType, isActive } = req.query;

    // Construire les conditions WHERE
    const where = { grpCode };

    if (entityType) {
      if (!['MODULE', 'MENU', 'PAGE', 'COMPONENT', 'BUTTON'].includes(entityType)) {
        return res.status(400).json({ message: 'entityType invalide' });
      }
      where.entityType = entityType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const accesses = await models.GroupeAccesView.findAll({
			where,
			attributes: {
				exclude: ['id', 'histGrpACode'],
			},
			order: [
				['entityType', 'ASC'],
				['entityName', 'ASC'],
			],
			raw: true, // Important pour les vues
			nest: true,
		});

    res.json({
			message: `Accès du groupe ${grpCode} chargés`,
			data: accesses,
			count: accesses.length,
			grpCode: grpCode,
		});
  } catch (error) {
    console.error('Erreur getGroupAccess:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * POST /api/v.1/acces/groupes/:grpCode/update
 * Active ou désactive un accès via la fonction stockée
 */
export const updateGroupAccess = async (req, res) => {
  const { grpCode } = req.params;
  const { entityType, entityCode, isActive, userCode, comment } = req.body;

  // Validation
  if (!['MODULE', 'MENU', 'PAGE', 'COMPONENT', 'BUTTON'].includes(entityType)) {
    return res.status(400).json({ message: 'entityType invalide' });
  }
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'isActive doit être un booléen' });
  }
  if (!userCode) {
    return res.status(400).json({ message: 'userCode requis' });
  }

  const transaction = await sequelize.transaction();

  try {
    // Appel de la fonction stockée via sequelize.query (car Sequelize ne gère pas les procédures directement)
    await sequelize.query(
      `
        SELECT pe.update_groupe_acces(
          :grpCode,
          :entityType,
          :entityCode,
          :isActive,
          :userCode,
          :comment
        )
      `,
      {
        replacements: {
          grpCode,
          entityType,
          entityCode,
          isActive,
          userCode,
          comment: comment || null,
        },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    await transaction.commit();

    res.json({
      message: `Accès mis à jour avec succès`,
      data: { grpCode, entityType, entityCode, isActive },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur updateGroupAccess:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * GET /api/acces/users/:usrCode
 * Récupère TOUS les accès d'un utilisateur (via son groupe, sans pagination)
 */
export const getUserAccess = async (req, res) => {
  try {
    const { usrCode } = req.params;
    const { entityType, isActive } = req.query;

    // Récupérer le groupe de l'utilisateur
    const user = await models.Users.findOne({
      attributes: ['grpCode'],
      where: { usrCode },
      raw: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const where = { grpCode: user.grpCode };

    if (entityType) {
      if (!['MODULE', 'MENU', 'PAGE', 'COMPONENT', 'BUTTON'].includes(entityType)) {
        return res.status(400).json({ message: 'entityType invalide' });
      }
      where.entityType = entityType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const accesses = await models.GroupeAccesView.findAll({
			where,
			attributes: {
				exclude: ['id', 'entityDescription'],
			},
			order: [
				['entityType', 'ASC'],
				['entityName', 'ASC'],
			],
			raw: true,
			nest: true,
		});

    res.json({
      message: `Accès de l'utilisateur ${usrCode} (groupe ${user.grpCode}) chargés`,
      data: accesses,
      count: accesses.length,
    });
  } catch (error) {
    console.error('Erreur getUserAccess:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};