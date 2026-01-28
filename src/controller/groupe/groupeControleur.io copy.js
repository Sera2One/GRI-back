// groupeControleur.io.js
import { Op } from 'sequelize';
import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import moment from 'moment';
import fs from 'node:fs';
import path from 'path';
import { sanitizeFileName } from '../../services/sanitizeFileName.js';
import { generateUniqueFileName } from '../../services/generateUniqueFileName.js';
import { generateId } from '../../services/generateId.js';
import { getPreciseGMTTime } from '../../services/timeSync.js';
import { getMessageReaction } from '../reaction/reaction.io.js';

const models = initModels(sequelize);
const groupeMemberPrefix = 'gu-member';
const publicFolder = process.env.APP_PUBLIC_FOLDER;
const messageFolder = publicFolder + '/Message/Files/';

export default function initGroupSocket(socket, io) {
	console.log(`user-connected to groups: ${socket.id}`);
	// Se connecter au room groupe de chaque de l'utilisateur connecter
	models.GroupeUserMember.findAll({
		where: { usrCode: socket.userID, gumUserIsDeleted: false },
		attributes: ['gun_code'],
		raw: true,
	}).then(result => {
		console.log('resu 1', result);
		result.map(groupId => {
			socket.join(groupId.gun_code);
		});
	});

	// Récuperer les message d' un groupe
	socket.on(
		'groupe-get-message',
		async ({ groupId, page = 1, limit = 20, isDeleted = false }, callback) => {
			const offset = (page - 1) * limit;
			try {
				// Vérifier que l'utilisateur est membre du groupe
				const isMember = await models.GroupeUserMember.findOne({
					where: {
						gunCode: groupId,
						usrCode: socket.userID,
						gumUserIsDeleted: false,
					},
				});

				if (!isMember) {
					throw new Error('You are not a member of this group');
				}

				// Récupérer le message complet avec les infos utilisateur
				const { count, rows } = await models.GroupeUserMessage.findAndCountAll({
					where: {
						gunCode: groupId,
						gumesIsDeleted: isDeleted,
					},
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
						{
							model: models.GroupeUserFiles,
							as: 'groupeUserFiles',
							required: false,
							attributes: [
								'guf_code',
								'guf_path',
								'guf_type',
								'guf_name',
								'guf_is_deleted',
								'guf_created_date',
								'guf_size',
							],
						},
					],
					limit: limit,
					offset: offset,
					order: [['gumes_created_date', 'DESC']],
				});

				const nbPage = Math.ceil(parseInt(count) / limit);

				const gumesParentCodeList = rows
					.map(el => el.get({ plain: true }))
					.filter(msg => msg.gumesParentCode != null)
					.map(msg => msg.gumesCode);

				const msgCodeList = rows.map(msg => msg.gumesCode);
				const { reactions, reactionCounts } = await getMessageReaction({msgCodeList: msgCodeList});		

				const messageParentList = await getMessageParent(gumesParentCodeList);


				const fullMessage = {
					success: true,
					message: `Voici les messages (${count}) pour l'id du groupe ${groupId}  page ${page}/${nbPage}`,
					data: rows,
					page: page,
					nbPage: nbPage,
					groupId: groupId,
					messageParentList: messageParentList,
					reactions: reactions || [],
					reactionCounts: reactionCounts || 0,
				};

				// Enregistrer la dernier message lu.
				const data = rows.map(msg => msg.get({ plain: true }))[0];
				if (!socket.lastseen) {
					socket.lastseen = [];
				}

				if (data) {
					socket.lastseen[data.gunCode] = {
						gumesCode: data.gumesCode,
						gunCode: data.gunCode,
						gumesCreatedDate: data.gumesCreatedDate,
					};
					console.log('socket.lastseen', socket.lastseen);
				}

				if (callback) callback(fullMessage);
			} catch (error) {
				console.error('Error sending message:', error);
				if (callback) callback({ success: false, error: error.message });
			}
		},
	);

	// Récuperer les fichiers d' un groupe
	socket.on(
		'groupe-get-files',
		async (
			{ groupId, page = 1, limit = 200000, isDeleted = false },
			callback,
		) => {
			const offset = (page - 1) * limit;
			try {
				// Vérifier que l'utilisateur est membre du groupe
				const isMember = await models.GroupeUserMember.findOne({
					where: {
						gunCode: groupId,
						usrCode: socket.userID,
						gumUserIsDeleted: false,
					},
				});

				if (!isMember) {
					throw new Error('You are not a member of this group');
				}

				// Récupérer le message complet avec les infos utilisateur
				const { count, rows } = await models.GroupeUserFiles.findAndCountAll({
					where: {
						gunCode: groupId,
						gufIsDeleted: isDeleted,
					},
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
				});

				const nbPage = Math.ceil(parseInt(count) / limit);

				const fullMessage = {
					success: true,
					message: `Voici les fichiers (${count}) pour l'id du groupe ${groupId}  page ${page}/${nbPage}`,
					data: rows,
					page: page,
					groupId: groupId,
					nbPage: nbPage,
				};

				if (callback) callback(fullMessage);
			} catch (error) {
				console.error('Error sending message:', error);
				if (callback) callback({ success: false, error: error.message });
			}
		},
	);

	// Récuperer les dernier message des groupe
	socket.on(
		'groupe-get-last-message',
		async ({ page = 1, limit = 200, isDeleted = false }, callback) => {
			const offset = (page - 1) * limit;
			try {
				// recuperer les groupes de l'utilisateur
				const groupIdList = await models.GroupeUserMember.findAll({
					where: { usrCode: socket.userID, gumUserIsDeleted: false },
					attributes: ['gun_code'],
					raw: true,
				});

				console.log('groupIdList', groupIdList);

				if (!groupIdList || groupIdList.length === 0) {
					throw new Error(`Vous n'appartenez à aucun groupe`);
				}

				const gunCodes = groupIdList.map(group => group.gun_code);
				console.log('gunCodes, NB: filtre appliqué à ici', gunCodes);

				// Récupérer le dernier message complet avec les infos utilisateur
				const { count, rows } = await models.GroupeUserMessage.findAndCountAll({
					attributes: {
						exclude: [],
					},
					where: {
						gumesCreatedDate: {
							[Op.in]: sequelize.literal(`(
							SELECT MAX(gumes_created_date)
							FROM pe.groupe_user_message
							WHERE gumes_is_deleted = ${isDeleted}
							GROUP BY gun_code
							)`),
						},
					},
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
						{
							model: models.GroupeUserFiles,
							as: 'groupeUserFiles',
							required: false,
							attributes: [
								'guf_code',
								'guf_path',
								'guf_type',
								'guf_name',
								'guf_is_deleted',
								'guf_created_date',
								'guf_size',
							],
						},
					],
					offset: offset,
					limit: limit,
				});

				const nbPage = Math.ceil(parseInt(count) / limit);

				const fullMessage = {
					success: true,
					message: `Voici les derniers messages (${count}) pour l'id du utilisateur ${socket.userID}  page ${page}/${nbPage}`,
					data: rows,
					page: page,
					nbPage: nbPage,
				};

				console.log('socket.lastseen', socket.lastseen);

				if (callback) callback(fullMessage);
			} catch (error) {
				console.error('Error getting last messages:', error);
				if (callback) callback({ success: false, error: error.message });
			}
		},
	);

	// Envoyer un message dans un groupe
	socket.on(
		'groupe-send-message',
		async ({ groupId, content, files, msgParentCode }, callback) => {
			const page = 1,
				limit = 20,
				isDeleted = false;
			const offset = (page - 1) * limit;
			console.log('data in', { groupId, content, files });
			const fileMetadata = [];

			try {
				// Vérifier que l'utilisateur est membre du groupe
				const isMember = await models.GroupeUserMember.findOne({
					where: {
						gunCode: groupId,
						usrCode: socket.userID,
						gumUserIsDeleted: false,
					},
				});

				if (!isMember) {
					throw new Error('You are not a member of this group');
				}

				const msgCode = await generateId('GroupeUserMessage');

				const isValideFiles = files && Array.isArray(files);

				// Traitement des fichiers joints
				if (isValideFiles) {
					const destinationFolderPath = path.join(messageFolder, groupId);

					try {
						await fs.promises.access(destinationFolderPath);
					} catch {
						await fs.promises.mkdir(destinationFolderPath, { recursive: true });
					}

					let index = 0;

					for (const oneFile of files) {
						if (
							oneFile.file &&
							(oneFile.file instanceof Uint8Array ||
								Buffer.isBuffer(oneFile.file))
						) {
							const buffer = Buffer.from(oneFile.file); // Si transféré via ArrayBuffer
							const secureOriginalName = sanitizeFileName(oneFile.name);
							const newFileName = `${generateUniqueFileName()}___${secureOriginalName}`;
							const newPath = `/Message/Files/${groupId}/${newFileName}`;

							const filePath = path.join(destinationFolderPath, newFileName);

							try {
								await fs.promises.writeFile(filePath, buffer); // ✅ Version Promise sans callback
								fileMetadata.push({
									gufCode: msgCode + '-' + index,
									gunCode: groupId,
									usrCode: socket.userID,
									gumesCode: msgCode,
									gufSize: oneFile.size,
									gufPath: newPath,
									gufType: oneFile.type,
									gufName: secureOriginalName,
									gufIsDeleted: false,
									gufCreatedDate: getPreciseGMTTime().iso,
								});
								index++;
							} catch (err) {
								console.error(
									`Erreur lors de l'enregistrement du fichier ${oneFile.name} :`,
									err,
								);
							}
						} else {
							console.warn('Données du fichier invalides');
						}
					}
				} else if (files) {
					console.warn("msgPieceJoint n'est pas un tableau !");
				}

				
				const messageData = {
					gumesCode: msgCode,
					gunCode: groupId,
					usrCode: socket.userID,
					gumesContent: content,
				};

				if (msgParentCode) {
					messageData.gumesParentCode = msgParentCode;
				}

				// Créer le message avec les nouveaux noms de colonnes
				const newMessage = await models.GroupeUserMessage.create(messageData);

				

				try {
					if (isValideFiles) {
						// Save to data base
						const saveStatus = await models.GroupeUserFiles.bulkCreate(
							fileMetadata,
						);
						console.log('saveStatus', saveStatus);
					}
				} catch (err) {
					console.error(
						`Erreur lors de l'enregistrement du fichier dans la base de donnée :`,
						err,
					);
				}

				// Récupérer le message complet avec les infos utilisateur
				const { count, rows } = await models.GroupeUserMessage.findAndCountAll({
					where: {
						gunCode: groupId,
						gumesIsDeleted: isDeleted,
					},
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
						{
							model: models.GroupeUserFiles,
							as: 'groupeUserFiles',
							required: false,
							attributes: [
								'guf_code',
								'guf_path',
								'guf_type',
								'guf_name',
								'guf_is_deleted',
								'guf_created_date',
								'guf_size',
							],
						},
					],
					limit: limit,
					offset: offset,
					order: [['gumes_created_date', 'DESC']],
				});

				const gumesParentCodeList = rows
					.map(el => el.get({ plain: true }))
					.filter(msg => msg.gumesParentCode != null)
					.map(msg => msg.gumesCode);
				
				console.log('gumesParentCodeList', gumesParentCodeList);

				const msgCodeList = rows.map(msg => msg.gumesCode);
				const { reactions, reactionCounts } = await getMessageReaction({
					msgCodeList: msgCodeList,
				});
				

				const messageParentList = await getMessageParent(gumesParentCodeList);

				const nbPage = Math.ceil(parseInt(count) / limit);

				const fullMessage = {
					success: true,
					message: `Voici les messages (${count}) pour l'id du groupe ${groupId}  page ${page}/${nbPage}`,
					data: rows,
					page: page,
					nbPage: nbPage,
					groupId: groupId,
					messageParentList: messageParentList,
					reactions: reactions || [],
					reactionCounts: reactionCounts || 0,
				};

				console.log('fullMessage', fullMessage);
								

				// Diffuser le message à tous les membres du groupe
				socket.to(groupId).emit('groupe-new-message', fullMessage);
				if (callback) callback(fullMessage);
			} catch (error) {
				console.error('Error sending message:', error);
				if (callback) callback({ success: false, error: error.message });
			}
		},
	);

	// Supprimer un messagecallback
	socket.on('groupe-delete-message', async (data, callback) => {
		const { msgCode, groupId } = data;
		const transaction = await sequelize.transaction();
		try {
			// Récupérer le message
			const message = await models.GroupeUserMessage.findAll({
				where: {
					gumesCode: msgCode,
				},
				transaction,
				raw: true,
			});

			if (!message) {
				throw new Error('Message not found');
			}

			// Même groupe
			const messageIsNotSameGroupe = message.some(
				val => val.gunCode != groupId,
			);
			// Vérifier les permissions (auteur ou admin)
			const isAuthor = message.every(val => val.usrCode === socket.userID);
			const isAdmin = await models.GroupeUserMember.findOne({
				where: {
					gunCode: groupId,
					usrCode: socket.userID,
					gumUserIsDeleted: false,
					gumIsAdmin: true,
				},
				transaction,
				raw: true,
			});

			if (messageIsNotSameGroupe) {
				throw new Error(
					"Les messages selectionnés n'appartiennent pas au même groupe",
				);
			}

			if (!isAuthor && !isAdmin) {
				throw new Error('Permission denied');
			}

			// Soft delete avec le nouveau nom de colonne
			await models.GroupeUserMessage.update(
				{ gumesIsDeleted: true },
				{ where: { gumesCode: msgCode }, transaction },
			);

			await transaction.commit();

			const { count, rows } = await getMessage({ groupId: groupId, limit: 10 }); // Diffuser la suppression

			const gumesParentCodeList = rows
				.map(el => el.get({ plain: true }))
				.filter(msg => msg.gumesParentCode != null)
				.map(msg => msg.gumesCode);

			const msgCodeList = rows.map(msg => msg.gumesCode);
			const { reactions, reactionCounts } = await getMessageReaction({
				msgCodeList: msgCodeList,
			});

			console.log('gumesParentCodeList', gumesParentCodeList);

			const messageParentList = await getMessageParent(gumesParentCodeList);

			const nbPage = Math.ceil(parseInt(count) / limit);

			const fullMessage = {
				success: true,
				message: `Message supprimé dans le ${groupId}  page 1/${nbPage}`,
				data: rows,
				page: page,
				nbPage: nbPage,
				groupId: groupId,
				messageParentList: messageParentList,
				reactions: reactions || [],
				reactionCounts: reactionCounts || 0,
			};

			socket.to(message.gunCode).emit('groupe-message-deleted', fullMessage);
			if (callback) callback(fullMessage);
		} catch (error) {
			await transaction.rollback();
			console.error('Error deleting message:', error);
			if (callback) callback({ success: false, error: error.message });
		}
	});

	socket.on('start-typing', ({ contextId, userInfo }) => {
		console.log("start-typing", userInfo);
		
		socket.to(contextId).emit('user-start-typing', { contextId, userInfo });
	});

	socket.on('stop-typing', ({ contextId, userInfo }) => {
		console.log('stop-typing', userInfo);
		socket.to(contextId).emit('user-stop-typing', { contextId, userInfo });
	});

	// Mettre à jour un message
	socket.on(
		'groupe-update-message',
		async ({ messageId, content }, callback) => {
			const transaction = await sequelize.transaction();
			try {
				// Récupérer le message
				const message = await models.GroupeUserMessage.findByPk(messageId, {
					transaction,
				});

				if (!message) {
					throw new Error('Message not found');
				}

				// Vérifier que l'utilisateur est l'auteur
				if (message.usrCode !== socket.userID) {
					throw new Error('You can only edit your own messages');
				}

				// Vérifier que le message n'a pas été supprimé
				if (message.GUMES_IS_DELETED) {
					throw new Error('Cannot edit deleted message');
				}

				// Mettre à jour le message avec les nouveaux noms de colonnes
				const [updated] = await models.GroupeUserMessage.update(
					{
						gumesContent: content,
						GUMES_UPDATED_DATE: new Date(),
					},
					{
						where: { gumesCode: messageId },
						transaction,
					},
				);

				if (!updated) {
					throw new Error('Update failed');
				}

				const updatedMessage = await models.GroupeUserMessage.findByPk(
					messageId,
					{
						include: [
							{
								model: models.Users,
								as: 'usrCode_User',
								attributes: ['usrCode', 'USR_NAME', 'USR_IMG'],
							},
						],
						transaction,
					},
				);

				await transaction.commit();

				// Diffuser la mise à jour
				socket
					.to(message.gunCode)
					.emit('groupe-message-updated', updatedMessage);
				if (callback) callback({ success: true, message: updatedMessage });
			} catch (error) {
				await transaction.rollback();
				console.error('Error updating message:', error);
				if (callback) callback({ success: false, error: error.message });
			}
		},
	);
}

