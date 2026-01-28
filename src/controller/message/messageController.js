import { sequelize } from '../../db/config/database.js';
import { Op, Sequelize } from 'sequelize';
import initModels from '../../db/models/init-models.js';
import moment from 'moment';
import fs from 'node:fs';
import path from 'path';
import { generateId } from '../../services/generateId.js';
import { getPreciseGMTTime } from '../../services/timeSync.js';
import { getMessageReaction } from '../reaction/reaction.io.js';

var models = initModels(sequelize);

const publicFolder = process.env.APP_PUBLIC_FOLDER;
const tmpFolder = publicFolder + '/Message/FileJointTmp/';

export async function postMessage(req, res) {
	// Verification si toute est correcte avant le sauvegard
	const UsrCodeIsNullOrMissing = !req.body.usrCode || req.body.usrCode === null;
	const MessageIsNullOrMissing =
		!req.body.msgContenu || req.body.msgContenu === null;
	const DestinationIsNullOrMissing =
		!req.body.destCodeListe || req.body.destCodeListe === null;
	const limit = parseInt(req.query.limit) || 20;

	if (UsrCodeIsNullOrMissing) {
		return res.status(400).json({ error: `Users id vide` });
	}

	if (DestinationIsNullOrMissing) {
		return res
			.status(400)
			.json({ error: `La dest_code (destination) ne peut pas être vide` });
	}

	if (MessageIsNullOrMissing) {
		return res.status(400).json({ error: `Le message ne peut pas être vide` });
	}


	const msgCode = generateId('Messages');
	const msgCreatedDate = getPreciseGMTTime().iso;
	const msgContenu = req.body.msgContenu;
	const destCodeListe = req.body.destCodeListe;
	const msgPieceJoint = req.body.msgPieceJoint || null;
	const usrCode = req.body.usrCode;

	const msgToSave = {
		msgCode: msgCode,
		usrCode: usrCode,
		msgContenu: msgContenu,
		msgPieceJoint: msgPieceJoint,
		msgCreatedDate: msgCreatedDate,
		msgIsDeleted: false,
		msgModifDate: null,
	};

	const findUserMissing = [];
	let errorMissingDestination = false;
	for (const dest of destCodeListe) {
		if (!dest.destCode) {
			errorMissingDestination = true;
		}
		const user = await models.Users.findByPk(dest.destCode);
		if (!user) {
			findUserMissing.push(dest.destCode);
		}
	}

	if (errorMissingDestination) {
		const messageError = 'Attention, destCode absent dans destCodeListe ';
		res
			.status(400)
			.json({ error: messageError, destCodeListe: findUserMissing });
		return;
	}

	if (findUserMissing.length > 0) {
		const messageError =
			"Les utilisateur suivant n'existe pas dans la base de donnée";
		res
			.status(400)
			.json({ error: messageError, destCodeListe: findUserMissing });
		return;
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
			const resulte = await models.Destination.create(dest);
			saveStatus.push(resulte);
		}

		res.json({ message, newMessage: newMessage, saveStatus: saveStatus });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur de destination' });
	}
}

