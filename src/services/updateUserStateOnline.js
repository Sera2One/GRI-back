import moment from 'moment';
import { generateId } from './generateId.js';
import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';
import { getIo } from '../../server.js';
import { getPreciseGMTTime } from './timeSync.js';
const models = initModels(sequelize);

/**
 * Crée une notification en BDD + émet via Socket.IO
 * @param {Object} options
 * @param {string} options.usrCode
 * @param {boolean} options.isOnline
 * @param {boolean} options.hideOnlineState
 */
export const updateUserStateOnline = async ({
	usrCode,
	isOnline,
	hideOnlineState,
}) => {
	try {
		const io = getIo();
		
			const now = getPreciseGMTTime().iso;
			const userInfo = {
					usrLastOnlineDate: now,
				}

			if (isOnline != undefined) {
				userInfo.usrIsOnline = isOnline;
			}

			if (hideOnlineState != undefined) {
				userInfo.usrHideOnlineState = hideOnlineState;
			}

			await models.Users.update(userInfo, { where: { usrCode: usrCode } });
		

		console.log('userInfo', userInfo);
		
		io.emit('user-online-state-update', {
			success: true,
			usrCode: usrCode,
			...userInfo,
		});

	} catch (error) {
		console.error('Erreur création/mise à jour notification:', error);
		throw error;
	}
};
