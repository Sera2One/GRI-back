// services/messageForwardService.js
import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';
import { getPreciseGMTTime } from './timeSync.js';
import { generateId } from './generateId.js';
import path from 'path';
import fs from 'fs/promises';

const models = initModels(sequelize);
const publicFolder = process.env.APP_PUBLIC_FOLDER;

/**
 * Transfère un message (P2P ou groupe) vers une destination (P2P ou groupe)
 * @param {Object} options
 * @param {string} options.sourceType - 'p2p' | 'group'
 * @param {string} options.sourceId - msg_code ou gumes_code
 * @param {string} options.forwarderUsrCode - qui transfère
 * @param {string} options.destinationType - 'p2p' | 'group'
 * @param {string|Array} options.destinationId - usr_code(s) ou gun_code
 */
export async function forwardMessage({
	sourceType,
	sourceId,
	forwarderUsrCode,
	destinationType,
	destinationId, // string (groupe) ou array de { destCode } (P2P)
}) {
	const transaction = await sequelize.transaction();
	try {
		// 1. Récupérer le message source
		const sourceData = await fetchSourceMessage(
			sourceType,
			sourceId,
			transaction,
		);
		if (!sourceData) throw new Error('Message source introuvable');

		// 2. Générer un nouvel ID
		const newId =
			destinationType === 'p2p'
				? await generateMessageCodeP2P()
				: await generateId('GroupeUserMessage');

		const now = getPreciseGMTTime().iso;

		// 3. Préparer les données du nouveau message
		const newMessageData = buildNewMessageData({
			sourceData,
			newId,
			forwarderUsrCode,
			sourceType,
			now,
		});

		// 4. Sauvegarder le nouveau message
		if (destinationType === 'p2p') {
			await saveForwardedP2PMessage(newMessageData, destinationId, transaction);
		} else {
			await saveForwardedGroupMessage(
				newMessageData,
				destinationId,
				transaction,
			);
		}

		await transaction.commit();
		return { success: true, ...newMessageData };
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

// --- Fonctions internes ---

async function fetchSourceMessage(type, id, transaction) {
	if (type === 'p2p') {
		return await models.Messages.findByPk(id, {
			include: [
				{
					model: models.MsgFileJoint,
					as: 'msgFileJoints',
					where: { msgFileIsDeleted: false },
					required: false,
				},
			],
			transaction,
		});
	} else {
		return await models.GroupeUserMessage.findByPk(id, {
			include: [
				{
					model: models.GroupeUserFiles,
					as: 'groupeUserFiles',
					where: { gufIsDeleted: false },
					required: false,
				},
			],
			transaction,
		});
	}
}

async function generateMessageCodeP2P() {
	const lastMsg = await models.Messages.findOne({
		order: [['msg_created_date', 'DESC']],
		attributes: ['msgCode'],
		raw: true,
	});
	const lastNum = lastMsg ? parseInt(lastMsg.msgCode.split('-').pop()) : 0;
	return `msg-${lastNum + 1}`;
}

function buildNewMessageData({
	sourceData,
	newId,
	forwarderUsrCode,
	sourceType,
	now,
}) {
	const isP2PSource = sourceType === 'p2p';
	const content = isP2PSource
		? sourceData.msg_contenu
		: sourceData.gumes_content;
	const originalUsrCode = isP2PSource ? sourceData.usrCode : sourceData.usrCode;
	const originalId = isP2PSource ? sourceData.msgCode : sourceData.gumesCode;
	const files = isP2PSource
		? sourceData.msgFileJoints
		: sourceData.groupeUserFiles;

	return {
		id: newId,
		content,
		forwarderUsrCode,
		originalUsrCode,
		originalId,
		files,
		createdAt: now,
	};
}

async function saveForwardedP2PMessage(data, destCodeListe, transaction) {
	// Message P2P
	await models.Messages.create(
		{
			msgCode: data.id,
			usrCode: data.forwarderUsrCode,
			msg_contenu: data.content,
			msg_created_date: data.createdAt,
			msg_forwarded_from: data.originalId,
			msg_forwarded_from_user: data.originalUsrCode,
			msg_has_piece_joint: data.files?.length > 0,
		},
		{ transaction },
	);

	// Destinations
	const destinations = destCodeListe.map(d => ({
		msgCode: data.id,
		usrCode: d.destCode,
		destSenderCode: data.forwarderUsrCode,
		destCreatedDate: data.createdAt,
	}));
	await models.Destination.bulkCreate(destinations, { transaction });

	// Fichiers (copie métadonnées)
	if (data.files?.length) {
		const fileMetadata = data.files.map((f, i) => ({
			msgFileCode: `${data.id}-${i}`,
			usrCode: data.forwarderUsrCode,
			msgCode: data.id,
			msgFilePath: f.msg_file_path || f.guf_path,
			msgFileType: f.msg_file_type || f.guf_type,
			msgFileClientFileName: f.msg_file_client_file_name || f.guf_name,
			msgFileSize: f.msg_file_size || f.guf_size,
			msgFileIsDeleted: false,
			msgFileCreatedDate: data.createdAt,
		}));
		await models.MsgFileJoint.bulkCreate(fileMetadata, { transaction });
	}
}

async function saveForwardedGroupMessage(data, groupId, transaction) {
	// Message groupe
	await models.GroupeUserMessage.create(
		{
			gumesCode: data.id,
			gunCode: groupId,
			usrCode: data.forwarderUsrCode,
			gumesContent: data.content,
			gumesCreatedDate: data.createdAt,
			gumes_forwarded_from: data.originalId,
			gumes_forwarded_from_user: data.originalUsrCode,
		},
		{ transaction },
	);

	// Fichiers groupe
	if (data.files?.length) {
		const fileMetadata = data.files.map((f, i) => ({
			gufCode: `${data.id}-${i}`,
			gumesCode: data.id,
			gunCode: groupId,
			usrCode: data.forwarderUsrCode,
			gufPath: f.msg_file_path || f.guf_path,
			gufType: f.msg_file_type || f.guf_type,
			gufName: f.msg_file_client_file_name || f.guf_name,
			gufSize: f.msg_file_size || f.guf_size,
			gufIsDeleted: false,
			gufCreatedDate: data.createdAt,
		}));
		await models.GroupeUserFiles.bulkCreate(fileMetadata, { transaction });
	}
}
