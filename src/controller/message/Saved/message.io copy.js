import { sequelize } from "../../../db/config/database.js";
import initModels from "../../../db/models/init-models.js";
import moment from "moment";
import fs  from "node:fs";
import {fileTypeFromBuffer} from 'file-type';
import path from 'path';
import { sanitizeFileName } from "../../../services/sanitizeFileName.js";
import { generateUniqueFileName } from "../../../services/generateUniqueFileName.js";
import { Op, Sequelize } from "sequelize";
import { getPreciseGMTTime } from "../../../services/timeSync.js";

var models = initModels(sequelize);
const messagePrefix = "msg";
const PrefixSeparator = "-";
const publicFolder = process.env.APP_PUBLIC_FOLDER;
const messageFolder = publicFolder + '/Message/Files/';

export const messageIO = (socket, io) => {
	socket.on(
		'user-new-message',
		async ({ destCodeListe, usrCode, msgContenu, msgPieceJoint }, callback) => {
			const data = { destCodeListe, usrCode, msgContenu, msgPieceJoint };
			console.log('data aa', data);

			const status = await postMessage(data, socket, io);
			if (callback) {
				const dataToSend = await returnMessageToUser(data, socket, io);
				callback(dataToSend);
			}
			socket.emit('message sended', 'ok');
		},
	);

	// Récuperer les dernier message des groupe
	socket.on(
		'user-get-last-message',
		async ({ page = 1, limit = 200, isDeleted = false }, callback) => {
			const offset = (page - 1) * limit;
			const usrCode = socket.userID;
			try {
				// Récupérer le dernier message complet avec les infos utilisateur
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
							as: 'msgCodeMessage',
							model: models.Messages,
							attributes: [
								'msg_code',
								'usr_code',
								'msg_contenu',
								'msg_created_date',
								'msg_modif_date',
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
					],
					offset: offset,
					limit: limit,
				});

				const nbPage = Math.ceil(parseInt(count) / limit);

				const unreadCounts = await models.Destination.findAll({
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


				const fullMessage = {
					success: true,
					message: `Voici les derniers messages (${count}) pour l'id du utilisateur ${socket.userID}  page ${page}/${nbPage}`,
					data: rows,
					page: page,
					nbPage: nbPage,
					unreadCounts: unreadCounts,
				};

				if (callback) callback(fullMessage);
			} catch (error) {
				console.error('Error getting last messages:', error);
				if (callback) callback({ success: false, error: error.message });
			}
		},
	);
};

