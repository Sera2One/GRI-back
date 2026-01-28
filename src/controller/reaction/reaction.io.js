// commentReaction.socket.js
import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import moment from 'moment';
import { generateId } from '../../services/generateId.js';
import { getPreciseGMTTime } from '../../services/timeSync.js';
import { Op } from 'sequelize';

const models = initModels(sequelize);

export default function reaction(socket, io) {
	// Événement pour obtenir les réactions d'un commentaire
	console.log('reaction is run');

	socket.on('comment-reaction-get', async (data, callback) => {
		const { cmtCode, postCode } = data;
		console.log('data reaction', data);

		try {
			const { reactions, reactionCounts } = await getCommentReaction(data);

			const response = {
				success: true,
				data: reactions,
				postCode: postCode,
				counts: reactionCounts,
			};

			if (callback) callback(response);
		} catch (error) {
			console.error('Error getting comment reactions:', error);
			if (callback)
				callback({
					success: false,
					error: error.message,
				});
		}
	});

	// Événement pour basculer une réaction sur un commentaire
	socket.on('comment-reaction-toggle', async (data, callback) => {
		const { cmtCode, postCode, reactionType } = data;
		console.log('data', data);

		try {
			// Vérifier si la réaction existe déjà
			let action;
			const existingReaction = await models.CommentReactions.findOne({
				where: {
					cmtCode: cmtCode,
					postCode: postCode,
					usrCode: socket.userID,
					cReactReaction: reactionType,
				},
			});

			if (existingReaction) {
				// Supprimer la réaction existante
				await models.CommentReactions.destroy({
					where: {
						cReactCode: existingReaction.cReactCode,
					},
				});
				action = 'removed';
			} else {
				// Créer une nouvelle réaction
				const reactionData = {
					cReactCode: await generateId('CommentReactions'),
					postCode: postCode,
					cmtCode: cmtCode,
					usrCode: socket.userID,
					cReactReaction: reactionType,
					cReactCreatedDate: getPreciseGMTTime().iso,
				};

				await models.CommentReactions.create(reactionData);
				action = 'added';
			}

			const { reactions, reactionCounts } = await getCommentReaction(data);

			const response = {
				success: true,
				data: reactions,
				postCode: postCode,
				counts: reactionCounts,
				action: action,
				userCode: socket.userID,
			};

			// Émettre la mise à jour à tous les clients
			io.emit('comment-reaction-update', response);

			if (callback) callback(response);
		} catch (error) {
			console.error('Error toggling comment reaction:', error);
			if (callback)
				callback({
					success: false,
					error: error.message,
				});
		}
	});

	// Événement pour obtenir les réactions d'un post
	socket.on('post-reaction-get', async (data, callback) => {
		try {
			const { count, rows, reactionCounts, nbPage, page, postCode } =
				await getPostReaction(data);

			const response = {
				success: true,
				count: count,
				data: rows,
				counts: reactionCounts,
				postCode: postCode || null,
				nbPage: nbPage,
				page: page,
			};

			if (callback) callback(response);
		} catch (error) {
			console.error('Error getting post reactions:', error);
			if (callback)
				callback({
					success: false,
					error: error.message,
				});
		}
	});

	// Événement pour basculer une réaction sur un post
	socket.on('post-reaction-toggle', async (data, callback) => {
		const { postCode, reactionType } = data;
		console.log('data reaction', data);

		try {
			// Vérifier si la réaction existe déjà
			const existingReaction = await models.PostReactions.findOne({
				where: {
					postCode: postCode,
					usrCode: socket.userID,
					pReactReaction: reactionType,
				},
			});

			const response = {
				success: true,
				userCode: socket.userID,
			};

			if (existingReaction) {
				// Supprimer la réaction existante
				await models.PostReactions.destroy({
					where: {
						pReactCode: existingReaction.pReactCode,
					},
				});

				response.message = 'Réaction supprimée';
				response.action = 'removed';
			} else {
				// Créer une nouvelle réaction
				const reactionData = {
					pReactCode: await generateId('PostReactions'),
					postCode: postCode,
					usrCode: socket.userID,
					pReactReaction: reactionType,
					pReactCreatedDate: getPreciseGMTTime().iso,
				};

				await models.PostReactions.create(reactionData);

				response.message = 'Réaction ajoutée';
				response.action = 'added';
			}
			// Émettre la mise à jour à tous les clients

			const { count, rows, reactionCounts, nbPage, page } =
				await getPostReaction(data);

			Object.assign(response, {
				count: count,
				data: rows,
				counts: reactionCounts,
				postCode: postCode || null,
				nbPage: nbPage,
				page: page,
			});

			io.emit('post-reaction-update', response);

			if (callback) callback(response);
		} catch (error) {
			console.error('Error toggling post reaction:', error);
			if (callback)
				callback({
					success: false,
					error: error.message,
				});
		}
	});

	// Événement pour obtenir les réactions d'un message
	socket.on('message-reaction-get', async (data, callback) => {
		try {
			const { reactions, reactionCounts } = await getMessageReaction(data);

			const response = {
				success: true,
				counts: reactionCounts,
				reactions: reactions,
			};

			if (callback) callback(response);
		} catch (error) {
			console.error('Error getting post reactions:', error);
			if (callback)
				callback({
					success: false,
					error: error.message,
				});
		}
	});

	// Événement pour basculer une réaction sur un message
	socket.on('message-reaction-toggle', async (data, callback) => {
		const { msgCode, reactionType } = data;
		console.log('data reaction', data);

		try {
			// Vérifier si le message existe dans l'une des deux tables
			const userMessageExists = await models.Messages.count({
				where: { msgCode: msgCode },
			});

			const groupMessageExists = await models.GroupeUserMessage.count({
				where: { gumesCode: msgCode },
			});

			// ✅ Accepter si le message existe dans AU MOINS une des tables
			if (userMessageExists === 0 && groupMessageExists === 0) {
				throw new Error('Message introuvable (ni P2P ni de groupe)');
			}

			// Vérifier si la réaction existe déjà
			const existingReaction = await models.MessageReactions.findOne({
				where: {
					msgCode: msgCode,
					usrCode: socket.userID,
					mReactReaction: reactionType,
				},
			});

			const response = {
				success: true,
				userCode: socket.userID,
			};

			if (existingReaction) {
				// Supprimer la réaction existante
				const deletedReactCode = existingReaction.mReactCode;
				await models.MessageReactions.destroy({
					where: {
						mReactCode: deletedReactCode,
					},
				});

				response.message = 'Réaction supprimée';
				response.removedReactCode = deletedReactCode;
				response.action = 'removed';
			} else {
				// Créer une nouvelle réaction
				const reactionData = {
					mReactCode: await generateId('MessageReactions'),
					msgCode: msgCode,
					usrCode: socket.userID,
					mReactReaction: reactionType,
					mReactCreatedDate: getPreciseGMTTime().iso,
				};

				await models.MessageReactions.create(reactionData);

				response.message = 'Réaction ajoutée';
				response.action = 'added';
			}

			// Émettre la mise à jour à tous les clients
			const { reactions, reactionCounts } = await getMessageReaction(data);

			Object.assign(response, {
				counts: reactionCounts,
				msgCode: msgCode || null,
				reactions: reactions,
			});

			io.emit('message-reaction-update', response);

			if (callback) callback(response);
		} catch (error) {
			console.error('Error toggling message reaction:', error);
			if (callback)
				callback({
					success: false,
					error: error.message,
				});
		}
	});
}

