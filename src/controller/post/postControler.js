import { sequelize } from '../../db/config/database.js';
import { Op, where } from 'sequelize';
import '../../services/env.js';
import moment from 'moment';
import initModels from '../../db/models/init-models.js';
import Users from '../../db/models/users.js';
import fs from 'node:fs';
import path from 'path';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { saveFileCreate } from './saveFileCreate.js';
import { saveFileEdit } from './saveFileEdit.js';
import { BackupDeleteFiles } from './BackupDeleteFiles.js';
import { sanitizeFileName } from '../../services/sanitizeFileName.js';
import { generateUniqueFileName } from '../../services/generateUniqueFileName.js';
import { generateId } from '../../services/generateId.js';
import generateThumbnail from '../../services/generateThumbnail.js';
import { getPreciseGMTTime } from '../../services/timeSync.js';

const models = initModels(sequelize);
const publicFolder = process.env.APP_PUBLIC_FOLDER;
const tmpFolder = publicFolder + '/tmp';
const postFolderName = '/Post';
const backupFolderName = '/Post/backup_deleted_files_post';
const postFolderPath = publicFolder + postFolderName;
const backupFolderPath = publicFolder + backupFolderName;
const thumbnailFolderName = 'Thumbs';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/************************************************************************
 **************** Create Post ******************************
 ************************************************************************/
export const postPost = async (req, res) => {
	console.log('body', req.body);
	const { postTitle, postDescription, usrCode } = req.body;
	const transaction = await sequelize.transaction();

	if (!postTitle) {
		return res.status(500).json({ error: `Aucun titre` });
	}

	if (!postDescription) {
		return res.status(500).json({ error: `Aucun description` });
	}

	if (!usrCode) {
		return res.status(500).json({ error: `Aucun utilisateur associé` });
	}

	try {
		const post_is_exist = await models.Post.findOne({
			where: { postTitle },
			transaction,
		});
		if (post_is_exist) {
			return res
				.status(400)
				.json({ error: `Le titre de Votre post existe déjà` });
		}

		const postCode = await generateId('Post');
		// 🔒 NETTOYER le HTML avant sauvegarde
		const safeDescription = DOMPurify.sanitize(postDescription, {
			ALLOWED_TAGS: [
				'p',
				'br',
				'strong',
				'em',
				'u',
				'h1',
				'h2',
				'h3',
				'ul',
				'ol',
				'li',
				'a',
				'img',
			],
			ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
			ALLOW_DATA_ATTR: false,
		});

		const savePostData = {
			postCode: postCode,
			usrCode: usrCode,
			postTitle: postTitle,
			postDescription: safeDescription,
			postCreatedDate: getPreciseGMTTime().iso,
			postIsValided: false,
			postIsDeleted: false,
		};

		// Create a new post
		console.log('savePostData', savePostData);
		const newpost = await models.Post.create(savePostData, { transaction });

		const filesToSave = await mouveTmptopostFolderPath({
			usrCode: usrCode,
			postCode: postCode,
		});

		if (filesToSave) {
			await models.PostFileJoint.bulkCreate(filesToSave, { transaction });
		}

		await transaction.commit();
		await cleanupTmpUserFolder(usrCode);

		const message = `Création post éffectue avec succès.`;
		res.json({ message, post: newpost });
	} catch (error) {
		console.error(error);
		await transaction.rollback();
		res.status(500).json({ error: 'Erreur serveur' });
	}
};

/************************************************************************
 **************** search and get all Post ******************************
 ************************************************************************/

const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1);

const sanitizeInput = text => {
	return text
		.replace(/[<>]/g, '') // Supprimer les balises HTML
		.trim()
		.substring(0, 100); // Limiter la longueur
};

