import { generateId } from './generateId.js';
import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';

import moment from 'moment';

const models = initModels(sequelize);

/**
 * Récupère les réglages d'un utilisateur
 * @param {string} usrCode - Code utilisateur
 * @param {string} deviceId - Identifiant du device (optionnel)
 * @returns {Object} { global, device }
 */
export const getUserSettings = async (usrCode, deviceId) => {
	// Récupérer le réglage global
	const globalSetting = await models.UserSettings.findOne({
		where: {
			usrCode: usrCode,
			usrSScope: 'APP_GLOBAL',
		},
	});

	// Récupérer le réglage device (si deviceId fourni)
	let deviceSetting = null;
	if (deviceId) {
		deviceSetting = await models.UserSettings.findOne({
			where: {
				usrCode: usrCode,
				usrSScope: 'DEVICE_LOCAL',
				usrSDeviceCode: deviceId,
			},
		});
	}

	return {
		global: globalSetting?.usrSValue || {},
		device: deviceSetting?.usrSValue || {},
	};
};

/**
 * Met à jour ou crée un réglage utilisateur
 * @param {Object} data - { usrCode, settingScope, settingsValue, deviceId }
 * @param {string} changedBy - Qui a fait la modification (usrCode ou 'system')
 * @returns {Object} Le réglage mis à jour
 */
export const upsertUserSetting = async (data, changedBy = 'system') => {
	const { usrCode, settingScope, settingsValue, deviceId } = data;

	// Vérifier que le scope est valide
	if (!['APP_GLOBAL', 'DEVICE_LOCAL'].includes(settingScope)) {
		throw new Error('Invalid setting scope');
	}

	// Pour DEVICE_LOCAL, deviceId est obligatoire
	if (settingScope === 'DEVICE_LOCAL' && !deviceId) {
		throw new Error('deviceId is required for DEVICE_LOCAL scope');
	}

	// Rechercher le réglage existant
	const whereCondition = {
		usrCode: usrCode,
		usrSScope: settingScope,
	};

	if (settingScope === 'DEVICE_LOCAL') {
		whereCondition.usrSDeviceCode = deviceId;
	}

	let setting = await models.UserSettings.findOne({ where: whereCondition });

	const now = moment().toDate();

	if (setting) {
		// Log dans l'historique
		await models.UserSettingsHistory.create({
			usrSHCode: await generateId('UserSettingsHistory'),
			usrSCode: setting.usrSCode,
			usrCode: usrCode,
			usrSHScope: settingScope,
			usrSHDeviceCode: deviceId,
			usrSHOldValue: setting.usrSValue,
			usrSHNewValue: settingsValue,
			usrSHChangedBy: changedBy,
			usrSHChangedAt: now,
		});

		// Mettre à jour
		await setting.update({
			usrSValue: settingsValue,
			usrSUpdatedAt: now,
		});
	} else {
		// Créer un nouveau
		const newSettingCode = await generateId('UserSettings');
		setting = await models.UserSettings.create({
			usrSCode: newSettingCode,
			usrCode: usrCode,
			usrSScope: settingScope,
			usrSDeviceCode: deviceId,
			usrSValue: settingsValue,
			usrSCreatedAt: now,
			usrSUpdatedAt: now,
		});

		// Log historique (old_value = null)
		await models.UserSettingsHistory.create({
			usrSHCode: await generateId('UserSettingsHistory'),
			usrSCode: newSettingCode,
			usrCode: usrCode,
			usrSHScope: settingScope,
			usrSHDeviceCode: deviceId,
			usrSHOldValue: null,
			usrSHNewValue: settingsValue,
			usrSHChangedBy: changedBy,
			usrSHChangedAt: now,
		});
	}

	return setting;
};

/**
 * Réinitialise les réglages globaux d'un utilisateur
 * @param {string} usrCode
 * @param {Object} models
 * @param {string} changedBy
 */
export const resetUserGlobalSettings = async (
	usrCode,
	models,
	changedBy = 'system',
) => {
	const defaultGlobalSettings = {
		notifications: {
			messages: true,
			groups: true,
			calls: true,
			email: false,
			push: true,
			comment: true,
		},
		privacy: {
			showOnlineStatus: true,
			showLastSeen: true,
			allowGroupInvites: true,
			readReceipts: true,
		},
	};

	return await upsertUserSetting(
		{
			usrCode: usrCode,
			settingScope: 'APP_GLOBAL',
			settingsValue: defaultGlobalSettings,
		},
		models,
		changedBy,
	);
};


/**
 * Récupère l'historique des changements de settings pour un utilisateur
 * @param {string} usrCode - Code utilisateur
 * @param {Object} options - { scope, deviceCode, page, limit, startDate, endDate }
 * @returns {Object} { rows, count, page, nbPage }
 */
export const getSettingsHistoryService = async (usrCode, options = {}) => {
	const {
		scope,
		deviceCode,
		page = 1,
		limit = 20,
		startDate,
		endDate,
	} = options;

	const where = { usrCode };

	if (scope) where.usrSHScope = scope;
	if (deviceCode) where.usrSHDeviceCode = deviceCode;
	if (startDate) where.usrSHChangedAt = { [Op.gte]: new Date(startDate) };
	if (endDate) {
		if (!where.usrSHChangedAt) where.usrSHChangedAt = {};
		where.usrSHChangedAt[Op.lte] = new Date(endDate);
	}

	const offset = (page - 1) * limit;

	const { count, rows } = await models.UserSettingsHistory.findAndCountAll({
		where,
		order: [['usrSHChangedAt', 'DESC']],
		offset,
		limit,
		include: [
			{
				model: models.Users,
				as: 'usrCodeUser', // Assure-toi que l'association existe
				attributes: ['usrCode', 'usrName', 'usrFirstname', 'usrImg'],
			},
		],
	});

	const nbPage = Math.ceil(count / limit);

	return {
		rows,
		count,
		page: parseInt(page),
		nbPage,
	};
};