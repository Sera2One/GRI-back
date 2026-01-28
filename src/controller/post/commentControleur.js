import { sequelize } from '../../db/config/database.js';
import { Op } from 'sequelize';
import initModels from '../../db/models/init-models.js';
import moment from 'moment';
import Users from '../../db/models/users.js';
import { generateId } from '../../services/generateId.js';
import { getPreciseGMTTime } from '../../services/timeSync.js';
var models = initModels(sequelize);

/************************************************************************
 **************** Create commentaires ******************************
 ************************************************************************/
export const postComment = async (req, res) => {
	const { cmtContent, postCode, usrCode } = req.body;
	console.log('comment , ', req.body);

	try {
		const commentData = {
			cmtContent: cmtContent,
			useUsrCode: usrCode,
			postCode: postCode,
			cmtCode: await generateId('Comment'),
			cmtCreatedDate: getPreciseGMTTime().iso,
			cmtIsDeletedByOther: false,
		};

		// Create a new commentaire
		const newComment = await models.Comment.create(commentData);
		const message = `Création commentaire éffectue avec succès.`;
		res.json({ message, commentaire: newComment });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
};

/************************************************************************
 **************** search and get all commentaires ******************************
 ************************************************************************/
const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1);
export const getComment = async (req, res) => {
	const limit = parseInt(req.query.limit) || 5;
	const page = parseInt(req.query.page) || 1;
	const { postCode, cmtRootCode, cmtResponseLv, texte } = req.query;
	
	const offset = 0 + (page - 1) * limit;

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
		whereCondition.cmtResponseLv = { [Op.not]: null };
	}

	if (texte) {
		whereCondition.cmtContent = {
			[Op.or]: {
				[Op.like]: `%${texte}%`,
				[Op.startsWith]: capitalize(texte),
			},
		};
	}
	
	try {
		const { count, rows } = await models.Comment.findAndCountAll({
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
			],
			order: [['cmt_created_date', 'DESC']],
			offset: offset,
			limit: limit,
			raw: true,
			nest: true,
		});
		
	
		const nbPage = Math.ceil(parseInt(count) / limit);		

		const result = {
			message: `Il y a ${count} commentaire pour l'annonce  ${postCode}. page ${page}/${nbPage}`,
			data: rows || [],
			page: page,
			nbPage: nbPage,
			count: count,
		};

		if (texte) {
			result.message = `Il y a ${count} commentaire resultat pour le text ${postCode}. page ${page}/${nbPage}`;
		} else {
			const replyCounts = await getCommentReplyCounts({ postCode });
			console.log('replyCounts', replyCounts);
			
			const commentCount = await getCommentCount({ postCode: postCode });
			result.commentCount = commentCount;
			result.replyCounts = replyCounts;
			result.postCode = postCode;
			result.cmtRootCode = cmtRootCode || null;
		}

		if (cmtRootCode) {
			const cmtParentCodeList = rows.map(c => c.cmtParentCode);			
			result.cmtParenList = await getCommentParent({
				cmtParentCodeList: cmtParentCodeList,
			});
		}

		res.json(result);
	} catch (error) {
		console.error('Error getting message:', error);
		res.status(500).json({ message: 'Serveur errour :', error });
	}
};

async function getCommentParent({ cmtParentCodeList }) {
	return await models.Comment.findAll({
		where: {
			cmtCode: { [Op.in]: cmtParentCodeList },
			cmtSaveAsHistory: false,
		},
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
		],
		order: [['cmt_created_date', 'DESC']],
	});
}

async function getCommentCount({ postCode, isDeleted = false }) {
	return await models.Comment.count({
		where: {
			postCode: postCode,
			cmtIsDeleted: isDeleted,
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
			cmtSaveAsHistory: false,
			cmtRootCode: { [Op.not]: null },
		},
		group: ['cmt_root_code'],
		raw: true,
	});
}
