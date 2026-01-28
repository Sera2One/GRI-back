import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';

import { Op } from 'sequelize';

const models = initModels(sequelize);

/**
 * Nettoie les sessions expirées, mais conserve les 15 dernières par utilisateur
 */
export const cleanupExpiredSessions = async () => {
	try {
		// 1. Récupérer la liste des utilisateurs ayant des sessions expirées
		const usersWithExpiredSessions = await models.Session.findAll({
			attributes: [
				[sequelize.fn('DISTINCT', sequelize.col('usr_code')), 'usr_code'],
			],
			where: {
				sessionExpiresAt: { [Op.lt]: new Date() },
			},
			raw: true,
		});

		let totalDeleted = 0;

		// 2. Pour chaque utilisateur, supprimer les sessions expirées SAUF les 15 plus récentes
		for (const { usr_code } of usersWithExpiredSessions) {
			// Récupérer les session_codes des 15 sessions les plus récentes (même expirées)
			const recentSessions = await models.Session.findAll({
				attributes: ['sessionCode'],
				where: {
					usrCode: usr_code,
				},
				order: [['sessionLastActive', 'DESC']],
				limit: 15,
				raw: true,
			});

			const recentSessionCodes = recentSessions.map(s => s.sessionCode);

			// Supprimer les sessions expirées qui NE SONT PAS dans les 15 dernières
			const deletedCount = await models.Session.destroy({
				where: {
					usrCode: usr_code,
					sessionExpiresAt: { [Op.lt]: new Date() },
					sessionCode: { [Op.notIn]: recentSessionCodes },
				},
			});

			totalDeleted += deletedCount;

			if (deletedCount > 0) {
				console.log(
					`🧹 Utilisateur ${usr_code}: ${deletedCount} sessions expirées supprimées (15 conservées).`,
				);
			}
		}

		console.log(
			`✅ Nettoyage terminé : ${totalDeleted} sessions expirées supprimées au total.`,
		);
		return totalDeleted;
	} catch (error) {
		console.error('❌ Erreur nettoyage sessions:', error);
		throw error;
	}
};
