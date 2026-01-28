import moment from 'moment';
import { generateId } from './generateId.js';
import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';
import { getIo } from '../../server.js';
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
 * 
 * 'COMMENT_POSTED',
	'COMMENT_REPLIED',
	'MESSAGE_RECEIVED',
	'CALL_INVITATION',
	'GROUP_INVITATION',
	'USER_VALIDATION_REQUEST',
	'USER_VALIDATED',
	'USER_REJECTED',
	'ACCESS_GRANTED',
	'FILE_ARCHIVED',
	'MENTION',
	'CALL_STARTED',
	'NEW_',
	'MISSED_CALL',
	'ROLE_CHANGED',
	'REPORT_CREATED')
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
	}
) => {
	try {

		console.log(
			type,
			recipientUserCode,
			actorUserCode,
			targetType,
			targetCode,
			extra ,
			priority ,
			channel,
			expiresAt,
		);

		const io = getIo();
		
		// 1. Générer la clé de groupe — ajuste selon le type
		let groupKey = `${type}:${recipientUserCode}:${targetType}:${targetCode}`;

		// Pour les messages, on groupe par expéditeur → plus propre
		if (type === 'MESSAGE_RECEIVED' && actorUserCode) {
			groupKey = `${type}:${recipientUserCode}:User:${actorUserCode}`;
		}

		// Pour les réponses, on groupe par commentaire parent
		if (type === 'COMMENT_REPLIED' && targetCode) {
			groupKey = `${type}:${recipientUserCode}:Comment:${targetCode}`;
		}

		// 2. Chercher une notification existante non lue avec cette clé
		let notification = await models.Notifications.findOne({
			where: {
				notifGroupKey: groupKey,
				userCode: recipientUserCode,
				notifActorIsRead: false, // seulement si non lue
			},
		});

		if (notification) {
			// → Mise à jour : incrémenter compteur, mettre à jour date, ajouter ID dans extra
			const currentCount = notification.notifExtra?.count || 1;
			const currentItems = notification.notifExtra?.itemCodes || [];
			const currentUsersCodeItems =
				notification.notifExtra?.itemUsersCodes || [];

			await models.Notifications.update(
				{
					notifExtra: {
						...notification.notifExtra,
						count: currentCount + 1,
						itemCodes: [...currentItems, extra.itemCode || ''], // stocke les IDs pour traçabilité
						itemUsersCodes: [...currentUsersCodeItems, actorUserCode || ''],
						lastActorCode: actorUserCode, // dernier ayant déclenché
						lastContentPreview: extra.preview || extra.commentContent || null,
					},
					notifActorCreatedDate: new Date(), // rafraîchit la date
					notifPriority: Math.max(notification.notifPriority, priority), // garde la priorité la plus haute
				},
				{ where: { notifCode: notification.notifCode } },
			);

			// Recharger pour émettre à jour
			notification = await models.Notifications.findByPk(
				notification.notifCode,
			);
		} else {
			// → Création d'une nouvelle notification groupée
			const notifCode = await generateId('Notifications');

			// Récup TTL
			const notifTypeConfig = await models.NotificationTypes.findOne({
				where: { notifType: type },
				raw: true,
				nest: true,
			});

			if (notifTypeConfig && notifTypeConfig.defaultTtlHours && !expiresAt) {
				expiresAt = moment()
					.add(notifTypeConfig.defaultTtlHours, 'hours')
					.toDate();
			}

			notification = await models.Notifications.create({
				notifCode: notifCode,
				userCode: recipientUserCode,
				notifType: type,
				notifActorCode: actorUserCode,
				notifTargetType: targetType,
				notifTargetCode: targetCode,
				notifPriority: priority,
				notifExpiresAt: expiresAt,
				notifExtra: {
					count: 1,
					itemCodes: [extra.itemCode || ''],
					itemUsersCodes: [actorUserCode || ''],
					lastContentPreview: extra.preview || extra.commentContent || null,
					lastActorCode: actorUserCode,
				},
				notifChannel: channel,
				notifActorCreatedDate: new Date(),
				notifGroupKey: groupKey,
			});
		}

		// 3. Émettre via Socket.IO
		io.to(recipientUserCode).emit('notification:new_or_updated', {
			success: true,
			data: notification,
			isUpdated: !!notification.notifExtra?.count > 1, // indique si c'est un update
			message: `Notification ${notification.notifType} mise à jour`,
		});

		return notification;
	} catch (error) {
		console.error('Erreur création/mise à jour notification:', error);
		throw error;
	}
};