// ===== POST CONTROLLER avec intervalle de dates =====
export const getPost = async (req, res) => {
	const limit = parseInt(req.query.limit) || 20;
	const page = parseInt(req.query.page) || 1;
	const order = (req.query.order || 'DESC').toUpperCase();
	const texte = sanitizeInput(req.query.texte || '');
	const dateFrom = req.query.dateFrom; // Format: YYYY-MM-DD
	const dateTo = req.query.dateTo;     // Format: YYYY-MM-DD
	const offset = (page - 1) * limit;
	
	// Validation de l'ordre
	if (order !== 'ASC' && order !== 'DESC') {
		return res.status(400).json({ 
			message: 'Ordre de tri incorrect. Utilisez ASC ou DESC.' 
		});
	}

	try {
		let whereCondition = {};

		// Filtre de recherche texte
		if (texte) {
			if (texte.length < 3) {
				const message = `Le terme de recherche doit contenir au minimum 3 caractères.`;
				return res.status(400).json({ message });
			}

			whereCondition[Op.or] = [
				{
					postTitle: {
						[Op.or]: [
							{ [Op.like]: `%${texte}%` },
							{ [Op.startsWith]: capitalize(texte) }
						]
					}
				},
				{
					postDescription: {
						[Op.or]: [
							{ [Op.like]: `%${texte}%` },
							{ [Op.startsWith]: capitalize(texte) }
						]
					}
				}
			];
		}

		// Filtre d'intervalle de dates
		if (dateFrom || dateTo) {
			const dateCondition = {};

			if (dateFrom && dateTo) {
				// Intervalle complet: entre dateFrom et dateTo
				const startDate = new Date(dateFrom);
				startDate.setHours(0, 0, 0, 0);
				
				const endDate = new Date(dateTo);
				endDate.setHours(23, 59, 59, 999);

				dateCondition[Op.between] = [startDate, endDate];
			} else if (dateFrom) {
				// Seulement date de début: à partir de dateFrom
				const startDate = new Date(dateFrom);
				startDate.setHours(0, 0, 0, 0);
				dateCondition[Op.gte] = startDate;
			} else if (dateTo) {
				// Seulement date de fin: jusqu'à dateTo
				const endDate = new Date(dateTo);
				endDate.setHours(23, 59, 59, 999);
				dateCondition[Op.lte] = endDate;
			}

			whereCondition.post_created_date = dateCondition;
		}

		// Requête principale
		const { count, rows } = await models.Post.findAndCountAll({
			where: whereCondition,
			include: [
				{
					as: 'usrCodeUser',
					model: Users,
					attributes: [
						'usr_code',
						'usr_name',
						'usr_firstname',
						'usr_mail',
						'usr_img',
					],
				},
				{
					as: 'postFileJoints',
					model: models.PostFileJoint,
				},
			],
			order: [['post_created_date', order]],
			limit: limit,
			offset: offset,
			distinct: true,
		});

		const nbPage = Math.ceil(parseInt(count) / limit);

		console.log('nbPage', nbPage, 'count', count, 'limit', limit);

		// Si recherche texte, retourner directement
		if (texte) {
			const message = `Il y a ${count} résultat(s) qui correspondent au terme de recherche "${texte}".`;
			return res.json({
				message,
				data: rows,
				page: page,
				nbPage: nbPage,
				filters: { texte, dateFrom, dateTo, order }
			});
		}

		// Ajouter le nombre de commentaires pour chaque post
		const postList = rows.map(element => element.postCode);

		const commentCounts = await models.Comment.findAll({
			where: {
				postCode: {
					[Op.in]: postList,
				},
			},
			attributes: [
				'post_code',
				[sequelize.fn('COUNT', sequelize.col('post_code')), 'commentCount'],
			],
			group: ['post_code'],
			raw: true,
		});

		const postsWithCommentCount = rows.map(post => {
			const commentData = commentCounts.find(
				c => c.post_code === post.postCode,
			);
			const commentCount = commentData ? parseInt(commentData.commentCount) : 0;
			post.setDataValue('commentCounts', commentCount);
			return post;
		});

		const message = 'La liste des Post a bien été récupérée.';
		return res.json({
			message,
			data: postsWithCommentCount,
			page: page,
			nbPage: nbPage,
			filters: { dateFrom, dateTo, order }
		});
	} catch (error) {
		const message = `HTTP 500 Internal Server Error.`;
		console.error('Error in getPost:', error);
		res.status(500).json({ message, error: error.message });
	}
};


// ===== FONCTION UTILITAIRE pour valider les dates =====
export const validateDateRange = (dateFrom, dateTo) => {
	if (!dateFrom && !dateTo) {
		return { valid: true };
	}

	const errors = [];

	// Valider le format des dates
	if (dateFrom && isNaN(Date.parse(dateFrom))) {
		errors.push('Format de date de début invalide. Utilisez YYYY-MM-DD.');
	}

	if (dateTo && isNaN(Date.parse(dateTo))) {
		errors.push('Format de date de fin invalide. Utilisez YYYY-MM-DD.');
	}

	// Vérifier que dateFrom est avant dateTo
	if (dateFrom && dateTo) {
		const start = new Date(dateFrom);
		const end = new Date(dateTo);
		
		if (start > end) {
			errors.push('La date de début doit être antérieure à la date de fin.');
		}
	}

	return {
		valid: errors.length === 0,
		errors: errors
	};
};

