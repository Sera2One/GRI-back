// commentReaction.socket.js
import { sequelize } from '../../../db/config/database.js';
import initModels from '../../../db/models/init-models.js';
import moment from 'moment';
import { generateId } from '../../../services/generateId.js';
import { getPreciseGMTTime } from '../../../services/timeSync.js';

const models = initModels(sequelize);

export default function reaction(io, socket) {
	
	/*
	 * payload = { postCode, reaction }
	 * reaction ∈ ['like','love','laugh','wow','sad','angry']
	 */
	socket.on('post-reaction-toggle', async (payload, callback) => {
		try {
			const { postCode, reaction } = payload;
			const usrCode = socket.userID;

			// Vérif existence
			const existing = await models.PostReactions.findOne({
				where: { postCode, usrCode, preactReaction: reaction },
			});

			let action; // 'added' | 'removed'

			if (existing) {
				// Suppression (toggle OFF)
				await models.PostReactions.destroy({
					where: { preactCode: existing.preactCode },
				});
				action = 'removed';
			} else {
				// Création (toggle ON)
				await models.PostReactions.create({
					preactCode: await generateId('PostReactions'),
					postCode,
					usrCode,
					preactReaction: reaction,
					preactCreatedDate: getPreciseGMTTime().iso,
				});
				action = 'added';
			}

			// Compteur agrégé par type
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

			const fullMessage = {
				success: true,
				action,
				postCode,
				reaction,
				aggregate,
			};

			io.emit('post_reaction_update', fullMessage);
			if (callback) callback(fullMessage);
		} catch (error) {
			console.error('post-reaction-toggle error:', error);
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