export async function updateMessage(req, res) {
	const UsrCodeIsNullOrMissing = !req.body.usrCode || req.body.usrCode === null;
	const MesCodeIsNullOrMissing = !req.body.msgCode || req.body.msgCode === null;
	const id = req.params.id;
	const is_msgCode_match_to_url = req.body.msgCode != id;

	if (UsrCodeIsNullOrMissing) {
		return res.status(400).json({ error: `usrCode vide` });
	}

	if (MesCodeIsNullOrMissing) {
		return res.status(400).json({ error: `msgCode vide` });
	}

	if (is_msgCode_match_to_url) {
		const message = `Formulaire invalid: le msgCode ne correspont pas à l'URL `;
		return res.status(404).json({ message });
	}

	const oldMessage = await models.Messages.findByPk(id);
	if (!oldMessage) {
		const message = ` Le msgCode démendé n'exist pas `;
		return res.status(404).json({ message });
	}

	if (oldMessage.usrCode !== req.body.usrCode) {
		const message = ` Le msgCode entrée n'appartient pas à l'usrCode entrée `;
		return res.status(404).json({ message });
	}

	const msgCode = req.body.msgCode;
	const msgModifDate = getPreciseGMTTime().iso;
	const msgContenu = req.body.msgContenu || oldMessage.msgContenu;
	const msgIsDeleted = req.body.msgIsDeleted || false;
	const msgPieceJoint = req.body.msgPieceJoint || oldMessage.msgPieceJoint;
	const usrCode = req.body.usrCode;
	let oldMessageObj = [];

	//insert history to msgModif
	if (oldMessage.msgModif === null || oldMessage.msgModif === '') {
		oldMessageObj.push({
			msgContenu: oldMessage.msgContenu,
			msgPieceJoint: msgPieceJoint,
			msgModifDate: msgModifDate,
		});
	} else {
		oldMessageObj = JSON.parse(oldMessage.msgModif) || '{}';
		oldMessageObj.push({
			msgContenu: oldMessage.msgContenu,
			msgPieceJoint: msgPieceJoint,
			msgModifDate: msgModifDate,
		});
	}

	const msgToSave = {
		msgCode: msgCode,
		usrCode: usrCode,
		msgContenu: msgContenu,
		msgPieceJoint: msgPieceJoint,
		msgIsDeleted: msgIsDeleted,
		msgModif: JSON.stringify(oldMessageObj),
		msgModifDate: msgModifDate,
	};

	try {
		await models.Destination.update(
			{ destIsDeleted: msgIsDeleted },
			{
				where: { msgCode: msgCode },
			},
		);
		await models.Messages.update(msgToSave, {
			where: { msgCode: msgCode },
		})
			.then(async _ => {
				const newMessage = await models.Messages.findByPk(req.body.msgCode);
				const message = `Edition message éffectue avec succès.`;
				res.json({ message, newMessage: newMessage });
			})
			.catch(error => {
				const message = `Edition message éffectue avec succès.`;
				res.status(400).json({ message: message, error });
			});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
}

/************************************************************************
 **************** search and get Messages ******************************
 ************************************************************************/

export async function getMessage(req, res) {
	const {
		sender_code: senderCode,
		destination_code: destinationCode,
		limit = 20,
		page = 1,
	} = req.query;

	const offset = (page - 1) * limit;
	const data = [];

	if (!senderCode) {
		const errormsg = 'SenderCode absent';
		return res.status(400).json({ error: errormsg });
	}

	const isSenderExistInDB = await models.Users.findByPk(senderCode);
	const isDestinationExistInDB = await models.Users.findByPk(destinationCode);

	if (!isSenderExistInDB) {
		return res
			.status(400)
			.json({ error: "Ce sender_code n'exist pas dans la base de donnée" });
	}

	if (destinationCode) {
		if (!isDestinationExistInDB) {
			return res.status(400).json({
				error: "Ce destination_code n'exist pas dans la base de donnée",
			});
		}
	}

	if (destinationCode) {
		await models.Destination.findAndCountAll({
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
				],
			},
			include: await getMessageIncludeOptions(),
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
		}).then(async ({ count, rows }) => {
			const nbPage = Math.ceil(parseInt(count) / limit);
			const msgParentCodeList = rows
				.map(el => el.get({ plain: true }))
				.map(msg => msg.msgCodeMessage.msg_parent_code)
				.filter(Boolean);

			console.log('msgParentCodeList', msgParentCodeList);

			data.message = `Voici les messages (${count}) pour l'id source ${senderCode} et l'id destinataire =  ${destinationCode}. page ${page}/${nbPage}`;
			data.rows = rows;
			data.page = page;
			data.nbPage = nbPage;
			data.msgParenList = await getMessageParent(msgParentCodeList);
		});

		// Marque les message comme lut
		//await markAsReaded(destinationCode, senderCode);
	}

	if (!destinationCode) {
		const uniqueDestCode = {};
		const uniqueSenderCode = {};
		let messageUser = {};
		let lastMessageCodePerUser = {};

		messageUser = await models.Destination.findAndCountAll({
			where: {
				[Op.or]: { destSenderCode: senderCode, usrCode: senderCode },
			},
			raw: true,
			order: ['dest_created_date'],
			limit: 1000,
			attributes: [
				'msg_code',
				'msg_code',
				['usr_code', 'dest_code'],
				['dest_sender_code', 'sender_code'],
			],
		});

		for (const msg of messageUser.rows) {
			uniqueDestCode[msg.dest_code] = msg;
			uniqueSenderCode[msg.sender_code] = msg;
		}

		if (uniqueSenderCode[senderCode]) {
			delete uniqueSenderCode[senderCode];
		}

		if (uniqueDestCode[senderCode]) {
			delete uniqueDestCode[senderCode];
		}

		const lastMessagePerUser = Object.values(uniqueDestCode).concat(
			Object.values(uniqueSenderCode),
		) || ['null'];

		lastMessageCodePerUser = lastMessagePerUser.map(msg => {
			return msg.msg_code;
		});

		await models.Destination.findAndCountAll({
			where: {
				msgCode: {
					[Op.or]: lastMessageCodePerUser,
				},
			},
			include: await getMessageIncludeOptions(),
			limit: limit,
			offset: offset,
			order: ['dest_created_date'],
			attributes: [
				'msg_code',
				'msg_code',
				['usr_code', 'dest_code'],
				['dest_sender_code', 'sender_code'],
				'dest_is_readed',
				'dest_is_deleted',
				'dest_created_date',
				'dest_modif_date',
			],
		})
			.then(({ count, rows }) => {
				const nbPage = Math.ceil(parseInt(count) / limit);
				data.message = `Il y a ${count} message l'id utilisateur source = ${senderCode}.  Page ${page}/${nbPage}`;
				data.rows = rows;
				data.page = page;
				data.nbPage = nbPage;
				console.log('count', count);
			})
			.catch(error => {
				data.error = error;
			});
	}

	try {
		data.unReadMessage = Object.values(
			data.rows
				?.map(el => el.get({ plain: true }))
				.filter(row => row.destIsReaded === false)
				.reduce((accumulator, msg) => {
					const usrName = msg.usrCodeUser.usr_name;
					const usrFirstname = msg.usrCodeUser.usr_firstname;
					const usrCode = msg.dest_code;
					const usrImg = msg.usrCodeUser.usr_img;

					var a = [];
					if (accumulator[usrCode] === undefined) {
						a[usrCode] = 1;
					} else {
						a[usrCode] = accumulator[usrCode].messageNoLu + 1;
					}
					accumulator[usrCode] = {
						messageNoLu: a[usrCode],
						usrCode: usrCode,
						usrName: usrName,
						usrFirstname: usrFirstname,
						usrImg: usrImg,
					};
					return accumulator;
				}, {}),
		);

		data.userListe = Object.values(
			data.rows
				?.map(el => el.get({ plain: true }))
				.reduce((accumulator, msg) => {
					const usrName = msg.usrCodeUser.usr_name;
					const usrFirstname = msg.usrCodeUser.usr_firstname;
					const usrCode = msg.dest_code;
					const usrImg = msg.usrCodeUser.usr_img;
					var a = [];
					if (accumulator[usrCode] === undefined) {
						a[usrCode] = 1;
					} else {
						a[usrCode] = accumulator[usrCode].messageNoLu + 1;
					}
					accumulator[usrCode] = {
						usrCode: usrCode,
						usrName: usrName,
						usrFirstname: usrFirstname,
						usrImg: usrImg,
					};
					return accumulator;
				}, {}),
		);

		const msgCodeList = data.rows.map(msg => msg.msgCode);
		const { reactions, reactionCounts } = await getMessageReaction({msgCodeList: msgCodeList});
		data.reactions = reactions;
		data.reactionCounts = reactionCounts;
	} catch (error) {
		const message = `Serveur error`;
		console.log(error);
		return res.status(500).json({ message: message, error: error });
	}
	if (data.message) {
		return res.json({
			messageNonLu: data.messageNonLu,
			page: data.page,
			nbPage: data.nbPage,
			message: data.message,
			userListe: data.userListe,
			messageParentList: data.msgParenList || [],
			unReadMessage: data.unReadMessage,
			data: data.rows || [],
			reactions: data.reactions || [],
		 	reactionCounts :data.reactionCounts || 0,
		});
	}
	const message = `Parametre manquante`;
	return res.status(500).json({ message: message, error: data.error });
}

