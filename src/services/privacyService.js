// services/privacyService.js
import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';
import { generateId } from './generateId.js';

const models = initModels(sequelize);

	/**
	 * Récupère les données visibles d'un utilisateur
	 */
export async function getUserVisibleData({targetUserCode, viewerRelationship = 'public'}) {
	console.log('targetUserCode', targetUserCode);
	
		try {
			// Utiliser la fonction PostgreSQL existante
			const result = await sequelize.query(
				`SELECT * FROM pe.get_user_visible_data(:targetUserCode, :viewerRelationship)`,
				{
					replacements: {
						targetUserCode,
						viewerRelationship,
					},
				      type: sequelize.QueryTypes.SELECT,
				},
			);
console.log('result', result);

			return result[0]; // Retourne le premier résultat
		} catch (error) {
			throw new Error(
				`Erreur lors de la récupération des données: ${error.message}`,
			);
		}
	}

	/**
	 * Met à jour les paramètres de confidentialité d'un utilisateur
	 */
export async function updatePrivacySetting(userCode, privacySettings) {
	const transaction = await sequelize.transaction();

	try {
		// Mettre à jour la visibilité par défaut si fournie
		if (privacySettings.defaultVisibility) {
			await models.Users.update(
				{ usrDefaultVisibility: privacySettings.defaultVisibility },
				{
					where: { usrCode: userCode },
					transaction,
				},
			);
		}

		// Mettre à jour les visibilités par champ
		if (
			privacySettings.fieldSettings &&
			privacySettings.fieldSettings.length > 0
		) {
			for (const fieldSetting of privacySettings.fieldSettings) {
				// Vérifier d'abord si l'entrée existe
				const existing = await models.UserFieldVisibility.findOne({
					where: {
						usrCode: userCode,
						ufvFieldName: fieldSetting.fieldName,
					},
					transaction,
				});

				if (existing) {
					// Mettre à jour l'existant
					await models.UserFieldVisibility.update(
						{ ufv_visibility: fieldSetting.visibility },
						{
							where: {
								usrCode: userCode,
								ufvFieldName: fieldSetting.fieldName,
							},
							transaction,
						},
					);
				} else {
					// Créer une nouvelle entrée avec un ufv_code valide
					const nextUfvCode = await generateId('UserFieldVisibility');

					await models.UserFieldVisibility.create(
						{
							ufvCode: nextUfvCode,
							usrCode: userCode,
							ufvFieldName: fieldSetting.fieldName,
							ufvVisibility: fieldSetting.visibility,
						},
						{ transaction },
					);
				}
			}
		}

		await transaction.commit();
		return await getUserPrivacySetting(userCode);
	} catch (error) {
		console.error('Erreur détaillée:', error);
		await transaction.rollback();
		throw new Error(
			`Erreur lors de la mise à jour des paramètres: ${error.message}`,
		);
	}
}


	/**
	 * Récupère tous les paramètres de confidentialité d'un utilisateur
	 */
export async function getUserPrivacySetting(userCode) {
	try {
		const user = await models.Users.findByPk(userCode, {
			include: [
				{
					model: models.UserFieldVisibility,
					as: 'userFieldVisibilities',
					attributes: ['ufv_field_name', 'ufv_visibility'],
				},
			],
			attributes: ['usr_code', 'usr_default_visibility'],
		});		

		if (!user) {
			throw new Error('Utilisateur non trouvé');
		}

		return {
			defaultVisibility: user.getDataValue('usr_default_visibility'),
			fieldSettings: user
				.get({ plain: true })
				.userFieldVisibilities.map(setting => ({
					fieldName: setting.ufv_field_name,
					visibility: setting.ufv_visibility,
				})),
		};
		
	} catch (error) {
		throw new Error(
			`Erreur lors de la récupération des paramètres: ${error.message}`,
		);
	}
}

	/**
	 * Réinitialise les paramètres de confidentialité
	 */
export async function resetPrivacySetting(userCode) {
	const transaction = await sequelize.transaction();

	try {
		// Réinitialiser la visibilité par défaut
		await models.Users.update(
			{ usr_default_visibility: 'public' },
			{
				where: { usr_code: userCode },
				transaction,
			},
		);

		// Supprimer tous les paramètres spécifiques
		await models.UserFieldVisibility.destroy({
			where: { usr_code: userCode },
			transaction,
		});

		await transaction.commit();
		return await getUserPrivacySetting(userCode);
	} catch (error) {
		await transaction.rollback();
		throw new Error(`Erreur lors de la réinitialisation: ${error.message}`);
	}
}