// ===== EXEMPLE D'UTILISATION dans les routes =====
/*
// routes/post.routes.js
import express from 'express';
import { getPost } from '../controllers/post.controller.js';

const router = express.Router();

// GET /api/v1/post?limit=10&page=1&order=desc&texte=test&dateFrom=2024-01-01&dateTo=2024-12-31
router.get('/post', getPost);

export default router;

// routes/user.routes.js
import express from 'express';
import { getUserList } from '../controllers/user.controller.js';

const router = express.Router();

// GET /api/v1/users?limit=10&page=1&order=asc&texte=john
router.get('/users', getUserList);

export default router;
*/


/************************************************************************
 **************** get Post by id **********************************
 ************************************************************************/
export const getPostById = async (req, res) => {
	models.Post.findByPk(req.params.id, {
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
				as: 'postFileJoints',
				model: models.PostFileJoint,
			},
		],
	})
	.then(async post => {
		if (post === null) {
			const message = `Votre post demandé n'existe pas.`;
			return res.status(404).json({ message });
		}
		const commentCounts = await models.Comment.findAll({
			where: {
				postCode: post.postCode,
			},
			attributes: [
				'post_code',
				[
					sequelize.fn('COUNT', sequelize.col('post_code')),
					'commentCount',
				],
			],
			group: ['post_code'],
			raw:true
		});

		const commentData = commentCounts.find(c => c.post_code === post.postCode);

		const commentCount = commentData ? parseInt(commentData.commentCount) : 0;

		post.setDataValue('commentCounts', commentCount);

		const message = `Votre post a bien été trouvée.`;
		res.json({ message, data: post });
	})
	.catch(error => {
		const message = `Serveur erreur`;
		res.status(500).json({ message, data: error });
	});
};

/************************************************************************
 ****************  Update Post ***********************************
 ************************************************************************/
export const updatePost = async (req, res) => {
	const id = req.params.id;

	const { postTitle, postDescription, postCode, usrCode } = req.body;
	const transaction = await sequelize.transaction();

	const is_postCode_match_to_url = postCode != id;

	var is_not_valid_input = req.body.postTitle.length <= 2;

	if (is_not_valid_input) {
		const message = `Formulaire invalid : le titre de Votre post trop petite `;
		return res.status(404).json({ message });
	}

	if (is_postCode_match_to_url) {
		const message = `Formulaire invalid: id URL et formulaire ne corresponde pas `;
		return res.status(404).json({ message });
	}

	try {
		const finded_title = await models.Post.findOne({
			where: {
				[Op.and]: {
					postTitle: postTitle,
					[Op.not]: {
						postCode: id,
					},
				},
			},
			transaction,
		});

		if (finded_title) {
			return res
				.status(400)
				.json({ error: `Le titre de Votre post existe déjà` });
		}

		const oldPost = await models.Post.findByPk(id, { raw: true });

		if (oldPost === null) {
			const message = `Le post demandée n'existe pas.`;
			return res.status(404).json({ message });
		}

		const oldFiles = await models.PostFileJoint.findAll({
			where: { postCode: postCode },
			raw: true,
			transaction,
		});

		const postModifDate = getPreciseGMTTime().iso;

		const postUpdateData = {
			usrCode: oldPost.usrCode,
			postCode: postCode,
			postTitle: postTitle,
			postDescription: postDescription,
			postModif:
				oldPost.usrCode === usrCode
					? "Modification par l'utilisateur"
					: 'Modification par administrateur',
			postModifDate: postModifDate,
		};

		const savePostHistory = {
			phmCode: await generateId('PostHistoryModif'),
			usrCode: usrCode,
			postCode: postCode,
			phmModifDescription: JSON.stringify({
				action: oldPost.usrCode === usrCode
					? "Modification par l'utilisateur"
					: 'Modification par administrateur',
				oldPost: oldPost,
				oldFiles: oldFiles,
			}),
			phmCreatedDate: postModifDate,
		};

		await models.PostHistoryModif.create(savePostHistory, { transaction });

		const pfjCodeList = await backupData({
			usrCode: usrCode,
			postCode: postCode,
		});

		const filesToSave = await mouveTmptopostFolderPath({
			usrCode: usrCode,
			postCode: postCode,
		});

		const newFiles = await getNewFileInPostUpdate(postCode, filesToSave);
		console.log('newFiles', newFiles);
		

		// Enregistrer seulement ceux qui n'ont pas de date 
		if (filesToSave && newFiles) {
			await models.PostFileJoint.bulkCreate(newFiles, { transaction });
		}

		if (pfjCodeList) {
			await models.PostFileJoint.update(
				{
					pfjIsDeleted: true,
					pfjIsDeletedBy: usrCode,
				},
				{
					where: { pfjCode: pfjCodeList },
					transaction,
				},
			);
		}

		const result = await models.Post.update(postUpdateData, {
			where: { postCode: id },
			transaction,
		});

		console.log('result', result);

		await transaction.commit();

		const isUpdated = result[0] === 1;

		await cleanupTmpUserFolder(usrCode);
		if (isUpdated) {
			return res.json({ message: `Votre post a bien été modifié.` });
		} else {
			return res.status(400).json({
				error: `Votre post n'a pas pu être modifié.`,
			});
		}
	} catch (error) {
		await transaction.rollback();
		console.error(`Votre post n'a pas pu être modifié.`, error);
		res.status(400).json({
			error: `Votre post n'a pas pu être modifié.`,
			error,
		});
	}
};

