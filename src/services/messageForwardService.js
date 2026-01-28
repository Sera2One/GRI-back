// src/services/messageForwardService.js
import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';
import { getPreciseGMTTime } from './timeSync.js';
import { generateId } from './generateId.js';

const models = initModels(sequelize);

/**
 * Service unifié de transfert de message (P2P ou Groupe → P2P ou Groupe)
 * @param {Object} options
 * @param {string} options.sourceCode (msg_code ou gumes_code)
 * @param {string} options.forwarderUsrCode (usrCode de celui qui fait l'action)
 * @param {'p2p'|'group'} options.destinationType
 * @param {string|Array} options.destinationListCode
 *        - si 'p2p' → [{ destCode: 'usr-123' }, ...]
 *        - si 'group' → 'gun-456'
 */
export async function forwardMessage({
	sourceCode,
	forwarderUsrCode,
	destinationType,
	destinationListCode,
}) {
	const transaction = await sequelize.transaction();
	try {
		// 1. Récupérer le message source
		const sourceTypeIsGroupe = sourceCode.includes('gu-message');
		const source = await fetchSourceMessage(
			sourceTypeIsGroupe,
			sourceCode,
			transaction,
		);
		console.log('sourceTypeIsGroupe', sourceTypeIsGroupe);
		
		if (!source) {
			throw new Error('Message source introuvable');
		}

		// 2. Générer nouvel ID
		const newId =
			destinationType === 'p2p'
				? await generateNewP2PMessageCode()
				: await generateId('GroupeUserMessage');

		const now = getPreciseGMTTime().iso;

		// 3. Préparer les métadonnées de fichiers
		const files = extractFiles(source, sourceTypeIsGroupe);

		// 4. Sauvegarder selon la destination
		if (destinationType === 'p2p') {
			await saveAsP2P({
				newId,
				forwarderUsrCode,
				content: getContent(source, sourceTypeIsGroupe),
				originalUsrCode: getOriginalUsrCode(source, sourceTypeIsGroupe),
				originalId: sourceCode,
				files,
				destinations: destinationListCode,
				createdAt: now,
				transaction,
			});
		} else {
			await saveAsGroup({
				newId,
				forwarderUsrCode,
				groupId: destinationListCode,
				content: getContent(source, sourceTypeIsGroupe),
				originalUsrCode: getOriginalUsrCode(source, sourceTypeIsGroupe),
				originalId: sourceCode,
				files,
				createdAt: now,
				transaction,
			});
		}

		await transaction.commit();
		return { success: true, newId };
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

// --- Helpers internes ---

async function fetchSourceMessage(sourceTypeIsGroupe, sourceCode, transaction) {
	if (sourceTypeIsGroupe) {
		return await models.GroupeUserMessage.findByPk(sourceCode, {
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
	} else {
		return await models.Messages.findByPk(sourceCode, {
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
	}
}

async function generateNewP2PMessageCode() {
	const lastMessages = await models.Messages.findAll({
		order: [['msg_created_date', 'DESC']],
		attributes: ['msgCode'],
		raw: true,
		limit: 10,
	});

	const lastMsgCode =
		lastMessages.length === 0
			? 0
			: Math.max(
					...lastMessages.map(msg => parseInt(msg.msgCode.match(/\d+/g))),
			  );

	return `msg-${lastMsgCode + 1}`;
}

function getContent(source, sourceTypeIsGroupe) {
	return sourceTypeIsGroupe ? source.gumesContent : source.msgContenu;
}

function getOriginalUsrCode(source, type) {
	return source.usrCode;
}

function extractFiles(source, sourceTypeIsGroupe) {
	return sourceTypeIsGroupe
		? source.groupeUserFiles || []
		: source.msgFileJoints || [];
}

async function saveAsP2P({
	newId,
	forwarderUsrCode,
	content,
	originalUsrCode,
	originalId,
	files,
	destinations,
	createdAt,
	transaction,
}) {
	// Message
	await models.Messages.create(
		{
			msgCode: newId,
			usrCode: forwarderUsrCode,
			msgContenu: content,
			msgCreated_date: createdAt,
			msgForwardedFrom: originalId,
			msgForwardedFromUser: originalUsrCode,
			msgHasPieceJoint: files.length > 0,
		},
		{ transaction },
	);

	// Destinations
	const destData = destinations.map(d => ({
		msgCode: newId,
		usrCode: d.destCode,
		destSenderCode: forwarderUsrCode,
		destIsReaded: false,
		destIsDeleted: false,
		destCreatedDate: createdAt,
	}));
	await models.Destination.bulkCreate(destData, { transaction });

	// Fichiers
	if (files.length > 0) {
		const fileData = files.map((f, i) => ({
			msgFileCode: `${newId}-${i}`,
			usrCode: forwarderUsrCode,
			msgCode: newId,
			msgFilePath: f.msg_file_path || f.guf_path,
			msgFileType: f.msg_file_type || f.guf_type,
			msgFileClientFileName: f.msg_file_client_file_name || f.guf_name,
			msgFileSize: f.msg_file_size || f.guf_size,
			msgFileIsDeleted: false,
			msgFileCreatedDate: createdAt,
		}));
		await models.MsgFileJoint.bulkCreate(fileData, { transaction });
	}
}

async function saveAsGroup({
	newId,
	forwarderUsrCode,
	groupId,
	content,
	originalUsrCode,
	originalId,
	files,
	createdAt,
	transaction,
}) {

	console.log('originalId', originalId);
	console.log('originalUsrCode', originalUsrCode);
	
	
	// Message groupe
	await models.GroupeUserMessage.create(
		{
			gumesCode: newId,
			gunCode: groupId,
			usrCode: forwarderUsrCode,
			gumesContent: content,
			gumesCreatedDate: createdAt,
			gumesForwardedFrom: originalId,
			gumesForwardedFromUser: originalUsrCode,
		},
		{ transaction },
	);

	// Fichiers groupe
	if (files.length > 0) {
		const fileData = files.map((f, i) => ({
			gufCode: `${newId}-${i}`,
			gumesCode: newId,
			gunCode: groupId,
			usrCode: forwarderUsrCode,
			gufPath: f.msg_file_path || f.guf_path,
			gufType: f.msg_file_type || f.guf_type,
			gufName: f.msg_file_client_file_name || f.guf_name,
			gufSize: f.msg_file_size || f.guf_size,
			gufIsDeleted: false,
			gufCreatedDate: createdAt,
		}));
		await models.GroupeUserFiles.bulkCreate(fileData, { transaction });
	}
}
