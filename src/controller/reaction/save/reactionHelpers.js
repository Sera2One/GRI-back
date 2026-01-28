// services/reactionHelpers.js
import initModels from '../../../db/models/init-models.js';
import { sequelize } from '../../../db/config/database.js';

const models = initModels(sequelize);

// ------------------------------------------
// 1. Post
// ------------------------------------------
export async function getPostReactions({ postCode, userCode = null }) {
	// agrégat global
	const counts = await models.PostReactions.findAll({
		attributes: [
			'preactReaction',
			[sequelize.fn('COUNT', sequelize.col('preactReaction')), 'total'],
		],
		where: { postCode },
		group: ['preactReaction'],
		raw: true,
	});

	const aggregate = counts.reduce((acc, cur) => {
		acc[cur.preactReaction] = parseInt(cur.total, 10);
		return acc;
	}, {});

	// réactions de l’utilisateur courant
	let userReaction = [];
	if (userCode) {
		userReaction = await models.PostReactions.findAll({
			attributes: ['preactReaction'],
			where: { postCode, usrCode: userCode },
			raw: true,
		}).then(rows => rows.map(r => r.preactReaction));
	}

	return { aggregate, userReaction };
}

// ------------------------------------------
// 2. Comment
// ------------------------------------------
export async function getCommentReactions({ cmtCode, userCode = null }) {
	const counts = await models.CommentReactions.findAll({
		attributes: [
			'creactReaction',
			[sequelize.fn('COUNT', sequelize.col('creactReaction')), 'total'],
		],
		where: { cmtCode },
		group: ['creactReaction'],
		raw: true,
	});

	const aggregate = counts.reduce((acc, cur) => {
		acc[cur.creactReaction] = parseInt(cur.total, 10);
		return acc;
	}, {});

	let userReaction = [];
	if (userCode) {
		userReaction = await models.CommentReactions.findAll({
			attributes: ['creactReaction'],
			where: { cmtCode, usrCode: userCode },
			raw: true,
		}).then(rows => rows.map(r => r.creactReaction));
	}

	return { aggregate, userReaction };
}
