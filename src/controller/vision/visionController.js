//visionController.js - Modifié pour PeerJS
import { v4 as uuid } from 'uuid';
import initModels from '../../db/models/init-models.js';
import { sequelize } from '../../db/config/database.js';

const models = initModels(sequelize);

// Stocker les informations des utilisateurs connectés avec leurs peer IDs
const connectedUsers = new Map();
const rooms = {};
const activeCalls = new Map(); // clé: `${callerUsrCode}-${calleeUsrCode}`

// Creer des rooms automatiquement pour les goupes.
models.GroupeUserName.findAll({ raw: true }).then(groupeList => {
	groupeList.forEach(async group => {
		const autorisedUsers = await models.GroupeUserMember.findAll({
			where: { gunCode: group.gunCode },
			attributes: ['usr_code', 'gum_is_admin'],
			raw: true,
		});

		rooms[group.gunCode] = {
			roomId: group.gunCode,
			roomTitle: group.gunName,
			isPublic: false,
			isMemorised: true,
			participants: [],
			authorizedUsers: autorisedUsers || [],
		};
	});
});

export const visionController = async (socket, io) => {
	// Enregistrer les informations de l'utilisateur lors de 1er connexion au serveur
	const { usrCode, grpCode, usrName, usrFirstname, usrImg } =
		socket.handshake.auth;
	connectedUsers.set(socket.id, {
		socketId: socket.id,
		peerId: null,
		user: {
			usrCode: usrCode,
			grpCode: grpCode,
			usrName: usrName,
			usrFirstname: usrFirstname,
			usrImg: usrImg,
		},
		roomId: null,
	});

	// Enregistrer le peer ID d'un utilisateur
	socket.on('peer-id', async ({ peerId, user }) => {
		console.log(`Utilisateur ${user.usrName} connecté avec peer ID: ${peerId}`);

		socket.data.peerId = peerId;
		socket.data.user = user;

		connectedUsers.set(socket.id, {
			socketId: socket.id,
			peerId: peerId,
			user: user,
			roomId: null,
		});

		// Envoyer la liste des peers connectés à tous les clients
		const peersList = Array.from(connectedUsers.values()).map(u => ({
			peerId: u.peerId,
			user: u.user,
			socketId: u.socketId,
			roomId: u.roomId,
		}));

		io.emit('peer-list', peersList);
	});

	// Gestion des appels
	socket.on(
		'callingUser',
		async ({ userToCall, userSource, peerId, isPublic, roomTitle }) => {
			console.log(`${userSource.usrName} appelle ${userToCall.usrName}`);
			const callKey = `${userSource.usrCode}-${userToCall.usrCode}`;

			// ❌ Ne rien faire si l’appel est déjà 'aborded', 'accepted', 'rejected'
			if (activeCalls.has(callKey)) {
				if (activeCalls.get(callKey) != 'pending') {
					//
					console.log('dans pending', activeCalls);
					return;
				}
			}

			console.log('hors pending', activeCalls);

			// ✅ Marquer l’appel comme "en cours"
			activeCalls.set(callKey, 'pending');

			setTimeout(() => {
				if (activeCalls.has(callKey)) {
					activeCalls.delete(callKey);
				}
			}, 60000);

			// Trouver l'utilisateur à appeler
			const targetUser = Array.from(connectedUsers.values()).find(
				u => u.user.usrCode === userToCall.usrCode,
			);

			const callerInfo = connectedUsers.get(socket.id);

			if (targetUser && callerInfo) {
				if (targetUser.roomId) {
					// L'utilisateur est déjà dans une room, proposer de rejoindre
					socket.to(targetUser.socketId).emit('reqJoinRoom', {
						roomId: targetUser.roomId,
						peerId: peerId,
						userSource: userSource,
					});
				} else {
					if (callerInfo.roomId) {
						const roomId = callerInfo.roomId;
						// Envoyer l'appel entrant à l'utilisateur cible
						console.log('send user-calling to', targetUser.user.usrCode);

						//Ne pas envoyer le user-calling quand callAccept est recu
						io.to(targetUser.user.usrCode).volatile.emit('user-calling', {
							roomId: roomId,
							callerPeerId: peerId,
							caller: userSource,
							roomTitle: roomTitle,
						});
					} else {
						// Créer une nouvelle room
						let roomDetail = 'room-private-';
						if (isPublic) {
							roomDetail = 'room-public-';
						}

						const roomId = roomDetail + uuid();
						rooms[roomId] = {
							roomId: roomId,
							roomTitle: roomTitle,
							isPublic: isPublic,
							participants: [],
						};

						// Ajouter l'appelant à la room
						rooms[roomId].participants.push({
							user: userSource,
							peerId: peerId,
							socketId: socket.id,
						});

						// Mettre à jour les informations de l'utilisateur
						callerInfo.roomId = roomId;
						connectedUsers.set(socket.id, callerInfo);

						socket.join(roomId);

						// Envoyer l'appel entrant à l'utilisateur cible
						console.log('send user-calling to', targetUser.user.usrCode);

						io.to(targetUser.user.usrCode).volatile.emit('user-calling', {
							roomId: roomId,
							callerPeerId: peerId,
							caller: userSource,
							roomTitle: roomTitle,
						});
					}
				}
			} else {
				socket.emit('userNotOnline', {
					message: "L'utilisateur n'est pas en ligne",
				});
			}
		},
	);

	socket.on(
		'call-aborded',
		async ({ userToCall, userSource, peerId, isPublic, roomTitle }) => {
			console.log('aborde', {
				userToCall,
				userSource,
				peerId,
				isPublic,
				roomTitle,
			});

			console.log(
				`${userSource?.usrName} aborde son appele à ${userToCall?.usrName}`,
			);
			const callKey = `${userSource?.usrCode}-${userToCall?.usrCode}`;

			activeCalls.set(callKey, 'aborded');

			// Trouver l'utilisateur à appeler
			const targetUser = Array.from(connectedUsers.values()).find(
				u => u.user?.usrCode === userToCall?.usrCode,
			);

			// Retirer son room
			const callerInfo = connectedUsers.get(socket.id);
			if (callerInfo.roomId) {
				callerInfo.roomId = null;
				connectedUsers.set(socket.id, callerInfo);
			}

			if (targetUser) {
				const callerInfo = connectedUsers.get(socket.id);
				const roomId = callerInfo?.roomId;

				// Supprimer le rooms
				if (roomId) {
					delete rooms[roomId];
				}

				if (callerInfo) {
					callerInfo.roomId = null;
					connectedUsers.set(socket.id, callerInfo);
				}

				socket.leave(roomId);

				// Ne pas envoyer call-aborded s' il est déja dans une appele
				if (!targetUser.roomId) {
					// Envoyer l'appel entrant à l'utilisateur cible
					console.log('targetUser.user.usrCode', targetUser.user.usrCode);

					io.to(targetUser.user.usrCode).emit('call-aborded', {
						roomId: roomId,
						callerPeerId: peerId,
						caller: userSource,
						roomTitle: roomTitle,
					});
				}
			} else {
				socket.emit('userNotOnline', {
					message: "L'utilisateur n'est pas en ligne",
				});
			}
		},
	);

	// Accepter un appel
	socket.on('callAccept', async ({ from, to, peerId, roomId }) => {
		const callKey = `${to.caller.usrCode}-${from.usrCode}`;
		activeCalls.set(callKey, 'accepted');

		if (rooms[roomId]) {
			// Ajouter l'utilisateur qui accepte à la room
			rooms[roomId].participants.push({
				user: from,
				peerId: peerId,
				socketId: socket.id,
			});

			// Mettre à jour les informationscall-accepted de l'utilisateur
			const userInfo = connectedUsers.get(socket.id);

			if (userInfo) {
				//Mise à jour du roomId dans la liste des utilisateurs connecté
				userInfo.roomId = roomId;
				connectedUsers.set(socket.id, userInfo);
			}

			socket.join(roomId);

			// Informer l'appelant que l'appel a été accepté
			const caller = rooms[roomId].participants.find(
				p => p.user.usrCode === to.caller.usrCode,
			);

			if (caller) {
				socket.to(caller.user.usrCode).emit('call-accepted', {
					peerId: peerId,
					user: from,
					roomId: roomId,
				});
			}

			// Informer tous les participants de la room du nouvel arrivant
			socket.to(roomId).emit('user-joined-room', {
				user: from,
				peerId: peerId,
				roomId: roomId,
			});
		}
	});

	// Rejeter un appel
	socket.on('call-reject', ({ user, to }) => {
		console.log(`${user.usrName} rejette l'appel de ${to.usrName}`);
		const callKey = `${to.usrCode}-${user.usrCode}`;
		activeCalls.set(callKey, 'rejected');

		const targetUser = Array.from(connectedUsers.values()).find(
			u => u.user.usrCode === to.usrCode,
		);

		setTimeout(() => activeCalls.delete(callKey), 10000);

		if (targetUser) {
			io.to(targetUser.user.usrCode).emit('call-rejected', {
				rejectBy: user,
				message: `${user.usrFirstname} a rejeté votre appel`,
			});
		}
	});

	// Supprimer le room apres etre rejété
	socket.on('leave-Room-after-rejected', () => {
		const userInfo = connectedUsers.get(socket.id);

		if (userInfo && userInfo.roomId) {
			//Mise à jour du roomId dans la liste des utilisateurs connecté
			const roomId = userInfo.roomId;
			socket.leave(roomId);
			userInfo.roomId = null;
			connectedUsers.set(socket.id, userInfo);
		}
	});

	// Autoriser quelqu'un à rejoindre une room
	socket.on('canJoinRoom', ({ accepteBy, acceptedUser, peerId }) => {
		console.log(
			`${accepteBy.usrName} autorise ${acceptedUser.usrName} à rejoindre`,
		);

		const targetUser = Array.from(connectedUsers.values()).find(
			u => u.user.usrCode === acceptedUser.usrCode,
		);

		console.log('canJoinRoom targetUser', targetUser);

		if (targetUser) {
			const userInfo = connectedUsers.get(socket.id);
			const roomId = userInfo?.roomId;

			if (roomId && rooms[roomId]) {
				//Envoyer la list des peers de la room à l'utilisateur
				socket.to(targetUser.socketId).emit('join-room-accepted', {
					roomId: roomId,
					authorizedBy: accepteBy,
					participantPeerIds: rooms[roomId].participants.map(p => ({
						peerId: p.peerId,
						user: p.user,
					})),
				});

				// Notifier tous les participants de la room du nouvel arrivant
				socket.to(roomId).emit('notif-user-joined-room', {
					user: targetUser.user,
					authorizedBy: userInfo.user,
					roomId: roomId,
				});

				// Ajouter le nouvelle utilisateur dans la room
				rooms[roomId].participants.push({
					user: targetUser.user,
					peerId: peerId,
					socketId: targetUser.socketId,
				});

				connectedUsers.set(socket.id, {
					...targetUser,
					roomId: roomId,
				});
			}
		}
	});

	// Enregistrer le socket dans le room pour recevoir tous les evenements lié au room
	socket.on('register-me-to-room', roomId => {
		if (rooms[roomId]) {
			socket.join(roomId);
		}
	});

	// Rejoindre une room
	socket.on('JoiningRoom', async (data, callback) => {
		const { user, roomId, peerId } = data;

		console.log(`${user.usrName} rejoint la room ${roomId}`);

		if (rooms[roomId]) {
			let nextStep = false;
			// Vérifier si l'utilisateur n'est pas déjà dans la room
			const existingParticipant = rooms[roomId].participants.find(
				p => p.user.usrCode === user.usrCode,
			);
			const participantIsAutorised = rooms[roomId].authorizedUsers.find(
				p => p.usrCode === user.usrCode,
			);

			if (!existingParticipant) {
				if (rooms[roomId].isPublic === true) {
					nextStep = true;
				}

				if (participantIsAutorised) {
					nextStep = true;
				}
			}
			// Verifier si l'utilisateur est autorisé

			if (nextStep) {
				rooms[roomId].participants.push({
					user: user,
					peerId: peerId || 'peer-' + uuid(),
					socketId: socket.id,
				});

				// Mettre à jour les informations de l'utilisateur
				const userInfo = connectedUsers.get(socket.id);
				if (userInfo) {
					userInfo.roomId = roomId;
					connectedUsers.set(socket.id, userInfo);
				}

				socket.join(roomId);

				// Informer tous les autres participants
				socket.to(roomId).emit('user-joined-room', {
					user: user,
					roomId: roomId,
					roomTitle: rooms[roomId].roomTitle,
				});

				// Envoyer à l'utilisateur, la liste des participants avec leurs
				const dataToSend = {
					success: true,
					roomId: roomId,
					roomTitle: rooms[roomId].roomTitle,
					isPublic: rooms[roomId].isPublic,
					isMemorised: rooms[roomId].isMemorised,
					participants: rooms[roomId].participants
						.filter(p => p.socketId !== socket.id)
						.map(p => ({
							peerId: p.peerId,
							user: p.user,
						})),
				};

				if (callback) callback(dataToSend);
			}
		}
		if (callback) callback({ success: false, message: '' });
	});

	// Terminer un appel
	socket.on('callEnded', ({ user }) => {
		console.log(`${user?.usrName || 'Utilisateur'} termine l'appel`);

		const userInfo = connectedUsers.get(socket.id);
		const roomId = userInfo?.roomId;
		const peerId = userInfo?.peerId;

		if (roomId && rooms[roomId] && peerId) {
			// Supprimer l'utilisateur de la room
			rooms[roomId].participants = rooms[roomId].participants.filter(
				p => p.socketId !== socket.id,
			);

			// Si la room est vide, la supprimer
			if (rooms[roomId].participants.length === 0) {
				delete rooms[roomId];
			} else {
				// Informer les autres participants
				socket.to(roomId).emit('call-ended', {
					peerId: peerId,
					leftUser: userInfo?.user,
				});
			}

			// Mettre à jour les informations de l'utilisateur
			if (userInfo) {
				userInfo.roomId = null;
				connectedUsers.set(socket.id, userInfo);
			}

			socket.leave(roomId);
		}

		// Informer le client qu'il peut nettoyer ses connexions
		socket.emit('cleanup-connections');
	});

	// Gestion des demandes de room
	socket.on('get-room-list', async callback => {
		const userInfo = connectedUsers.get(socket.id);

		const roomList = Object.values(rooms)
			.filter(room => {
				if (room.authorizedUsers) {
					const isAutorised = !!room.authorizedUsers.find(
						u => u.usr_code === userInfo.user.usrCode,
					);

					return isAutorised;
				}
				return false;
			})
			.map(room => ({
				roomId: room.roomId,
				roomTitle: room.roomTitle,
				isMemorised: room.isMemorised,
				participantCount: room.participants.length,
				participants: room.participants.map(p => ({
					user: p.user,
					peerId: p.peerId,
				})),
				authorizedUsers: room.authorizedUsers,
			}));

		if (callback) callback({ success: true, roomList: roomList });
	});

	// Créer une room
	socket.on('create-momorised-room', async (data, callback) => {
		const roomAccess = data.isPublic ? 'public' : 'private';
		const roomId = `room-${roomAccess}-` + uuid();

		rooms[roomId] = {
			roomId: roomId,
			roomTitle: data.roomTitle,
			isPublic: data.isPublic,
			isMemorised: true,
			participants: [],
			authorizedUsers: data.autorisedUser || [],
		};

		// Ajouter le créateur à la room
		const userInfo = connectedUsers.get(socket.id);
		if (userInfo) {
			rooms[roomId].participants.push({
				user: userInfo.user,
				peerId: userInfo.peerId,
				socketId: socket.id,
				isCreator: true,
			});

			userInfo.roomId = roomId;
			connectedUsers.set(socket.id, userInfo);
			socket.join(roomId);
		}

		if (callback) callback({ success: true, roomInfo: rooms[roomId] });
	});

	// Supprimer une room
	socket.on('delete-room', async (roomId, callback) => {
		const userInfo = connectedUsers.get(socket.id);
		let result;

		if (rooms[roomId]) {
			// Vérifier si l'utilisateur est le créateur
			const isCreator = rooms[roomId].participants.some(
				p => p.socketId === socket.id && p.isCreator,
			);

			if (isCreator) {
				// Informer tous les participants que la room est supprimée
				socket.to(roomId).emit('room-deleted', { roomId: roomId });

				// Supprimer la room
				delete rooms[roomId];
				result = { success: true, message: 'room deleted' };
			} else {
				result = { success: false, message: 'Unauthorized' };
			}
		} else {
			result = { success: false, message: 'Room not found' };
		}

		if (callback) callback(result);
	});

	// Gestion de la déconnexion
	socket.on('disconnect', () => {
		console.log('Socket déconnecté:', socket.id);

		const userInfo = connectedUsers.get(socket.id);

		if (userInfo) {
			const { roomId, user, peerId } = userInfo;

			// Supprimer de la room si présent
			if (roomId && rooms[roomId]) {
				rooms[roomId].participants = rooms[roomId].participants.filter(
					p => p.socketId !== socket.id,
				);

				// Informer les autres participants
				socket.to(roomId).emit('user-left-room', {
					user: user,
					peerId: peerId,
				});

				// Supprimer la room si vide
				if (rooms[roomId].participants.length === 0) {
					delete rooms[roomId];
				}
			}

			// Supprimer des utilisateurs connectés
			connectedUsers.delete(socket.id);

			// Mettre à jour la liste des peers pour tous les clients
			const peersList = Array.from(connectedUsers.values()).map(u => ({
				peerId: u.peerId,
				user: u.user,
				socketId: u.socketId,
				roomId: u.roomId,
			}));

			io.emit('peer-list', peersList);
			io.emit('user-disconnected', { user, peerId });
		}
	});

	socket.on('audio-is-mute', audioIsMute => {
		const userInfo = connectedUsers.get(socket.id);
		if (userInfo.roomId) {
			socket.to(userInfo.roomId).emit('audio-is-mute', {
				peerId: userInfo.peerId,
				audioIsMute: audioIsMute,
			});
		}
	});

	// Diffusion de messages dans une room
	socket.on('room-message', ({ roomId, message, user }) => {
		if (rooms[roomId]) {
			socket.to(roomId).emit('room-message', {
				message: message,
				user: user,
				timestamp: new Date().toISOString(),
			});
		}
	});

	// Obtenir les informations d'une room
	socket.on('get-room-info', ({ roomId }) => {
		if (rooms[roomId]) {
			socket.emit('room-info', {
				roomId: roomId,
				roomTitle: rooms[roomId].roomTitle,
				isPublic: rooms[roomId].isPublic,
				isMemorised: rooms[roomId].isMemorised,
				participants: rooms[roomId].participants.map(p => ({
					user: p.user,
					peerId: p.peerId,
					isCreator: p.isCreator || false,
				})),
			});
		} else {
			socket.emit('room-info', { error: 'Room not found' });
		}
	});
};

// Fonction pour nettoyer les rooms vides
const cleanupEmptyRooms = () => {
	Object.keys(rooms).forEach(roomId => {
		if (rooms[roomId].participants.length === 0 && !rooms[roomId].isMemorised) {
			delete rooms[roomId];
		}
	});
};

// Nettoyer les rooms vides toutes les 1 minutes
setInterval(cleanupEmptyRooms, 1 * 60 * 1000);

// Fonction utilitaire pour obtenir la liste des utilisateurs
const getUserInfoList = async io => {
	const sockets = await io.fetchSockets();
	let usersList = [];

	sockets.forEach(socket => {
		const userInfo = connectedUsers.get(socket.id);
		if (userInfo) {
			usersList.push({
				userID: socket.id,
				roomId: userInfo.roomId,
				peerId: userInfo.peerId,
				user: userInfo.user,
				...socket.handshake.auth,
			});
		}
	});

	return usersList;
};