const postMessage = async (ioData, socket, io) => {
	// Verification si toute est correcte avant le sauvegard
	const UsrCodeIsNullOrMissing = !ioData.usrCode || ioData.usrCode === null;
	const MessageIsNullOrMissing =
		!ioData.msgContenu || ioData.msgContenu === null;
	const DestinationIsNullOrMissing =
		!ioData.destCodeListe || ioData.destCodeListe === null;
	const limit = 20;

	if (UsrCodeIsNullOrMissing) {
		return { error: `Users id vide` };
	}

	if (DestinationIsNullOrMissing) {
		return { error: `La dest_code (destination) ne peut pas être vide` };
	}

	if (MessageIsNullOrMissing) {
		return { error: `Le message ne peut pas être vide` };
	}

	//générer l'id message
	const getLastMessage = await models.Messages.findAll({
		order: [['msg_created_date', 'DESC']],
		raw: true,
		limit: limit,
	});

	const last_msg_code = !getLastMessage.length
		? 0
		: getLastMessage
				.map(function (id) {
					return parseInt(id.msgCode.match(/\d+/g));
				})
				.reduce((previousId, currentId) =>
					previousId > currentId ? previousId : currentId,
				);

	const msgCode = messagePrefix + PrefixSeparator + (last_msg_code + 1);
	const msgCreatedDate = getPreciseGMTTime().iso;
	const msgContenu = ioData.msgContenu;
	const destCodeListe = ioData.destCodeListe;
	const usrCode = ioData.usrCode;
  	const fileMetadata = [];
	const isValidePieceJoint =  ioData.msgPieceJoint && Array.isArray(ioData.msgPieceJoint)

	// Traitement des fichiers joints
	if (isValidePieceJoint) {
		const userCode = ioData.usrCode;
		const destinationFolderPath = path.join(messageFolder, userCode);

		try {
			await fs.promises.access(destinationFolderPath);
		} catch {
			await fs.promises.mkdir(destinationFolderPath, { recursive: true });
		}

		let index = 0;

		for (const oneFile of ioData.msgPieceJoint) {
      
			if (
				oneFile.file &&
				(oneFile.file instanceof Uint8Array || Buffer.isBuffer(oneFile.file))
			) {
				const buffer = Buffer.from(oneFile.file); // Si transféré via ArrayBuffer
				const fileType = await fileTypeFromBuffer(buffer);

				const secureOriginalName = sanitizeFileName(oneFile.name);
				const newFileName = `${generateUniqueFileName()}___${secureOriginalName}`;
				const newPath = `/Message/Files/${userCode}/${newFileName}`;

				const filePath = path.join(destinationFolderPath, newFileName);

				try {
					await fs.promises.writeFile(filePath, buffer); // ✅ Version Promise sans callback

					fileMetadata.push({
						msgFileCode: msgCode +"-"+ index ,
						usrCode: usrCode ,
						msgCode: msgCode ,
						msgFileSize:oneFile.size,
						msgFilePath:newPath,
						msgFileType:oneFile.type,
						msgFileExtension: null,
						msgFileClientFileName:secureOriginalName,
						msgFileIsDeleted: false,
						msgFileCreatedDate: getPreciseGMTTime().iso
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
		
	} else if (ioData.msgPieceJoint) {
		console.warn("msgPieceJoint n'est pas un tableau !");
	}

	const msgToSave = {
		msgCode: msgCode,
		usrCode: usrCode,
		msgContenu: msgContenu,
		msgCreatedDate: msgCreatedDate,
		msgIsDeleted: false,
		msgModifDate: null,
	};

	const findUserMissing = [];
	let errorMissingDestination = false;
	for (const dest of destCodeListe) {
		if (!dest?.destCode) {
			errorMissingDestination = true;
		}
		const user = await models.Users.findByPk(dest.destCode);
		if (!user) {
			findUserMissing.push(dest.destCode);
		}
	}

	if (errorMissingDestination) {
		const messageError = 'Attention, destCode absent dans destCodeListe ';
		return { error: messageError, destCodeListe: findUserMissing };
	}

	if (findUserMissing.length > 0) {
		const messageError =
			"Les utilisateur suivant n'existe pas dans la base de donnée";
		return { error: messageError, destCodeListe: findUserMissing };
	}

	const destToSave = destCodeListe.map(dest => {
		return {
			msgCode: msgCode,
			usrCode: dest.destCode,
			destSenderCode: usrCode,
			destIsReaded: false,
			destIsDeleted: false,
			destCreatedDate: msgCreatedDate,
			destModifDate: null,
		};
	});

	try {
		// Sauvegarde le message dans la base de donnée
		const newMessage = await models.Messages.create(msgToSave);
		const message = `Message envoyé.`;
		const saveStatus = [];
		for (const dest of destToSave) {
			let resulte = await models.Destination.create(dest);
			saveStatus.push(resulte);
		}

		try {
			if (isValidePieceJoint) {
				// Save to data base
				await models.MsgFileJoint.bulkCreate(fileMetadata);
			}
		} catch (err) {
			console.error(
				`Erreur lors de l'enregistrement du fichier dans la base de donnée :`,
				err,
			);
		}

		const users = [];

		const sockets = await io.fetchSockets();
		sockets.forEach(socket => {
			users.push({
				userSocketID: socket.id,
				...socket.handshake.auth,
			});
		});

		destToSave.map(destMsg => {

			const userOnline = users.find(a => a.usrCode === destMsg.usrCode);
			if (userOnline) {
				socket
					.to(socket.userID)
					.to(userOnline.usrCode)
					.emit('user-new-message', {
						...destMsg,
						...userOnline,
						msgContenu: msgContenu,
						msgPieceJoint: JSON.stringify(fileMetadata),
						msgCreatedDate: msgCreatedDate,
						msgIsDeleted: false,
						senderImg: socket.handshake.auth.usrImg,
						senderName: socket.handshake.auth.usrName,
						senderFirstname: socket.handshake.auth.usrFirstname,
					});
			}
		});

		return 'OK';
	} catch (error) {
		console.error(error);
		return { error: 'Erreur de destination' };
	}
}

const returnMessageToUser = async (ioData) =>  {
	const limit = parseInt(ioData.limit) || 20;
	const page = parseInt(ioData.page) || 1;
	const offset = (page - 1) * limit;
	const senderCode = ioData.usrCode;
	const destinationCode = ioData.destCodeListe[0].destCode;
	const destIsDeleted = ioData.isDeleted || false;

	try {
		const { count, rows }=  await models.Destination.findAndCountAll({
			where: {
				[Op.and]: [
					{
						[Op.or]: [
							{
								destSenderCode: destinationCode,
								usrCode: senderCode,
							},
							{
								destSenderCode: senderCode,
								usrCode: destinationCode,
							},
						],
					},
					{
						destIsDeleted: destIsDeleted,
					},
				],
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
				{
					as: 'msgCodeMessage',
					model: models.Messages,
					attributes: [
						'msg_code',
						'usr_code',
						'msg_contenu',
						'msg_created_date',
						'msg_modif_date',
					],
					include: [
						{
							model: models.MsgFileJoint,
							as: 'msgFileJoints', // doit correspondre à l'alias défini dans l'association
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
			],
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
		})

		const nbPage = Math.ceil(parseInt(count) / limit);

		const message = `Voici les messages (${count}) pour l'id source ${senderCode} et l'id destinataire =  ${destinationCode}. page ${page}/${nbPage}`;

		return {
			page: page,
			nbPage: nbPage,
			message: message,
			data: rows,
		};

		
	} catch (error) {
		const messageError = `Serveur error`;
		console.log(error);
		return { error: messageError, detail: error };
	}
};