export const deleteMessage = async (req, res) => {
	console.log('okksk');
	const id = req.params.id;
	const usrCode = req.params.usrCode;
	models.Messages.findByPk(id).then(async message => {
		if (message === null) {
			const message = `Le message demandé n'existe pas.`;
			return res.status(404).json({ message });
		}

		if (message.usrCode !== usrCode) {
			const message = `Le message demandé n'existe pas.`;
			return res.status(400).json({ message });
		}
		models.Destination.update(
			{ destIsDeleted: true },
			{ where: { msgCode: id } },
		).catch(err => {
			// Nothing to do;
		});
		models.Messages.update({ msgIsDeleted: true }, { where: { msgCode: id } })
			.then(async _ => {
				const message = `Le message est supprimé.`;
				res.json({ message });
			})
			.catch(err => {
				try {
					const message = `Le message n'a pas pu être supprimé.`;
					res.status(500).json({ message, data: err.parent.detail });
				} catch (higth_err) {
					const message = `Serveur error.`;
					res.status(500).json({ message, data: higth_err });
				}
			});
	});
};

export const AddFileTmpMsg = async (req, res) => {
	if (!req.body.usrCode) {
		return res.json({ message: 'Aucun utilisateur associé' });
	}

	const tmpPath = req.file.path;
	const fileExtension = req.file.originalname.split('.')[1];
	const newFileName = `${moment().format(
		'YYYY-MM-DD_HH-mm-ss',
	)}.${fileExtension}`;
	const newPath = path.join(tmpFolder, req.body.usrCode, newFileName);
	const folderName = path.join(tmpFolder, req.body.usrCode);

	try {
		if (!fs.existsSync(folderName)) {
			fs.mkdirSync(folderName, { recursive: true });
		}

		fs.renameSync(tmpPath, newPath, err => {
			if (err) {
				console.error(err);
				return res
					.status(500)
					.json({ message: 'Erreur lors du déplacement du fichier' });
			}
		});

		return res.json({ message: 'Fichier téléchargé avec succès' });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ message: 'Erreur lors de la création du dossier' });
	}
};

