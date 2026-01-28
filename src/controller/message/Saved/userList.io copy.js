import { sequelize } from '../../../db/config/database.js';
import initModels from '../../../db/models/init-models.js';
import moment from 'moment';
import { generateId } from '../../../services/generateId.js';

var models = initModels(sequelize);

export const userListeSocket = async (socket, io) => {
	
	const { usrCode, refresh_token, navigator } = socket.handshake.auth;

	// ==================== GESTION DE LA CONNEXION ====================
	try {
		// Vérifier si une session active existe déjà pour cet utilisateur
		const existingSession = await models.Session.findOne({
			where: {
				usrCode: usrCode,
				sessionIsActive: true,
				sessionUserIsOnline: true,
			},
			order: [['sessionCreatedDate', 'DESC']],
			raw: true,
		});

		// Créer une nouvelle session si:
		// 1. Aucune session existante OU
		// 2. Le refresh_token est différent du sessionCookie de la session existante
		if (
			!existingSession ||
			(existingSession && existingSession.sessionCookie !== refresh_token)
		) {
			const sessionCode = await generateId('Session');
			console.log('sessionCode', sessionCode);

			const sessionExpireDate = moment().add(7, 'days').toDate(); // Expire dans 7 jours

			await models.Session.create({
				sessionCode: sessionCode,
				usrCode: usrCode,
				sessionCreatedDate: new Date(),
				sessionExpireDate: sessionExpireDate,
				sessionCookie: refresh_token,
				sessionIsActive: true,
				sessionUserIsOnline: true,
				sessionBrowserInfo: JSON.stringify(navigator),
			});

			console.log(`Nouvelle session créée pour l'utilisateur ${usrCode}`);
		} else {
			console.log(`Session existante valide pour l'utilisateur ${usrCode}`);
		}
	} catch (error) {
		console.error('Erreur lors de la gestion de la session:', error);
	}

	// ==================== ÉVÉNEMENTS SOCKET ====================

	// Notifier les autres utilisateurs
	socket.broadcast.emit('user-connected', {
		userID: socket.id,
		...socket.handshake.auth,
	});

	// 1. Mettre à jour le statut en ligne
	socket.on('updateOnlineStatus', async status => {
		try {
			await updateSessionStatus(usrCode, refresh_token, status);
			console.log(`Statut en ligne mis à jour: ${status} pour ${usrCode}`);
		} catch (error) {
			console.error('Erreur mise à jour statut:', error);
		}
	});

	// 2. Déconnecter tous les appareils
	socket.on('disconnectAllBrowsers', async () => {
		try {
			await models.Session.update(
				{
					sessionIsActive: false,
					sessionUserIsOnline: false,
				},
				{ where: { usrCode: usrCode } },
			);

			// Déconnecter toutes les sockets de cet utilisateur
			const sockets = await io.fetchSockets();
			sockets.forEach(s => {
				if (s.handshake.auth.usrCode === usrCode) {
					s.disconnect(true);
				}
			});

			console.log(`Toutes les sessions déconnectées pour ${usrCode}`);
		} catch (error) {
			console.error('Erreur déconnexion globale:', error);
		}
	});

	// 3. Déconnecter un appareil spécifique
	socket.on('disconnectSpecificDevice', async sessionCode => {
		try {
			// Mettre à jour la session
			await models.Session.update(
				{
					sessionIsActive: false,
					sessionUserIsOnline: false,
				},
				{ where: { sessionCode: sessionCode } },
			);

			// Déconnecter la socket correspondante
			const sockets = await io.fetchSockets();
			const targetSocket = sockets.find(
				s => s.handshake.auth.sessionCode === sessionCode,
			);

			if (targetSocket) {
				targetSocket.disconnect(true);
				console.log(`Appareil ${sessionCode} déconnecté`);
			}
		} catch (error) {
			console.error('Erreur déconnexion appareil:', error);
		}
	});

	// 5. Obtenir les sessions actives
	socket.on('getActiveSessions', async callback => {
		try {
			const activeSessions = await models.Session.findAll({
				where: {
					usrCode: usrCode,
					sessionIsActive: true,
				},
				raw: true,
			});

			if (callback) callback(activeSessions);
		} catch (error) {
			console.error('Erreur récupération sessions:', error);
			if (callback) callback([]);
		}
	});

	// 5. Obtenir la liste des utilisateur ayant le socket active
	socket.on('user-get-connected-users', async (callback) => {
		const userListe = [];
		const sockets = await io.fetchSockets();
		sockets.forEach(socket => {
			userListe.push({
				userID: socket.id,
				...socket.handshake.auth,
			});
		});

		if (callback) callback(userListe);
	});

  socket.on('session logOut', async callback => {
		try {
			// Mettre à jour la session comme inactive lors de la déconnexion
			await models.Session.update(
				{ sessionIsActive: false },
				{
					where: {
						usrCode: usrCode,
						sessionCookie: refresh_token,
						sessionIsActive: true,
					},
				},
			);
			if (callback) callback({ success: true });
			console.log(
				`Session marquée comme inactive pour l'utilisateur ${usrCode}`,
			);
		} catch (error) {
			if (callback) callback({ success: false });
			console.error('Erreur lors de la mise à jour de la session:', error);
		}
	});

	// Gestion de la déconnexion pas connexion 
	socket.on('disconnect', async () => {
		try {
			await updateSessionStatus(usrCode, refresh_token, false);
			console.log(`Utilisateur déconnecté: ${usrCode}`);
			socket.broadcast.emit('user-disconnected', socket.handshake.auth);
		} catch (error) {
			console.error('Erreur déconnexion:', error);
		}
	});

	// ==================== FONCTIONS UTILITAIRES ====================
	async function updateSessionStatus(usrCode, sessionCookie, isOnline) {
		await models.Session.update(
			{ sessionUserIsOnline: isOnline },
			{
				where: {
					usrCode: usrCode,
					sessionCookie: sessionCookie,
				},
			},
		);
	}

	async function getClientIp(socket) {
		let clientIpAddress = socket.handshake.address; // Default to proxy IP
		if (socket.handshake.headers['x-forwarded-for']) {
			clientIpAddress = socket.handshake.headers['x-forwarded-for']
				.split(',')[0]
				.trim();
		}

		return clientIpAddress;
	}
};