/************************************************************************
 ****************  Delete Post *****************************************
 ************************************************************************/
export const deletePost = async (req, res) => {
	const id = req.params.id;

	try {
		const post = await models.Post.findByPk(id, { raw: true });

		if (post === null) {
			const message = `Le post demandé n'existe pas.`;
			return res.status(404).json({ message });
		}

		const result = await models.Post.update(
			{
				postIsDeleted: true,
			},
			{ where: { postCode: id } },
		);

		const isUpdated = result[0] === 1;

		if (isUpdated) {
			return res.json({ message: `Votre post a bien été supprimer.` });
		} else {
			return res.status(400).json({
				message: `Votre post n'a pas pu être supprimer.`,
			});
		}
	} catch (error) {
		console.log("error", error);	
		res
			.status(500)
			.json({ message: `Le post n'a pas pu être supprimé.`, error: error });
	}
};

/************************************************************************
 ****************  Delete Restore disable enable Post ***********************************
 ************************************************************************/
export const deleteRestoreDisableEnablePost = async (req, res) => {
	const id = req.params.id;

	const { usrCode, postIsDeleted, postIsValided } = req.body;
	let message;
	let adminAction;

	try {
		const oldpost = models.Post.findByPk(id, { raw: true });
		const postModifDate = getPreciseGMTTime().iso;
		if (oldpost === null) {
			const message = `Le post demandée n'existe pas.`;
			return res.status(404).json({ message });
		}

		if (oldpost.postIsValided != postIsValided) {
			if (!postIsValided) {
				message = `Ce poste a bien été désactivé.`;
				adminAction = `Désactivation.`;
			}
			if (postIsValided) {
				message = `Ce poste a bien été activé.`;
				adminAction = `Activation.`;
			}
		}
		if (oldpost.postIsDeleted != postIsDeleted) {
			if (postIsDeleted) {
				message = `Ce poste est temporairement mise en poubelle.`;
				adminAction = `Suppression.`;
			}
			if (!postIsDeleted) {
				message = `Ce poste a bien été restoré.`;
				adminAction = `Restoration.`;
			}
		}

		const savePostHistory = {
			phmCode: await generateId('PostHistoryModif'),
			usrCode: usrCode,
			postCode: id,
			phmModifDescription: JSON.stringify({
				action: message,
				oldPost: null,
				oldFiles: null,
			}),
			phmCreatedDate: postModifDate,
		};

		await models.PostHistoryModif.create(savePostHistory);

		const result = await models.Post.update(
			{
				postIsValided: postIsValided,
				postIsDeleted: postIsDeleted,
				postModifDate: postModifDate,
			},
			{
				where: { postCode: id },
			},
		);

		const isUpdated = result[0] === 1;

		if (isUpdated) {
			return res.json({ message: `Votre post a bien été modifié.` });
		} else {
			return res.status(400).json({
				message: `Votre post n'a pas pu être modifié.`,
			});
		}
	} catch (error) {
		console.log('error', error);

		res.status(500).json({ message: `Serveur error.`, error: error });
	}
};

