// message.io.js
import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import moment from 'moment';
import fs from 'node:fs';
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import { sanitizeFileName } from '../../services/sanitizeFileName.js';
import { generateUniqueFileName } from '../../services/generateUniqueFileName.js';
import { Op, Sequelize } from 'sequelize';
import { getPreciseGMTTime } from '../../services/timeSync.js';
import { getMessageReaction } from '../reaction/reaction.io.js';


// Configuration
const CONFIG = {
	MESSAGE_PREFIX: 'msg',
	PREFIX_SEPARATOR: '-',
	PUBLIC_FOLDER: process.env.APP_PUBLIC_FOLDER,
	MESSAGE_FOLDER: process.env.APP_PUBLIC_FOLDER + '/Message/Files/',
	DEFAULT_LIMIT: 20,
	DEFAULT_PAGE: 1,
	MAX_MESSAGES_LIMIT: 200,
};

const models = initModels(sequelize);

// Classe principale pour gérer les messages
class MessageHandler {
	constructor(socket, io) {
		this.socket = socket;
		this.io = io;
		this.initializeHandlers();
	}

	initializeHandlers() {
		this.socket.on('user-new-message', this.handlePrivateMessage.bind(this));
		this.socket.on(
			'user-get-last-message',
			this.handleGetLastMessage.bind(this),
		);
		this.socket.on('user-delete-message', this.handleDeleteMessage.bind(this));
		this.socket.on('user-get-files', this.handleGetUserFiles.bind(this));
	}

	async handlePrivateMessage(data, callback) {
		const { destCodeListe, usrCode, msgContenu, msgPieceJoint } = data;

		try {
			console.log('Données reçues:', data);

			const result = await this.postMessage(data);

			if (callback) {
				const messageData = await this.returnMessageToUser(data);
				callback(messageData);
			}

			this.socket.emit('message sended', 'ok');
		} catch (error) {
			console.error('Erreur lors du traitement du message privé:', error);
			if (callback) {
				callback({ success: false, error: error.message });
			}
		}
	}

	async handleDeleteMessage(data, callback) {
		const { destCodeListe, usrCode, msgCode } = data;
		console.log('data :', data);

		try {
			console.log('Données reçues:', data);

			const result = await this.deleteMessage(msgCode);

			if (result[0] == 0)
				throw 'Erreur lors du mise à jour dans le base de donné';

			console.log('result', result);

			if (callback) {
				const messageData = await this.returnMessageToUser(data);
				callback(messageData);
			}
		} catch (error) {
			console.error('Erreur lors du suppression du message:', error);
			if (callback) {
				callback({ success: false, error: error.message });
			}
		}
	}

