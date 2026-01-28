import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';

var models = initModels(sequelize);

/************************************************************************
 **************** search and get all pages ******************************
 ************************************************************************/

export const broadcastACL = async (socket, io) => {
	
	socket.on('access-updated', async data => {
		try {
			const { grpCode } = data;
			const accesses = await models.GroupeAccesView.findAll({
				where: { grpCode: grpCode },
				attributes: {
					exclude: ['id', 'entityDescription', 'histGrpACode'],
				},
				order: [
					['entityType', 'ASC'],
					['entityName', 'ASC'],
				],
				raw: true, // Important pour les vues
				nest: true,
			});
			const result = {
				message: `Accès du groupe ${grpCode} chargés`,
				data: accesses,
				count: accesses.length,
				grpCode: grpCode,
			};
			console.log('result acces', result);
			

			io.emit('group-acces-updated', result);
		} catch (error) {
			console.error('Erreur getGroupAccess:', error);
			res.status(500).json({ message: 'Erreur serveur', error: error.message });
		}
	});
};

