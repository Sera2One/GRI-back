// groupeControleur.io.js
import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import moment from 'moment';
import { generateId } from '../../services/generateId.js';
import { generateOldCode } from '../../services/generateOldCode.js';
import { Op } from 'sequelize';
import { createAndEmitNotification } from '../../services/notificationService.js';
import { getPreciseGMTTime } from '../../services/timeSync.js';

const models = initModels(sequelize);

export default function initCommentSocket(socket, io) {
	// Ajouter un commentaire
	socket.on('comment-post', async (data, callback) => {
		const { cmtContent, postCode, cmtRootCode, cmtParentCode, cmtResponseLv } =
			data;
		console.log("commment post", data);
		
		const isCommentResponse =
			cmtRootCode !== null &&
			cmtRootCode !== undefined &&
			cmtResponseLv !== null &&
			cmtResponseLv !== undefined;
		try {
			const commentData = {
				cmtContent: cmtContent,
				usrCode: socket.userID,
				postCode: postCode,
				cmtCode: await generateId('Comment'),
				cmtCreatedDate: getPreciseGMTTime().iso,
				cmtIsDeleted: false,
			};

			if (isCommentResponse) {
				commentData.cmtRootCode = cmtRootCode;
				commentData.cmtResponseLv = cmtResponseLv;
			}

			if (cmtParentCode) {
				commentData.cmtParentCode = cmtParentCode;
			}

			await models.Comment.create(commentData);

			// → NOTIFICATION : Auteur de l'article est notifié
			const post = await models.Post.findByPk(postCode); // suppose que tu as un modèle Post
						
			if (post && post.usrCode !== socket.userID) {
				await createAndEmitNotification(
					{
						type: 'COMMENT_POSTED',
						recipientUserCode: post.usrCode,
						actorUserCode: socket.userID,
						targetType: 'Post',
						targetCode: `${postCode}//`,
						extra: {
							preview: cmtContent,
							itemCode: commentData.cmtCode,
						}
					}
				);
			}

			// si cmtParentCode existe :
			if (cmtParentCode) {
				const parentComment = await models.Comment.findByPk(cmtParentCode);
				if (
					parentComment &&
					parentComment.usrCode !== socket.userID // éviter de se notifier soi-même
				) {
					await createAndEmitNotification(
						{
							type: 'COMMENT_REPLIED',
							recipientUserCode: parentComment.usrCode,
							actorUserCode: socket.userID,
							targetType: 'Comment',
							targetCode: `${postCode}/${cmtParentCode}/`,
							extra: {
								preview: cmtContent,
								itemCode: commentData.cmtCode,
								postCode: postCode,
							}
						}
					);
				}
			}

			if (cmtRootCode) {
				const parentRootComment = await models.Comment.findByPk(cmtRootCode);
				if (
					parentRootComment &&
					parentRootComment.usrCode !== socket.userID // éviter de se notifier soi-même
				) {
					await createAndEmitNotification(
						{
							type: 'COMMENT_REPLIED',
							recipientUserCode: parentRootComment.usrCode,
							actorUserCode: socket.userID,
							targetType: 'Comment',
							targetCode: `${postCode}/${cmtRootCode}/${cmtParentCode}`,
							extra: {
								preview: cmtContent,
								itemCode: commentData.cmtCode,
								postCode: postCode,
							}
						}
					);
				}
			}
			// Récupérer le message
			const { count, rows, cmtParenList } = await getComment({
				postCode: postCode,
				cmtResponseLv: cmtResponseLv,
				cmtRootCode: cmtRootCode,
				limit: 10,
			});
			const nbPage = Math.ceil(parseInt(count) / 10);

			const replyCounts = await getCommentReplyCounts({ postCode: postCode });
			const commentCounts = await getCommentCounts({ postCode: postCode });

			const fullMessage = {
				success: true,
				message: `Commentaire ajouté dans le post ${postCode}  page 1/${nbPage}`,
				data: rows,
				page: 1,
				nbPage: nbPage,
				postCode: postCode,
				cmtRootCode: cmtRootCode || null,
				cmtResponseLv: cmtResponseLv || null,
				replyCounts: replyCounts,
				commentCounts: commentCounts,
				cmtParenList: cmtParenList,
				count: count,
			};

			io.emit('comment_update', fullMessage);

			if (callback) callback(fullMessage);
		} catch (error) {
			console.error('Error updating message:', error);
			if (callback) callback({ success: false, error: error.message });
		}
	});

	// Récuperer les commentaire
	socket.on('comments-get', async (data, callback) => {
		const {
			postCode,
			page = 1,
			limit = 20,
			cmtRootCode,
			cmtResponseLv,
			isDeleted = false,
		} = data;
		const offset = (page - 1) * limit;
		try {
			const whereCondition = {
				postCode: postCode,
				cmtSaveAsHistory: false,
			};

			// Ajouter CMT_CODE seulement si cmtCode n'est pas null
			if (cmtRootCode) {
				whereCondition.cmtRootCode = cmtRootCode;
				whereCondition.cmtResponseLv = [1,2];
			}

			
			const { count, rows } = await models.Comment.findAndCountAll({
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
				limit: limit,
				offset: offset,
				order: [['cmt_created_date', 'DESC']],
			});

			const nbPage = Math.ceil(parseInt(count) / limit);
			const replyCounts = await getCommentReplyCounts({ postCode: postCode });
			const commentCounts = await getCommentCounts({ postCode: postCode });

			const fullMessage = {
				success: true,
				message: `Il y a ${count} commentaire pour l'annonce  ${postCode}. page ${page}/${nbPage}`,
				data: rows,
				page: page,
				postCode: postCode,
				cmtRootCode: cmtRootCode || null,
				cmtResponseLv: cmtResponseLv || null,
				nbPage: nbPage,
				replyCounts: replyCounts,
				commentCounts: commentCounts,
			};

			if (callback) callback(fullMessage);
		} catch (error) {
			console.error('Error getting message:', error);
			if (callback) callback({ success: false, error: error.message });
		}
	});

	// Supprimer un messagecallback
	socket.on('comment-delete', async (data, callback) => {
		const { cmtCode, postCode, cmtRootCode, cmtResponseLv } = data;
		const transaction = await sequelize.transaction();
		try {

			const commentaire = await models.Comment.findAll({
				where: {
					cmtCode: cmtCode,
				},
				transaction,
				raw: true,
			});

			if (!commentaire) {
				throw new Error('Comment not found');
			}

			const updated = await models.Comment.update(
				{ cmtIsDeleted: true, cmtDeleteBy: socket.userID },
				{ where: { cmtCode: cmtCode }, transaction },
			);
			

			await transaction.commit();

			if (!updated[0] === 1) {
				throw new Error('Echec du mise à jour');
			}

			const { count, rows,cmtParenList } = await getComment({
				postCode: postCode,
				cmtResponseLv: cmtResponseLv,
				cmtRootCode: cmtRootCode,
				limit: 10,
			}); // Diffuser la suppression
			const nbPage = Math.ceil(parseInt(count) / 10);

			const replyCounts = await getCommentReplyCounts({ postCode: postCode });
			const commentCounts = await getCommentCounts({ postCode: postCode });
			

			const fullMessage = {
				success: true,
				message: `Commentaire supprimé dans le post ${postCode}  page 1/${nbPage}`,
				data: rows,
				page: 1,
				nbPage: nbPage,
				postCode: postCode,
				cmtRootCode: cmtRootCode || null,
				cmtResponseLv: cmtResponseLv || null,
				replyCounts: replyCounts,
				commentCounts: commentCounts,
				cmtParenList: cmtParenList,
				count: count,
			};

			io.emit('comment_update', fullMessage);
			if (callback) callback(fullMessage);
		} catch (error) {
			await transaction.rollback();
			console.error('Error deleting message:', error);
			if (callback) callback({ success: false, error: error.message });
		}
	});

	// Mettre à jour un message
	socket.on('comment-update', async (data, callback) => {
		const { cmtCode, postCode, content } = data;

		const transaction = await sequelize.transaction();
		try {

			const comment = await models.Comment.findByPk(cmtCode, {
				raw: true,
				transaction,
			});

			if (!comment) {
				throw new Error('Commentaire non trouvé');
			}

			// Vérifier que l'utilisateur est l'auteur
			if (comment.usrCode !== socket.userID) {
				throw new Error(
					'Vous pouvez seulement modifier votre propre commentaire',
				);
			}

			// Vérifier que le message n'a pas été supprimé
			if (comment.cmtIsDeleted) {
				throw new Error(
					'Vous ne pouvez pas modifier les commentaires supprimé',
				);
			}

			const { cmtRootCode, cmtResponseLv } = comment;

			// Mettre à jour le message avec les nouveaux noms de colonnes
			const updated = await models.Comment.update(
				{
					cmtModifDate: getPreciseGMTTime().iso,
					cmtContent: content,
				},
				{
					where: { cmtCode: cmtCode },
					transaction,
				},
			);

			await models.Comment.create(
				{
					cmtCode: await generateOldCode(comment.cmtCode, models.Comment),
					usrCode: socket.userID,
					cmtRootCode: cmtRootCode,
					postCode: postCode,
					cmtResponseLv: cmtResponseLv,
					cmtContent: comment.cmtContent,
					cmtCreatedDate: comment.cmtCreatedDate,
					cmtModifDate: comment.cmtModifDate,
					cmtIsDeleted: false,
					cmtSaveAsHistory: true,
				},
				{ transaction },
			);

			if (!updated[0] === 1) {
				throw new Error('Echec du mise à jour');
			}
			
			await transaction.commit();

			const { count, rows, cmtParenList } = await getComment({
				postCode: postCode,
				cmtResponseLv: cmtResponseLv,
				cmtRootCode: cmtRootCode,
				limit: 10,
			}); // Diffuser la suppression
			const nbPage = Math.ceil(parseInt(count) / 10);

			const replyCounts = await getCommentReplyCounts({ postCode: postCode });
			const commentCounts = await getCommentCounts({ postCode: postCode });

			const fullMessage = {
				success: true,
				message: `Commentaire mise à jour dans le post ${postCode}  page 1/${nbPage}`,
				data: rows,
				page: 1,
				nbPage: nbPage,
				postCode: postCode,
				cmtRootCode: cmtRootCode || null,
				cmtResponseLv: cmtResponseLv || null,
				replyCounts: replyCounts,
				commentCounts: commentCounts,
				cmtParenList: cmtParenList,
				count: count,
			};

			io.emit('comment_update', fullMessage);

			if (callback) callback(fullMessage);
		} catch (error) {
			await transaction.rollback();
			console.error('Error updating message:', error);
			if (callback) callback({ success: false, error: error.message });
		}
	});
}