	async handleGetUserFiles(data, callback) {
		const { page = 1, limit = 200000, isDeleted = false, usrCode } = data;
		console.log('data :', data);
		const offset = (page - 1) * limit;

		try {
			const { count, rows } = await models.MsgFileJoint.findAndCountAll({
				where: {
					usrCode: usrCode,
					msgFileIsDeleted: isDeleted,
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
				message: `Voici les fichiers (${count}) pour l'id du utilisateur ${usrCode}  page ${page}/${nbPage}`,
				data: rows,
				page: page,
				nbPage: nbPage,
			};

			if (callback) callback(fullMessage);
		} catch (error) {
			console.error('Erreur lors du suppression du message:', error);
			if (callback) {
				callback({ success: false, error: error.message });
			}
		}
	}

	async handleGetLastMessage(
		{ page = 1, limit = 200, isDeleted = false },
		callback,
	) {
		try {
			const result = await this.getLastMessages(page, limit, isDeleted);
			if (callback) callback(result);
		} catch (error) {
			console.error(
				'Erreur lors de la récupération des derniers messages:',
				error,
			);
			if (callback) callback({ success: false, error: error.message });
		}
	}

	async postMessage(ioData) {
		// Validation des données
		this.validateMessageData(ioData);

		// Génération de l'ID du message
		const msgCode = await this.generateMessageCode();
		const msgCreatedDate = getPreciseGMTTime().iso;

		// Traitement des fichiers joints
		const fileMetadata = await this.processAttachments(
			ioData.msgPieceJoint,
			ioData.usrCode,
			msgCode,
		);

		// Validation des destinataires
		await this.validateDestinations(ioData.destCodeListe);

		// Préparation des données pour la sauvegarde
		const messageData = this.prepareMessageData(
			ioData,
			msgCode,
			msgCreatedDate,
		);

		const destinationData = this.prepareDestinationData(
			ioData,
			msgCode,
			msgCreatedDate,
		);

		// Sauvegarde en base de données
		await this.saveMessageToDatabase(
			messageData,
			destinationData,
			fileMetadata,
		);

		// Émission du message aux utilisateurs connectés
		await this.emitMessageToUsers(
			destinationData,
			ioData,
			fileMetadata,
			msgCreatedDate,
		);

		return 'OK';
	}

	validateMessageData(ioData) {
		if (!ioData.usrCode) {
			throw new Error('ID utilisateur manquant');
		}
		if (!ioData.destCodeListe || ioData.destCodeListe.length === 0) {
			throw new Error('Liste des destinataires manquante');
		}
		if (!ioData.msgContenu) {
			throw new Error('Contenu du message manquant');
		}
	}

	async generateMessageCode() {
		const lastMessages = await models.Messages.findAll({
			order: [['msg_created_date', 'DESC']],
			raw: true,
			limit: CONFIG.DEFAULT_LIMIT,
		});

		const lastMsgCode =
			lastMessages.length === 0
				? 0
				: Math.max(
						...lastMessages.map(msg => parseInt(msg.msgCode.match(/\d+/g))),
				  );

		return `${CONFIG.MESSAGE_PREFIX}${CONFIG.PREFIX_SEPARATOR}${
			lastMsgCode + 1
		}`;
	}

	async processAttachments(msgPieceJoint, usrCode, msgCode) {
		if (!msgPieceJoint || !Array.isArray(msgPieceJoint)) {
			return [];
		}

		const fileMetadata = [];
		const destinationFolderPath = path.join(CONFIG.MESSAGE_FOLDER, usrCode);

		// Création du dossier de destination si nécessaire
		await this.ensureDirectoryExists(destinationFolderPath);

		for (let index = 0; index < msgPieceJoint.length; index++) {
			const oneFile = msgPieceJoint[index];

			if (this.isValidFileData(oneFile)) {
				const metadata = await this.processFile(
					oneFile,
					usrCode,
					msgCode,
					index,
					destinationFolderPath,
				);
				if (metadata) {
					fileMetadata.push(metadata);
				}
			}
		}

		return fileMetadata;
	}

	async ensureDirectoryExists(dirPath) {
		try {
			await fs.promises.access(dirPath);
		} catch {
			await fs.promises.mkdir(dirPath, { recursive: true });
		}
	}

	isValidFileData(fileData) {
		return (
			fileData.file &&
			(fileData.file instanceof Uint8Array || Buffer.isBuffer(fileData.file)) &&
			fileData.name
		);
	}

	async processFile(fileData, usrCode, msgCode, index, destinationFolderPath) {
		try {
			const buffer = Buffer.from(fileData.file);
			const fileType = await fileTypeFromBuffer(buffer);

			const secureOriginalName = sanitizeFileName(fileData.name);
			const newFileName = `${generateUniqueFileName()}___${secureOriginalName}`;
			const newPath = `/Message/Files/${usrCode}/${newFileName}`;
			const filePath = path.join(destinationFolderPath, newFileName);

			await fs.promises.writeFile(filePath, buffer);

			return {
				msgFileCode: `${msgCode}-${index}`,
				usrCode: usrCode,
				msgCode: msgCode,
				msgFileSize: fileData.size,
				msgFilePath: newPath,
				msgFileType: fileData.type,
				msgFileExtension: null,
				msgFileClientFileName: secureOriginalName,
				msgFileIsDeleted: false,
				msgFileCreatedDate: getPreciseGMTTime().iso,
			};
		} catch (error) {
			console.error(
				`Erreur lors du traitement du fichier ${fileData.name}:`,
				error,
			);
			return null;
		}
	}

	async validateDestinations(destCodeListe) {
		const findUserMissing = [];
		let errorMissingDestination = false;

		for (const dest of destCodeListe) {
			if (!dest?.destCode) {
				errorMissingDestination = true;
				continue;
			}

			const user = await models.Users.findByPk(dest.destCode);
			if (!user) {
				findUserMissing.push(dest.destCode);
			}
		}

		if (errorMissingDestination) {
			throw new Error(
				'Code de destination manquant dans la liste des destinataires',
			);
		}

		if (findUserMissing.length > 0) {
			throw new Error(
				`Les utilisateurs suivants n'existent pas : ${findUserMissing.join(
					', ',
				)}`,
			);
		}
	}

	prepareMessageData(ioData, msgCode, msgCreatedDate) {
		const { msgContenu, usrCode, msgParentCode } =
			ioData;
		const messageData = {
			msgCode: msgCode,
			usrCode: usrCode,
			msgContenu: msgContenu,
			msgCreatedDate: msgCreatedDate,
			msgIsDeleted: false,
			msgModifDate: null,
		};

		if (msgParentCode) {
			messageData.msgParentCode = msgParentCode;
		}

		return messageData;
	}

	prepareDestinationData(ioData, msgCode, msgCreatedDate) {
		return ioData.destCodeListe.map(dest => ({
			msgCode: msgCode,
			usrCode: dest.destCode,
			destSenderCode: ioData.usrCode,
			destIsReaded: false,
			destIsDeleted: false,
			destCreatedDate: msgCreatedDate,
			destModifDate: null,
		}));
	}

	async saveMessageToDatabase(messageData, destinationData, fileMetadata) {
		const transaction = await sequelize.transaction();

		try {
			// Sauvegarde du message
			await models.Messages.create(messageData, { transaction });

			// Sauvegarde des destinations
			await models.Destination.bulkCreate(destinationData, { transaction });

			// Sauvegarde des fichiers joints
			if (fileMetadata.length > 0) {
				await models.MsgFileJoint.bulkCreate(fileMetadata, { transaction });
			}

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw new Error('Erreur lors de la sauvegarde en base de données');
		}
	}

	async emitMessageToUsers(
		destinationData,
		ioData,
		fileMetadata,
		msgCreatedDate,
	) {
		const connectedUsers = await this.getConnectedUsers();

		destinationData.forEach(destMsg => {
			const userOnline = connectedUsers.find(
				user => user.usrCode === destMsg.usrCode,
			);

			if (userOnline) {
				this.socket
					.to(this.socket.userID)
					.to(userOnline.usrCode)
					.emit('user-new-message', {
						...destMsg,
						...userOnline,
						msgContenu: ioData.msgContenu,
						msgPieceJoint: JSON.stringify(fileMetadata),
						msgCreatedDate: msgCreatedDate,
						msgIsDeleted: false,
						senderImg: this.socket.handshake.auth.usrImg,
						senderName: this.socket.handshake.auth.usrName,
						senderFirstname: this.socket.handshake.auth.usrFirstname,
					});
			}
		});
	}

	async getConnectedUsers() {
		const sockets = await this.io.fetchSockets();
		return sockets.map(socket => ({
			userSocketID: socket.id,
			...socket.handshake.auth,
		}));
	}

	async getLastMessages(page = 1, limit = 200, isDeleted = false) {
		const offset = (page - 1) * limit;
		const usrCode = this.socket.userID;

		const { count, rows } = await models.Destination.findAndCountAll({
			attributes: {
				include: [
					[Sequelize.col('usr_code'), 'dest_code'],
					[Sequelize.col('dest_sender_code'), 'sender_code'],
				],
				exclude: [],
			},
			where: {
				destCreatedDate: {
					[Op.in]: sequelize.literal(`(
                        SELECT MAX(d2.dest_created_date)
                        FROM pe.destination d2
                        WHERE 
                        (d2.usr_code = '${usrCode}' OR d2.dest_sender_code = '${usrCode}')
                        AND d2.dest_is_deleted = ${isDeleted}
                        GROUP BY 
                        CASE 
                            WHEN d2.usr_code < d2.dest_sender_code THEN d2.usr_code || '-' || d2.dest_sender_code
                            ELSE d2.dest_sender_code || '-' || d2.usr_code
                        END
                    )`),
				},
			},
			include: this.getMessageIncludeOptions(),
			offset: offset,
			limit: limit,
		});

		const nbPage = Math.ceil(parseInt(count) / limit);
		const unreadCounts = await this.getUnreadCounts(usrCode);

		return {
			success: true,
			message: `Voici les derniers messages (${count}) pour l'utilisateur ${usrCode}, page ${page}/${nbPage}`,
			data: rows,
			page: page,
			nbPage: nbPage,
			unreadCounts: unreadCounts,
		};
	}

	getMessageIncludeOptions() {
		return [
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
				as: 'msgCodeMessage',
				model: models.Messages,
				attributes: [
					'msg_code',
					'usr_code',
					'msg_contenu',
					'msg_created_date',
					'msg_modif_date',
					'msg_parent_code',
				],
				include: [
					{
						model: models.MsgFileJoint,
						as: 'msgFileJoints',
						required: false,
						attributes: [
							'msg_file_code',
							'usr_code',
							'msg_file_path',
							'msg_file_type',
							'msg_file_client_file_name',
							'msg_file_is_deleted',
							'msg_file_created_date',
							'msg_file_size',
						],
					},
				],
			},
		];
	}

	async getUnreadCounts(usrCode) {
		return await models.Destination.findAll({
			attributes: [
				[sequelize.fn('COUNT', sequelize.col('msg_code')), 'count'],
				[
					sequelize.literal(`CASE 
                        WHEN usr_code = '${usrCode}' THEN dest_sender_code
                        ELSE usr_code
                    END`),
					'interlocutor',
				],
			],
			where: {
				dest_is_readed: false,
				dest_is_deleted: false,
				[Op.or]: [{ usr_code: usrCode }, { dest_sender_code: usrCode }],
			},
			group: ['interlocutor'],
			raw: true,
		});
	}

	async deleteMessage(msgCode) {
		return await models.Destination.update(
			{
				destIsDeleted: true,
			},
			{
				where: {
					msgCode: msgCode,
				},
			},
		);
	}

	async getMessageParent(msgParentCodeList) {
		return await models.Messages.findAll({
			where: {
				msgCode: { [Op.in]: msgParentCodeList },
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
					model: models.MsgFileJoint,
					as: 'msgFileJoints',
					required: false,
					attributes: [
						'msg_file_code',
						'usr_code',
						'msg_file_path',
						'msg_file_type',
						'msg_file_client_file_name',
						'msg_file_is_deleted',
						'msg_file_created_date',
						'msg_file_size',
					],
				},
			],
		});
		
	}