export const AddFileTmpPost = async (req, res) => {
	const allowedExtensions = [
		'jpg',
		'jpeg',
		'png',
		'csv',
		'doc',
		'docx',
		'pdf',
		'mp4',
		'WebM',
		'ogg',
		'mov'
	];
	const allowedMIMEType = [
		'image/png',
		'image/jpeg',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/msword',
		'text/csv',
		'application/pdf',
		'video/mp4',
		'video/webm',
		'video/ogg',
		'video/quicktime',
	];
	const maxFiles = 12;
	const { usrCode, pfjCode } = req.body;

	if (!usrCode) {
		cleanupTmpFiles(req.files);
		return res.status(400).json({ message: 'Aucun utilisateur associé' });
	}

	if (!pfjCode) {
		cleanupTmpFiles(req.files);
		return res.status(400).json({ message: 'id temporairaire absent' });
	}

	if (!req.files || req.files.length === 0 || req.files.length > maxFiles) {
		cleanupTmpFiles(req.files);
		return res.status(400).json({ message: 'Nombre de fichiers non valide' });
	}

	for (const file of req.files) {
		const fileExtension = file.originalname.split('.').pop().toLowerCase();

		if (
			!allowedMIMEType.includes(file.mimetype) ||
			!allowedExtensions.includes(fileExtension)
		) {
			cleanupTmpFiles(req.files);
			if (allowedMIMEType.includes('video')) {
				return res.status(400).json({
					message:
						'Format de fichier non supporté. Utilisez MP4, WebM, OGG ou MOV.',
				});
			} else {
				return res
					.status(400)
					.json({ message: 'Type de fichier non autorisé' });
			}
		}
	}

	const folderName = path.join(tmpFolder, usrCode);
	const fileMetadata = []; // Tableau pour stocker les métadonnées

	try {
		if (!fs.existsSync(folderName)) {
			fs.mkdirSync(folderName, { recursive: true });
		}

		console.log('req.files', req.files);

		for (const file of req.files) {
			const tmpPath = file.path;
			const fileExtension = file.originalname.split('.').pop().toLowerCase();
			const utf8Buffer = Buffer.from(file.originalname, 'binary').toString(
				'utf-8',
			); // 'binary' to UTF-8 encoded Outputs buffer
			const securedOriginalName = sanitizeFileName(utf8Buffer);
			const newFileName = `${generateUniqueFileName()}.${fileExtension}`;
			const newPath = path.join(folderName, newFileName);

			fs.renameSync(tmpPath, newPath);
			fileMetadata.push({
				postCode: null,
				pfjCode: pfjCode,
				usrCode: usrCode,
				pfjPath: newPath,
				pfjType: file.mimetype,
				pfjSize: file.size,
				pfjName: securedOriginalName,
			});
		}

		console.log('fileMetadata', fileMetadata);

		updateJsonFile(folderName, fileMetadata);

		return res.json({ message: 'Fichiers téléchargés avec succès' });
	} catch (err) {
		cleanupTmpFiles(req.files);
		console.error(err);
		return res
			.status(500)
			.json({ message: 'Erreur lors du traitement des fichiers' });
	}
};

export const getAllFilesTmpPost = async (req, res) => {
	let jsonData = [];
	let message;
	const usrCode = req.query.usrCode;
	if (!usrCode) {
		return res.json({ message: 'Aucun utilisateur associé' });
	}

	const folderName = path.join(tmpFolder, usrCode);

	try {
		if (!fs.existsSync(folderName)) {
			fs.mkdirSync(folderName, { recursive: true });
		}

		try {
			const jsonFilePath = path.join(folderName, `/info.json`);
			const data = await fs.promises.readFile(jsonFilePath, 'utf8');
			jsonData = JSON.parse(data).map(file => ({
				...file,
				pfjPath: file.pfjPath.replace(
					`${tmpFolder}/${usrCode}/`,
					`/tmp/${usrCode}/`,
				),
			}));
			message = 'Fichier sur le serveur';
		} catch (err) {
			message = 'Fichier uploadé vide';
		}

		const filesInFolder = fs.readdirSync(folderName);
		return res.json({
			message: message,
			filesInFolder: filesInFolder,
			metaData: jsonData,
		});
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ message: 'Erreur lors de la création du dossier' });
	}
};

export const deleteFilesTmpPost = async (req, res) => {
	const { pfjCode, usrCode, deleteAll } = req.query;
	console.log('log', req.query);
	
	if (!usrCode) {
		return res.status(400).json({ message: 'Aucun utilisateur associé' });
	}

	if (String(deleteAll) == 'true') {
		cleanupTmpUserFolder(usrCode);
		return res.json({ message: 'Fichier temporaire supprimer' });
	}

	if (!pfjCode) {
		return res.status(500).json({ message: 'pfjCode: absent' });
	}

	const tmpFolderPath = path.join(tmpFolder, `/${usrCode}`);
	const jsonFilePath = path.join(tmpFolderPath, 'info.json');
	let errorMessage;

	try {
		let jsonData;
		try {
			const data = await fs.promises.readFile(jsonFilePath, 'utf8');
			jsonData = JSON.parse(data);
		} catch (err) {
			errorMessage = `❌ Impossible de lire le fichier info.json pour ${usrCode}`;
			console.error(errorMessage, err);

			return res.status(400).json({ message: errorMessage, ismpty: true });
		}

		const updatedData = jsonData.filter(file => file.pfjCode !== pfjCode);

		await fs.promises.writeFile(
			jsonFilePath,
			JSON.stringify(updatedData, null, 2),
			'utf8',
		);
		return res.json({
			message: `📝 info.json mis à jour après suppression.`,
		});
	} catch (err) {
		return res.status(400).json({
			message: `❌ Erreur lors de la suppression du fichier pour l'user ${usrCode}`,
		});
	}
};