// Fonction utile :

async function getComment({
	postCode,
	page = 1,
	limit = 20,
	cmtRootCode,
	cmtResponseLv,
	isDeleted = false,
}) {
	const offset = (page - 1) * limit;

	const whereCondition = {
		cmtSaveAsHistory: false,
		cmtResponseLv: null,
	};

	if (postCode) {
		whereCondition.postCode = postCode;
	}

	// Ajouter CMT_CODE seulement si cmtCode n'est pas null
	if (cmtRootCode !== null && cmtRootCode !== undefined) {
		whereCondition.cmtRootCode = cmtRootCode;
		whereCondition.cmtResponseLv = [1, 2];
	}

	const { count, rows } = await models.Comment.findAndCountAll({
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
		limit: limit,
		offset: offset,
		order: [['cmt_created_date', 'DESC']],
	});

	if (cmtRootCode) {
		const cmtParentCodeList = rows.map(c => c.cmtParentCode);
		const cmtParenList = await getCommentParent({
			cmtParentCodeList: cmtParentCodeList,
		});
		return { rows: rows, count: count, cmtParenList: cmtParenList };
	}
	

	return { rows: rows, count: count};
}

async function getCommentParent({ cmtParentCodeList }) {
	return await models.Comment.findAll({
		where: {
			cmtCode: { [Op.in]: cmtParentCodeList },
			cmtSaveAsHistory: false,
		},
		include: [
			{
				as: 'usrCodeUser',
				model: models.Users,
				attributes: [
					'usr_code',
					'usr_name',
					'usr_firstname',
					'usr_mail',
					'usr_img',
				],
			},
		],
		order: [['cmt_created_date', 'DESC']],
	});
}


async function getCommentCounts({ postCode, isDeleted = false }) {
	
	return await models.Comment.count({
		where: {
			postCode: postCode,
			cmtSaveAsHistory: false,
		},
	});
}

async function getCommentReplyCounts({ postCode, isDeleted = false }) {
	return await models.Comment.findAll({
		attributes: [
			'cmt_root_code',
			[sequelize.fn('COUNT', sequelize.col('cmt_root_code')), 'replyCount'],
		],
		where: {
			postCode: postCode,
			cmtIsDeleted: isDeleted,
			cmtRootCode: { [Op.not]: null },
			cmtSaveAsHistory: false,
		},
		group: ['cmt_root_code'],
		raw: true,
	});
}

