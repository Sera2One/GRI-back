import moment from 'moment';
import { generateId } from './generateId.js';
import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';
const models = initModels(sequelize);

/**
 * Crée une notification en BDD + émet via Socket.IO
 * @param {Object} options
 * @param {string} options.type - Type de notification (ex: 'COMMENT_POSTED')
 * @param {string} options.recipientUserCode - À qui notifier
 * @param {string} options.actorUserCode - Qui a déclenché l'action
 * @param {string} options.targetType - Type d'entité cible (ex: 'Post', 'Comment')
 * @param {string} options.targetCode - ID métier de l'entité cible
 * @param {Object} options.extra - Données supplémentaires (JSONB)
 * @param {number} options.priority - 0=normal, 1=haute, 2=urgente
 * @param {string} options.channel - 'in_app', 'email','sms',  etc.
 * @param {Object} io - Instance Socket.IO
 */
export const createAndEmitNotification = async (
	{
		type,
		recipientUserCode,
		actorUserCode,
		targetType,
		targetCode,
		extra = {},
		priority = 0,
		channel = 'in_app',
		expiresAt = null,
	},
	io,
) => {
	try {
		const notifCode = await generateId('Notifications');

		// Récupérer TTL depuis notification_types (optionnel)
		const notifTypeConfig = await models.NotificationTypes.findOne({
			where: { notifType: type },
                  raw: true,
                  nest:true
		});

            console.log('notification', notifTypeConfig);
            

		if (notifTypeConfig && notifTypeConfig.defaultTtlHours && !expiresAt) {
			expiresAt = moment()
				.add(notifTypeConfig.defaultTtlHours, 'hours')
				.toDate();
		}

		// Créer la notification
		const notification = await models.Notifications.create({
			notifCode: notifCode,
			userCode: recipientUserCode,
			notifType: type,
			notifActorCode: actorUserCode,
			notifTargetType: targetType,
			notifTargetCode: targetCode,
			notifPriority: priority,
			notifExpiresAt: expiresAt,
			notifExtra: extra,
			notifChannel: channel,
			notifActorCreatedDate: new Date(),
		});

		// Émettre via Socket.IO
		io.to(recipientUserCode).emit('notification:new', {
			success: true,
			data: notification,
			message: `Nouvelle notification : ${type}`,
		});

		return notification;
	} catch (error) {
		console.error('Erreur création notification:', error);
		throw error;
	}
};