export const getAllFilesTmpMsg = async (req, res) => {
	if (!req.query.usrCode) {
		return res.json({ message: 'Aucun utilisateur associé' });
	}

	const folderName = path.join(tmpFolder, req.query.usrCode);

	try {
		if (!fs.existsSync(folderName)) {
			fs.mkdirSync(folderName, { recursive: true });
		}
		const filesInFolder = fs.readdirSync(folderName);
		return res.json({ message: 'Fichier sur le serveur', filesInFolder });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ message: 'Erreur lors de la création du dossier' });
	}
};

export const deleteFilesTmpMsg = async (req, res) => {
	if (!req.query.usrCode) {
		return res.json({ message: 'Aucun utilisateur associé' });
	}

	if (!req.query.fileToDelete && !req.query.deleteAll) {
		return res.json({
			message: 'Nom du fichier à supprimer ou deleteAll requis',
		});
	}

	const folderName = path.join(tmpFolder, req.query.usrCode);
	const fileToDelete = req.query.fileToDelete;
	const fileToDeletePath = path.join(folderName, fileToDelete);
	const deleteAll = req.query.deleteAll || false;
	let noError = true;

	try {
		if (!fs.existsSync(folderName)) {
			fs.mkdirSync(folderName, { recursive: true });
		}

		if (fileToDelete) {
			await fs.promises.unlink(fileToDeletePath);
			console.log('File deleted:', fileToDelete);
		} else if (deleteAll) {
			const files = await fs.promises.readdir(folderName);
			await Promise.all(
				files.map(async fileName => {
					await fs.promises.unlink(path.join(folderName, fileName));
					console.log('File deleted:', fileName);
				}),
			);
		}
	} catch (err) {
		console.error(err);
		noError = false;
	}

	if (noError) {
		if (deleteAll) {
			return res.json({
				message: `Tout a été supprimé avec succès sur le serveur`,
			});
		}
		return res.json({ message: `${fileToDelete} a été supprimé` });
	} else {
		return res.status(500).json({ message: 'Erreur lors de la suppression' });
	}
};

/************************************************************************
 ****************    fonction utilitaire   ******************************
 ************************************************************************/
async function getMessageIncludeOptions() {
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
				'msg_forwarded_from',
				'msg_forwarded_from_user',
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
				{
					model: models.Users,
					as: 'msgForwardedFromUserUser',
					required: false,
					attributes: ['usr_code', 'usr_img', 'usr_name', 'usr_firstname'],
				},
			],
		},
	];
}

async function getMessageParent(msgParentCodeList) {
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

async function markAsReaded(destinationCode, senderCode) {
	await models.Destination.update(
		{ destIsReaded: true },
		{
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
				],
			},
		},
	);
}

async function deleteOrphanedFile(msgFileCode) {
	const transaction = await sequelize.transaction();
	try {
		// 1. Récupérer le fichier
		const file = await models.MsgFileJoint.findByPk(msgFileCode);
		if (!file || file.msgFileIsDeleted) {
			await transaction.rollback();
			return; // déjà supprimé ou introuvable
		}

		// 2. Marquer comme supprimé
		await file.update(
			{ msgFileIsDeleted: true, msgFileDeletedDate: getPreciseGMTTime().iso },
			{ transaction },
		);

		// 3. Vérifier s’il est encore référencé par un message non supprimé
		const activeReferences = await models.MsgFileJoint.count({
			where: {
				msgFilePath: file.msgFilePath,
				msgFileIsDeleted: false,
			},
		});

		if (activeReferences === 0) {
			// 4. Supprimer le fichier physique
			const fullPath = path.join(process.cwd(), file.msgFilePath);
			try {
				await fs.promises.access(fullPath);
				await fs.promises.unlink(fullPath);
				console.log('Fichier orphelin supprimé:', file.msgFilePath);
			} catch (err) {
				console.warn(
					'Fichier introuvable lors de la suppression:',
					file.msgFilePath,
				);
			}
		}

		await transaction.commit();
	} catch (error) {
		await transaction.rollback();
		console.error('Erreur suppression fichier orphelin:', error);
	}
}
