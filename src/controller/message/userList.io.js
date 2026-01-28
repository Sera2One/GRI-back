import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import moment from 'moment';
import { generateId } from '../../services/generateId.js';
import { Op, where } from 'sequelize';
import { getUserVisibleData } from '../../services/privacyService.js';
import { updateUserStateOnline } from '../../services/updateUserStateOnline.js';

const models = initModels(sequelize);

export const userListeSocket = async (socket, io) => {
	const { usrCode, refresh_token, navigator, deviceId } = socket.handshake.auth;

	// Récupérer l'IP du client
	const clientIp = getClientIp(socket);

	try {
		const clientIp = getClientIp(socket);
		const expiresAt = moment().add(7, 'days').toDate();

		// ✅ ÉTAPE 0 : Nettoyer les sessions expirées pour cet utilisateur
		await models.Session.update(
			{ sessionIsActive: false, sessionUserIsOnline: false },
			{
				where: {
					usrCode: usrCode,
					sessionExpiresAt: { [Op.lt]: new Date() },
					sessionIsActive: true,
				},
			},
		);

		// ✅ ÉTAPE 2 : Chercher une session EXISTANTE pour ce deviceId
		let session = await models.Session.findOne({
			where: {
				usrCode: usrCode,
				sessionDeviceId: deviceId, // ← clé : on cherche par deviceId
				sessionIsActive: true,
				sessionExpiresAt: { [Op.gt]: new Date() },
			},
		});

		if (session) {
			// → Mise à jour de la session existante (même deviceId)
			await session.update({
				sessionRefreshToken: refresh_token,
				sessionLastActive: new Date(),
				sessionExpiresAt: expiresAt,
				sessionUserIsOnline: true, // ← toujours true à la connexion
				sessionIp: clientIp,
			});
			console.log(
				`Session réutilisée pour ${usrCode} sur deviceId ${deviceId}`,
			);
		} else {
			// ✅ ÉTAPE 3 : Créer une NOUVELLE session (nouvel appareil)
			const sessionCode = await generateId('Session');

			session = await models.Session.create({
				sessionCode: sessionCode,
				usrCode: usrCode,
				sessionCreatedDate: new Date(),
				sessionLastActive: new Date(),
				sessionExpiresAt: expiresAt,
				sessionRefreshToken: refresh_token,
				sessionIsActive: true,
				sessionUserIsOnline: true,
				sessionBrowserInfo: navigator,
				sessionIp: clientIp,
				sessionDeviceId: deviceId,
			});

			console.log(
				`✅ Nouvelle session créée pour ${usrCode}: ${session.sessionCode},`,
				session.toJSON(),
			);
		}

		// Attacher la session
		socket.session = session;

		// prévenir les autres sockets qu'il y a une nouvel session
		const sockets = await io.fetchSockets();
		for (const oldSocket of sockets) {
			if (oldSocket.handshake.auth.usrCode === usrCode) {
				if (oldSocket !== socket) {
					oldSocket.emit('concurrent-access-detected', {
						message: 'Une autre session a été ouverte.',
						data : session.toJSON()
					});
				}
			}
		}

		socket.broadcast.emit('user-connected', {
			userID: socket.id,
			...socket.handshake.auth,
		});

		await updateUserStateOnline({ usrCode: socket.userID, isOnline: true });
	} catch (error) {
		console.error('Erreur gestion session:', error);
		socket.disconnect(true);
		return;
	}

	// ==================== ÉVÉNEMENTS ====================

	socket.on('updateOnlineStatus', async status => {
		try {
			await updateUserStateOnline({ usrCode: socket.userID, isOnline: status });
		} catch (error) {
			console.error('Erreur updateOnlineStatus:', error);
		}
	});

	socket.on('hideOnlineStatus', async status => {
		try {
			await updateUserStateOnline({ usrCode: socket.userID, hideOnlineState: status });
		} catch (error) {
			console.error('Erreur updateOnlineStatus:', error);
		}
	});

	socket.on('disconnect-all-browsers', async callback => {
		try {
			await models.Session.update(
				{ sessionIsActive: false, sessionUserIsOnline: false },
				{
					where: {
						usrCode: usrCode,
						sessionCode: { [Op.ne]: socket.session?.sessionCode },
					},
				},
			);

			const sockets = await io.fetchSockets();
			sockets.forEach(s => {
				if (s.handshake.auth.usrCode === usrCode && s !== socket) {
					s.emit('remote-user-disconnect-all-browsers');
					s.disconnect(true);
				}
			});


			console.log(`Sessions déconnectées pour ${usrCode} (sauf courante)`);
			if (callback) callback({ success: true });
		} catch (error) {
			console.error('Erreur disconnectAllBrowsers:', error);
			if (callback) callback({ success: false });
		}
	});

	socket.on('disconnectSpecificDevice', async (targetSession, callback) => {
		const sessionCode = targetSession.sessionCode;
		try {
			await models.Session.update(
				{ sessionIsActive: false, sessionUserIsOnline: false },
				{ where: { sessionCode: sessionCode, usrCode: usrCode } },
			);

			const sockets = await io.fetchSockets();
			const targetSocket = sockets.find(
				s => s.session?.sessionCode === sessionCode,
			);
			if (targetSocket) {
				targetSocket.emit('remote-user-disconnect-all-browsers');
				targetSocket.disconnect(true);
			}

			if (callback) callback({ success: true });

			console.log(`Session ${sessionCode} déconnectée`);
		} catch (error) {
			console.error('Erreur disconnectSpecificDevice:', error);
			if (callback) callback({ success: false });
		}
	});

	socket.on('closeTabs', async (targetSession, callback) => {
		const sessionCode = targetSession.sessionCode;
		try {
			const sockets = await io.fetchSockets();
			const targetSocket = sockets.find(
				s => s.session?.sessionCode === sessionCode,
			);
			if (targetSocket) {
				targetSocket.emit('closeTabs');
			}

			if (callback) callback({ success: true });

			console.log(`Session ${sessionCode} tabs desactivé`);
		} catch (error) {
			console.error('Erreur désactivation tabs:', error);
			if (callback) callback({ success: false });
		}
	});

	socket.on('session-trusted', async (targetSession, callback) => {
		const sessionCode = targetSession.sessionCode;
		try {
			await models.Session.update(
				{
					sessionIsrusted: true,
				},
				{ where: { sessionCode: sessionCode } },
			);

			if (callback) callback({ success: true });

			console.log(`Session ${sessionCode} est digne de confiance`);
		} catch (error) {
			console.error('Erreur désactivation tabs:', error);
			if (callback) callback({ success: false });
		}
	});

	socket.on('getActiveSessions', async callback => {
		try {
			const sessions = await models.Session.findAll({
				where: { usrCode: usrCode, sessionIsActive: true },
				attributes: [
					'sessionCode',
					'sessionCreatedDate',
					'sessionLastActive',
					'sessionExpiresAt',
					'sessionUserIsOnline',
					'sessionBrowserInfo',
					'sessionIp',
					'sessionDeviceId',
				],
			});
			if (callback) callback(sessions);
		} catch (error) {
			console.error('Erreur getActiveSessions:', error);
			if (callback) callback([]);
		}
	});

	socket.on('user-get-connected-users', async callback => {
		const sockets = await io.fetchSockets();
		const users = sockets.map(s => ({
			userID: s.id,
			...s.handshake.auth,
			lastActive: s.session?.sessionLastActive || null,
		}));
		if (callback) callback(users);
	});

	// Déconnexion volontaire
	socket.on('session logOut', async callback => {
		try {
			if (socket.session) {
				await socket.session.update({
					sessionIsActive: false,
					sessionUserIsOnline: false,
					sessionLastActive: new Date(),
				});
			}
			if (callback) callback({ success: true });
			console.log(`Session désactivée pour ${usrCode}`);
		} catch (error) {
			if (callback) callback({ success: false });
			console.error('Erreur session logOut:', error);
		}
	});

	// Déconnexion automatique (fermeture onglet, etc.)
	socket.on('disconnect', async () => {
		try {
			const usrCode = socket.userID;
			const count = await models.Session.count({ where: { sessionUserIsOnline : true, usrCode : usrCode  } });
			


			if (count === 1) {
				await updateUserStateOnline({ usrCode: usrCode, isOnline: false });
			}

			if (socket.session) {
				await socket.session.update({
					sessionUserIsOnline: false,
					sessionLastActive: new Date(),
				});
			}

			console.log(`Déconnexion: ${usrCode}`);
		} catch (error) {
			console.error('Erreur disconnect:', error);
		}
	});

	socket.on('get-user-info', async ({ userCode }, callback) => {
		let relationship = 'public';
		let filtredGroupe = [];
		let visibleData = null; 

		try {
			// Initialiser les modèles
			const models = initModels(sequelize);

			// Vérifier si l'utilisateur demande ses propres infos
			if (socket.userID === userCode) {
				relationship = 'self';
			} else {
				// Récupérer les IDs des groupes de l'utilisateur connecté
				const userGroups = await models.GroupeUserMember.findAll({
					where: {
						usrCode: socket.userID,
						gumUserIsDeleted: false,
					},
					attributes: ['gunCode'],
				});
				const userGroupIds = userGroups.map(g => g.gunCode);

				// Vérifier s'il y a des groupes en commun
				if (userGroupIds.length > 0) {
					const targetUserGroupe = await models.GroupeUserMember.findAll({
						where: {
							usrCode: userCode,
							gumUserIsDeleted: false,
							gunCode: {
								[Op.in]: userGroupIds, // Filtrer par groupes communs
							},
						},
						include: [
							{
								model: models.GroupeUserName,
								as: 'gunCodeGroupeUserName',
								where: { gunIsDeleted: false },
							},
						],
					});

					// Formater les données des groupes
					filtredGroupe = targetUserGroupe.map(el => {
						const plain = el.get({ plain: true });
						return {
							...plain,
							...plain.gunCodeGroupeUserName,
						};
					});

					// Déterminer la relation
					if (filtredGroupe.length > 0) {
						relationship = 'friend';
					}
				}
			}

			// Récupérer les données visibles selon la relation
			visibleData = await getUserVisibleData({
				targetUserCode: userCode,
				viewerRelationship: relationship,
			});

			// Envoyer la réponse
			if (callback)
				callback({
					success: true,
					data: visibleData,
					groupe: filtredGroupe,
					relationship: relationship,
				});
		} catch (error) {
			console.error('Error getting userInfo:', error);
			if (callback) callback({ success: false, error: error.message });
		}
	});
	

	// ==================== UTILS ====================

	function getClientIp(socket) {
		let ip = socket.handshake.address;
		if (socket.handshake.headers['x-forwarded-for']) {
			ip = socket.handshake.headers['x-forwarded-for'].split(',')[0].trim();
		}
		return ip.replace('::ffff:', ''); // Nettoyer IPv4-mapped IPv6
	}
};