/************************************************************************
 **************** Streaming de vidéo **********************************
 ************************************************************************/
export const streamVideo = async (req, res) => {
	try {
		const video = await models.PostFileJoint.findByPk(req.params.id);
		if (!video) {
			return res.status(404).json({ error: 'Vidéo non trouvée' });
		}

		const videoPath = path.join(publicFolder, video.pfjPath);
		console.log('video', video.toJSON());
		console.log('videoPath', videoPath);

		const stat = fs.statSync(videoPath);
		const fileSize = stat.size;

		const range = req.headers.range;

		if (range) {
			// Extraire start et end de "bytes=0-1000"
			const matches = range.match(/bytes=(\d+)-(\d*)/);
			if (!matches) {
				return res.status(416).send('Invalid range format');
			}

			let start = parseInt(matches[1], 10);
			let end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;

			// Validation basique
			if (isNaN(start) || isNaN(end) || start >= fileSize || start < 0) {
				return res.status(416).send('Requested range not satisfiable');
			}

			if (end >= fileSize) end = fileSize - 1;

			const chunksize = end - start + 1;
			const file = fs.createReadStream(videoPath, { start, end });

			res.writeHead(206, {
				'Content-Range': `bytes ${start}-${end}/${fileSize}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunksize,
				'Content-Type': video.pfjType,
			});

			file.pipe(res);
			file.on('error', err => {
				console.error('Erreur de lecture du fichier vidéo:', err);
				res.status(500).end();
			});
		} else {
			// Lecture complète
			res.writeHead(200, {
				'Content-Length': fileSize,
				'Content-Type': video.pfjType,
			});
			fs.createReadStream(videoPath).pipe(res);
		}
	} catch (error) {
		console.error('Erreur lors du streaming:', error);
		res.status(500).json({ error: 'Erreur lors du streaming' });
	}
};

export const downloadVideo = async (req, res) => {
	try {
		const video = await models.PostFileJoint.findByPk(req.params.id);
		if (!video) {
			return res.status(404).json({ error: 'Vidéo non trouvée' });
		}		

		const videoPath = path.join(publicFolder, video.pfjPath);
		res.download(videoPath, video.pfjName);
	} catch (error) {
		console.error('Erreur lors du téléchargement:', error);
		res.status(500).json({ error: 'Erreur lors du téléchargement' });
	}
};

async function mouveTmptopostFolderPath({ usrCode, postCode }) {
	const jsonFilePath = path.join(tmpFolder, `/${usrCode}/info.json`);
	const sourceFolderPath = path.join(tmpFolder, `/${usrCode}`);
	const destinationFolderPath = path.join(postFolderPath, usrCode);
	const destinationThumbnailFolderPath = path.join(
		postFolderPath,
		`/${usrCode}/${thumbnailFolderName}`,
	);
	const destinationJsonFilePath = path.join(
		destinationFolderPath,
		`/${postCode}_info.json`,
	);

	try {
		const rawData = await fs.promises.readFile(jsonFilePath, 'utf8');

		const jsonData = JSON.parse(rawData);

		//Nouvel donner dans le tmp
		const newDataInTmp = jsonData
			.filter(file => file.pfjPath.includes(`${tmpFolder}/${usrCode}/`))
			.map((file, index) => ({
				...file,
				pfjPath: file.pfjPath.replace(
					`${tmpFolder}/${usrCode}/`,
					`${postFolderName}/${usrCode}/`,
				),
				pfjCode: `${postCode}_${index}`,
				postCode: postCode,
			}));

		// Mettre à jour le fichier json et modifier le chemin absolue en relatif /tmp en /post
		const allData = jsonData.map((file, index) => ({
			...file,
			pfjPath: file.pfjPath.replace(
				`${tmpFolder}/${usrCode}/`,
				`${postFolderName}/${usrCode}/`,
			),
			pfjCode: `${postCode}_${index}`,
			postCode: postCode,
		}));

		try {
			await fs.promises.access(destinationFolderPath);
		} catch {
			await fs.promises.mkdir(destinationFolderPath, { recursive: true });
		}

		const files = await fs.promises.readdir(sourceFolderPath);

		if (files.length === 0) {
			console.log(
				`📂 Le dossier "${sourceFolderPath}" est vide. Aucun fichier à déplacer.`,
			);
			return '';
		}

		// 4. Déplacer chaque fichier un par un
		for (const fileName of files) {
			const sourceFile = path.join(sourceFolderPath, fileName);
			const destFile = path.join(destinationFolderPath, fileName);

			try {
				// Vérifie qu'on ne déplace pas un répertoire
				const stats = await fs.promises.stat(sourceFile);
				if (!stats.isFile()) {
					console.warn(
						`📁 Ignoré (ce n'est pas un fichier) : ${sourceFile} ,et fichier json ignoré `,
					);
					continue;
				}

				if (fileName === 'info.json') {
					await fs.promises.unlink(sourceFile);
					console.warn(`✅ fichier info.json supprimé`);
					continue;
				}

				const fileIsInJsonData = jsonData.find(
					file =>
						file.pfjPath.includes(fileName) && !file.pfjCode.includes('post'),
				);

				console.log('fileIsInJsonData', fileIsInJsonData);

				if (fileIsInJsonData) {
					// Générer le thumbnail si s'est une video
					if (fileIsInJsonData.pfjType.includes("video")) {
						const thumbnailName =
							fileIsInJsonData.pfjPath.split(
								`/${usrCode}/`,
							)[1] + '.jpeg';
						
						try {
							await fs.promises.access(destinationThumbnailFolderPath);
						} catch {
							await fs.promises.mkdir(destinationThumbnailFolderPath, {
								recursive: true,
							});
						}

						const destThumbnail = path.join(
							destinationThumbnailFolderPath,
							thumbnailName,
						);

						try {
							await generateThumbnail(
								sourceFile,
								destThumbnail,
								5, // Extraire à 5 secondes
							);
							console.log('✅ Thumbnail généré avec succès !');
						} catch (err) {
							console.error('❌ Erreur :', err.message);
						}
					}

					// Déplacer le fichier qui sont inclus dans le fichier json et on supprime le reste
					await fs.promises.rename(sourceFile, destFile);
					console.log(`✅ Fichier déplacé : ${sourceFile} → ${destFile}`);
				}
			} catch (err) {
				console.error(
					`❌ Impossible de déplacer le fichier "${fileName}" :`,
					err.message,
				);
			}
		}

		await fs.promises.writeFile(
			destinationJsonFilePath,
			JSON.stringify(allData, null, 2),
			'utf8',
		);

		console.log('✅ Fichier info.json mis à jour et déplacé.');
		return newDataInTmp;
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.warn("⚠️ Le fichier info.json n'existe pas encore.");
		} else {
			console.error('❌ Erreur lors du déplacement ou mise à jour:', err);
		}
		return null;
	}
}