// Fonction utile :

async function getMessage({
	groupId,
	page = 1,
	limit = 20,
	isDeleted = false,
}) {
	const offset = (page - 1) * limit;
	return await models.GroupeUserMessage.findAndCountAll({
		where: {
			gunCode: groupId,
			gumesIsDeleted: isDeleted,
		},
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
			{
				model: models.GroupeUserFiles,
				as: 'groupeUserFiles',
				required: false,
				attributes: [
					'guf_code',
					'guf_path',
					'guf_type',
					'guf_name',
					'guf_is_deleted',
					'guf_created_date',
					'guf_size',
				],
			},
		],
		limit: limit,
		offset: offset,
		order: [['gumes_created_date', 'DESC']],
	});
}

async function getMessageParent(gumesParentCodeList) {
	return await models.GroupeUserMessage.findAll({
		where: {
			gumesCode: { [Op.in]: gumesParentCodeList },
		},
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
			{
				model: models.GroupeUserFiles,
				as: 'groupeUserFiles',
				required: false,
				attributes: [
					'guf_code',
					'guf_path',
					'guf_type',
					'guf_name',
					'guf_is_deleted',
					'guf_created_date',
					'guf_size',
				],
			},
		],
		order: [['gumes_created_date', 'DESC']],
	});
}
