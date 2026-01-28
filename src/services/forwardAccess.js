import initModels from '../db/models/init-models.js';
import { sequelize } from '../db/config/database.js';
import { Op } from 'sequelize';
const models = initModels(sequelize);

export async function validateForwardAccess(sourceCode, usrCode) {
	const sourceTypeIsGroupe = sourceCode.includes('gu-message');	

	if (sourceTypeIsGroupe) {
		const message = await models.GroupeUserMessage.findByPk(sourceCode);
		if (!message) throw new Error('Message de groupe introuvable');
		const member = await models.GroupeUserMember.findOne({
			where: {
				gunCode: message.gunCode,
				usrCode,
				gumUserIsDeleted: false,
			},
		});
		if (!member) throw new Error('Accès refusé au message de groupe');
	}else{
		const access = await models.Destination.findOne({
			where: {
				msgCode: sourceCode,
				[Op.or]: [{ usrCode }, { destSenderCode: usrCode }],
			},
		});
		if (!access) throw new Error('Accès refusé au message privé');
		
	}
}