async function backupData({ usrCode, postCode }) {
	const jsonFilePath = path.join(tmpFolder, `/${usrCode}/info.json`);
	const destinationFolderPath = path.join(backupFolderPath, usrCode);
	const backupDate = moment().format('YYYY-MM-DD__HH-mm-ss');
	const destinationJsonFilePath = path.join(
		destinationFolderPath,
		`/${postCode}_${backupDate}_info.json`,
	);

	try {
		const rawData = await fs.promises.readFile(jsonFilePath, 'utf8');

		const jsonData = JSON.parse(rawData);

		const pfjCodeList = jsonData.map(file => file.pfjCode);

		const filesInPost = await models.PostFileJoint.findAll({
			where: { postCode: postCode, pfjIsDeleted: false },
			raw: true,
		});

		if (filesInPost === null) {
			return;
		}

		try {
			await fs.promises.access(destinationFolderPath);
		} catch {
			await fs.promises.mkdir(destinationFolderPath, { recursive: true });
		}

		const fileToBackup = filesInPost.filter(
			file => !pfjCodeList.includes(file.pfjCode),
		);

		for (const file of fileToBackup) {
			const sourceFile = path.join(publicFolder, file.pfjPath);
			const fileName = file.pfjPath.replace(
				`${postFolderName}/${usrCode}/`,
				'',
			);
			const destFile = path.join(destinationFolderPath, fileName);

			try {
				await fs.promises.rename(sourceFile, destFile);
				console.log(`✅ Fichier déplacé : ${sourceFile} → ${destFile}`);
			} catch (err) {
				console.error(
					`❌ Impossible de déplacer le fichier "${file}" :`,
					err.message,
				);
			}
		}

		await fs.promises.writeFile(
			destinationJsonFilePath,
			JSON.stringify(fileToBackup, null, 2),
			'utf8',
		);

		return fileToBackup.map(file => file.pfjCode);
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.warn("⚠️ Le fichier info.json n'existe pas encore.");
		} else {
			console.error('❌ Erreur lors du déplacement ou mise à jour:', err);
		}
		return null;
	}
}