	async returnMessageToUser(ioData) {
		const limit = parseInt(ioData.limit) || CONFIG.DEFAULT_LIMIT;
		const page = parseInt(ioData.page) || CONFIG.DEFAULT_PAGE;
		const offset = (page - 1) * limit;
		const senderCode = ioData.usrCode;
		const destinationCode = ioData.destCodeListe[0].destCode;
		const destIsDeleted = ioData.isDeleted || false;

		const { count, rows } = await models.Destination.findAndCountAll({
			where: {
				[Op.and]: [
					{
						[Op.or]: [
							{ destSenderCode: destinationCode, usrCode: senderCode },
							{ destSenderCode: senderCode, usrCode: destinationCode },
						],
					},
					{ destIsDeleted: destIsDeleted },
				],
			},
			include: this.getMessageIncludeOptions(),
			limit: limit,
			offset: offset,
			order: [['dest_created_date', 'DESC']],
			attributes: {
				include: [
					[Sequelize.col('usr_code'), 'dest_code'],
					[Sequelize.col('dest_sender_code'), 'sender_code'],
				],
				exclude: [],
			},
		});
		let msgParenList = [];

		const msgParentCodeList = rows
			.map(el => el.get({ plain: true }))
			.map(msg => msg.msgCodeMessage.msg_parent_code)
			.filter(Boolean);

		if (msgParentCodeList) {
			msgParenList = await this.getMessageParent( msgParentCodeList);
		}
		const msgCodeList = rows.map(msg => msg.msgCode);
		const { reactions, reactionCounts } = await getMessageReaction({msgCodeList: msgCodeList});		

		const nbPage = Math.ceil(parseInt(count) / limit);

		return {
			success: true,
			page: page,
			nbPage: nbPage,
			message: `Messages (${count}) pour ${senderCode} -> ${destinationCode}. Page ${page}/${nbPage}`,
			data: rows,
			pessageParentList: msgParenList,
			reactions: reactions || [],
		 	reactionCounts : reactionCounts || 0,
		};
	}
}

// Fonction d'initialisation pour maintenir l'API existante
export const messageIO = (socket, io) => {
	return new MessageHandler(socket, io);
};
