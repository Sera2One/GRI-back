// commentReaction.socket.js
import { sequelize } from '../../../db/config/database.js';
import initModels from '../../../db/models/init-models.js';
import moment from 'moment';
import { generateId } from '../../../services/generateId.js';
import { getPreciseGMTTime } from '../../../services/timeSync.js';

const models = initModels(sequelize);

export default function reaction(io, socket) {
	/*
	 * payload = { cmtCode, reaction }
	 */
	socket.on('comment-reaction-toggle', async (payload, callback) => {
		try {
			const { cmtCode, reaction } = payload;
			const usrCode = socket.userID;

			const existing = await models.CommentReactions.findOne({
				where: { cmtCode, usrCode, creactReaction: reaction },
			});

			let action;

			if (existing) {
				await models.CommentReactions.destroy({
					where: { creactCode: existing.creactCode },
				});
				action = 'removed';
			} else {
				await models.CommentReactions.create({
					creactCode: await generateId('CommentReactions'),
					cmtCode,
					usrCode,
					creactReaction: reaction,
					creactCreatedDate: getPreciseGMTTime().iso,
				});
				action = 'added';
			}

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

			const fullMessage = {
				success: true,
				action,
				cmtCode,
				reaction,
				aggregate,
			};

			io.emit('comment_reaction_update', fullMessage);
			if (callback) callback(fullMessage);
		} catch (error) {
			console.error('comment-reaction-toggle error:', error);
			if (callback) callback({ success: false, error: error.message });
		}
	});

	socket.on('comment-reaction-get', async (payload, callback) => {
		try {
			const { postCode, reaction } = payload;
			const usrCode = socket.userID;

			const existing = await models.CommentReactions.findOne({
				where: { cmtCode, usrCode, creactReaction: reaction },
			});

			let action;

			if (existing) {
				await models.CommentReactions.destroy({
					where: { creactCode: existing.creactCode },
				});
				action = 'removed';
			} else {
				await models.CommentReactions.create({
					creactCode: await generateId('CommentReactions'),
					cmtCode,
					usrCode,
					creactReaction: reaction,
					creactCreatedDate: getPreciseGMTTime().iso,
				});
				action = 'added';
			}

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

			const fullMessage = {
				success: true,
				action,
				cmtCode,
				reaction,
				aggregate,
			};

			io.emit('comment_reaction_update', fullMessage);
			if (callback) callback(fullMessage);
		} catch (error) {
			console.error('comment-reaction-toggle error:', error);
			if (callback) callback({ success: false, error: error.message });
		}
	});

}


/* import { Server } from 'socket.io';
import registerPostReactionSocket from './sockets/postReaction.socket.js';
import registerCommentReactionSocket from './sockets/commentReaction.socket.js';

const io = new Server(server);

io.on('connection', socket => {
	registerPostReactionSocket(io, socket);
	registerCommentReactionSocket(io, socket);
});


socket.emit('post-reaction-toggle', { postCode: 'P123', reaction: 'love' });

socket.on('post_reaction_update', data => {
	console.log('MAJ réaction post:', data);
}); */