export const PostEditRequest = async (req, res) => {
	if (!req.params.usr_code) {
		return res.status(400).json({ message: 'Aucun utilisateur associé' });
	}

	if (!req.params.post_code) {
		return res
			.status(400)
			.json({ message: 'Code post abcent  requis' });
	}

	const usrCode = req.params.usr_code;
	const postCode = req.params.post_code;
	const tmpFolderUser = path.join(tmpFolder, usrCode);
	const post = await models.Post.findByPk(postCode);

	if (post === null) {
		return res.status(400).json({ message: `Ce post n'existe pas.` });
	}

	models.PostFileJoint.findAll({
		where: { postCode: postCode, pfjIsDeleted: false },
		raw: true,
	})
		.then(async files => {
			if (files === null) {
				const message = `Post demande pas de fichier.`;
				return res.json({ message });
			}

			//Delete content of tmpFolder if exist
			if (fs.existsSync(tmpFolderUser)) {
				const files = fs.readdirSync(tmpFolderUser);
				for (const file of files) {
					const filePath = path.join(tmpFolderUser, file);
					fs.unlinkSync(filePath);
				}
			}

			if (!fs.existsSync(tmpFolderUser)) {
				fs.mkdirSync(tmpFolderUser, { recursive: true });
			}

			const filePath = path.join(tmpFolderUser, 'info.json');
			fs.writeFileSync(filePath, JSON.stringify(files, null, 2));

			const message = `Seccess.`;
			res.set('Cache-Control', 'no-store');
			return res.json({ message });
		})
		.catch(err => {
			console.error('Erreur lors de la requête :', err);
			res.status(500).json({
				message: 'Une erreur est survenue lors du traitement de la requête.',
			});
		});
};

// Fontion utile
const cleanupTmpFiles = files => {
	if (!files || files.length === 0) return;

	for (const file of files) {
		try {
			const filePath = file.path;
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (err) {
			console.error(
				`Erreur lors de la suppression du fichier ${file.originalname}:`,
				err,
			);
		}
	}
};

const cleanupTmpUserFolder = async usrCode => {
	const tmpFolderUser = path.join(tmpFolder, usrCode);
	if (fs.existsSync(tmpFolderUser)) {
		const files = fs.readdirSync(tmpFolderUser);
		for (const file of files) {
			const filePath = path.join(tmpFolderUser, file);
			fs.unlinkSync(filePath);
		}
	}
};

async function updateJsonFile(folderName, fileMetadata) {
	const filePath = path.join(folderName, 'info.json');

	let oldData = [];

	try {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if (err) {
				console.error(err);
				fs.writeFileSync(filePath, JSON.stringify(fileMetadata, null, 2));
				return [];
			}

			console.log('file exist data', data);

			oldData = JSON.parse(data);
			const finalData = [...fileMetadata, ...oldData];

			// Écrire dans le fichier
			fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2));
			console.log('Les données ont été sauvegardées dans info.json');
		});
		console.log('data', oldData);
	} catch (err) {
		if (err.code !== 'ENOENT') {
			console.error('Erreur lors de la lecture du fichier:', err);
			return;
		}
		// Si le fichier n'existe pas encore, on continue avec oldData = []
		console.log('Le fichier info.json n’existe pas encore.');
	}
}

async function getNewFileInPostUpdate(postCode, filesToSave) {
	
	const lastData = await models.PostFileJoint.findAll({
		where: {
			postCode: postCode
		},
		order: [['pfj_created_date', 'DESC']],
		raw: true,
		limit: 20,
	});
	
	
	const last_code = !lastData.length
		? 0
		: lastData
				.map(function (id) {
					return parseInt(id.pfjCode.replace(postCode, '').match(/\d+/g));
				})
				.reduce((previousId, currentId) =>
					previousId > currentId ? previousId : currentId,
				);

	console.log('last_code', last_code);
				

	const newFiles = filesToSave
		.filter(file => file.pfjCreatedDate === undefined)
		.map((file, index) => ({
			...file,
			pfjCode: `${postCode}_${index + last_code + 1}`,
		}));
	
	return newFiles;
}