export const	getCommentReaction = async (data) => {
	const { cmtCode, postCode } = data;		
	const whereCondition = {
		postCode: postCode,
	};

	// Ajouter CMT_CODE seulement si cmtCode n'est pas null
	/* if (cmtCode !== null && cmtCode !== undefined) {
		whereCondition.cmtCode = cmtCode;
	} */

	const reactions = await models.CommentReactions.findAll({
		where: whereCondition,
		include: [
			{
				model: models.Users,
				as: 'usrCodeUser',
				attributes: [
					'usr_code',
					'usr_name',
					'usr_firstname',
					'usr_mail',
					'usr_img',
				],
			},
		],
		raw: true,
		nest: true,
	});
	
	// Compter les réactions par type
	const reactionCounts = {};
	const reactionTypes = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];

	reactionTypes.forEach(type => {
		reactionCounts[type] = reactions.filter(
			r => r.cReactReaction === type,
		).length;
	});
	

	return {
		reactions: reactions,
		reactionCounts: reactionCounts,
	};
}

export const getPostReaction = async data => {
	const { postCode, limit = 100, page = 1 } = data;
	const offset = (page - 1) * limit;

	const { count, rows } = await models.PostReactions.findAndCountAll({
		include: [
			{
				model: models.Users,
				as: 'usrCodeUser',
				attributes: [
					'usr_code',
					'usr_name',
					'usr_firstname',
					'usr_mail',
					'usr_img',
				],
			},
		],
		limit: limit,
		offset: offset,
		order: [['p_react_created_date', 'DESC']],
	});

	// Compter les réactions par type
	const reactionCounts = {};

	const reactionTypes = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];

	const nbPage = Math.ceil(parseInt(count) / limit);

	reactionTypes.forEach(type => {
		reactionCounts[type] = rows.filter(r => r.pReactReaction === type).length;
	});
	return {
		rows: rows,
		page: page,
		reactionCounts: reactionCounts,
		count: count,
		nbPage: nbPage,
		postCode: postCode,
	};
};


export const getMessageReaction = async data => {
	const { usrCode, msgCodeList } = data;
	const whereCondition = {};

	if (msgCodeList) {
		whereCondition.msgCode = { [Op.in]: msgCodeList };
	}

	if (usrCode) {
		whereCondition.usrCode = usrCode;
	}


	const reactions = await models.MessageReactions.findAll({
		where: whereCondition,
		include: [
			{
				model: models.Users,
				as: 'usrCodeUser',
				attributes: [
					'usr_code',
					'usr_name',
					'usr_firstname',
					'usr_mail',
					'usr_img',
				],
			},
		],
		raw: true,
		nest: true,
	});

	// Compter les réactions par type
	const reactionCounts = {};
	const reactionTypes = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];

	reactionTypes.forEach(type => {
		reactionCounts[type] = reactions.filter(
			r => r.mReactReaction === type,
		).length;
	});

	return {
		reactions: reactions,
		reactionCounts: reactionCounts,
	};
};
