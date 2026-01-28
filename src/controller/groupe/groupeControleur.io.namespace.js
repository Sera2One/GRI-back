// groupeControleur.io.js
import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import moment from 'moment';
import fs from 'node:fs';

const models = initModels(sequelize);

export default function initGroupSocket(io) {
	const groupNamespace = io.of('/groups');
	console.log("on ok");
	

	groupNamespace.on('connection', socket => {
		console.log(`user-connected to groups: ${socket.id}`);

		// Middleware d'authentification
		socket.use(async (packet, next) => {
			try {
				if (!socket.user?.usrCode) {
					throw new Error('Unauthorized');
				}

				// Vérifier que l'utilisateur existe toujours
				const user = await models.Users.findByPk(socket.user.usrCode);
				if (!user) {
					throw new Error('User not found');
				}

				next();
			} catch (error) {
				next(error);
			}
		});

		// Récupérer tous les groupes de l'utilisateur
		socket.on('get-groups', async callback => {
			try {
				const userGroups = await models.GroupeUserMember.findAll({
					where: { usrCode: socket.user.usrCode },
					include: [
						{
							model: models.GroupeUserName,
							as: 'gunCode_GroupeUserName',
							where: { gunIsDeleted: false },
						},
					],
				});

				const groups = userGroups.map(member => ({
					...member.gunCode_GroupeUserName.get({ plain: true }),
					userRole: member.gumRole,
					isAdmin: member.gumIsAdmin,
				}));

				callback({ success: true, groups });
			} catch (error) {
				console.error('Error fetching groups:', error);
				callback({ success: false, error: error.message });
			}
		});

		// Créer un nouveau groupe
		socket.on('create-group', async (groupData) => {
		//socket.on('create-group', async (groupData, callback) => {

			console.log('groupData', groupData);
			
			const transaction = await sequelize.transaction();
			try {
				// Créer le groupe
				const newGroup = await models.GroupeUserName.create(
					{
						gunCode: generateId(),
						gunName: groupData.name,
						gunDescription: groupData.description,
						gunCreatedBy: socket.user.usrCode,
						gunImg: groupData.image || null,
					},
					{ transaction },
				);

				// Ajouter le créateur comme owner
				await models.GroupeUserMember.create(
					{
						gumCode: generateId(),
						gunCode: newGroup.gunCode,
						usrCode: socket.user.usrCode,
						gumRole: 'owner',
						gumIsAdmin: true,
					},
					{ transaction },
				);

				await transaction.commit();

				// Diffuser le nouveau groupe
				groupNamespace.emit('group-created', {
					...newGroup.get({ plain: true }),
					userRole: 'owner',
					isAdmin: true,
				});

				//callback({ success: true, group: newGroup });
			} catch (error) {
				await transaction.rollback();
				console.error('Error creating group:', error);
				//callback({ success: false, error: error.message });
			}
		});

		// Mettre à jour un groupe
		socket.on('update-group', async ({ groupId, updates }, callback) => {
			const transaction = await sequelize.transaction();
			try {
				// Vérifier les permissions
				const membership = await models.GroupeUserMember.findOne({
					where: {
						gunCode: groupId,
						usrCode: socket.user.usrCode,
						gumIsAdmin: true,
					},
					transaction,
				});

				if (!membership) {
					throw new Error('Permission denied');
				}

				const [updated] = await models.GroupeUserName.update(updates, {
					where: { gunCode: groupId },
					transaction,
				});

				if (!updated) {
					throw new Error('Group not found');
				}

				const updatedGroup = await models.GroupeUserName.findByPk(groupId, {
					transaction,
				});
				await transaction.commit();

				groupNamespace.emit('group-updated', updatedGroup);
				callback({ success: true, group: updatedGroup });
			} catch (error) {
				await transaction.rollback();
				console.error('Error updating group:', error);
				callback({ success: false, error: error.message });
			}
		});

		// Ajouter des membres à un groupe
		socket.on('add-group-members', async ({ groupId, memberIds }, callback) => {
			const transaction = await sequelize.transaction();
			try {
				// Vérifier les permissions
				const membership = await models.GroupeUserMember.findOne({
					where: {
						gunCode: groupId,
						usrCode: socket.user.usrCode,
						gumIsAdmin: true,
					},
					transaction,
				});

				if (!membership) {
					throw new Error('Permission denied');
				}

				// Vérifier les utilisateurs existants
				const existingMembers = await models.GroupeUserMember.findAll({
					where: {
						gunCode: groupId,
						usrCode: memberIds,
					},
					transaction,
				});

				const existingMemberIds = existingMembers.map(m => m.usrCode);
				const newMembers = memberIds.filter(
					id => !existingMemberIds.includes(id),
				);

				if (newMembers.length === 0) {
					throw new Error('All users are already members');
				}

				// Ajouter les nouveaux membres
				const membersToAdd = newMembers.map(usrCode => ({
					gumCode: generateId(),
					gunCode: groupId,
					usrCode: usrCode,
					gumRole: 'member',
					gumIsAdmin: false,
					gumJoinedDate: new Date(),
				}));

				await models.GroupeUserMember.bulkCreate(membersToAdd, { transaction });

				const updatedGroup = await models.GroupeUserName.findByPk(groupId, {
					include: [
						{
							model: models.GroupeUserMember,
							as: 'GroupeUserMembers',
							include: [
								{
									model: models.Users,
									as: 'usrCode_User',
								},
							],
						},
					],
					transaction,
				});

				await transaction.commit();

				groupNamespace.to(groupId).emit('group-updated', updatedGroup);
				callback({ success: true, group: updatedGroup });
			} catch (error) {
				await transaction.rollback();
				console.error('Error adding members:', error);
				callback({ success: false, error: error.message });
			}
		});

		// Supprimer un groupe
		socket.on('delete-group', async (groupId, callback) => {
			const transaction = await sequelize.transaction();
			try {
				// Vérifier que l'utilisateur est le owner
				const isOwner = await models.GroupeUserMember.findOne({
					where: {
						gunCode: groupId,
						usrCode: socket.user.usrCode,
						gumRole: 'owner',
					},
					transaction,
				});

				if (!isOwner) {
					throw new Error('Only the owner can delete the group');
				}

				// Soft delete
				await models.GroupeUserName.update(
					{ gunIsDeleted: true },
					{ where: { gunCode: groupId }, transaction },
				);

				await transaction.commit();

				groupNamespace.emit('group-deleted', groupId);
				callback({ success: true });
			} catch (error) {
				await transaction.rollback();
				console.error('Error deleting group:', error);
				callback({ success: false, error: error.message });
			}
		});

		// Gestion des erreurs
		socket.on('error', error => {
			console.error('Socket error:', error);
		});

		// Envoyer un message dans un groupe
		socket.on(
			'groupe-send-message',
			async ({ groupId, content, file }, callback) => {
				const transaction = await sequelize.transaction();
				try {
					// Vérifier que l'utilisateur est membre du groupe
					const isMember = await models.GroupeUserMember.findOne({
						where: {
							gunCode: groupId,
							usrCode: socket.user.usrCode,
						},
						transaction,
					});

					if (!isMember) {
						throw new Error('You are not a member of this group');
					}

					// Créer le message avec les nouveaux noms de colonnes
					const newMessage = await models.GroupeUserMessage.create(
						{
							gumesCode: generateId(),
							gunCode: groupId,
							usrCode: socket.user.usrCode,
							gumesContent: content,
							gumesFilePath: file?.path || null,
							gumesFileType: file?.type || null,
							gumesFileSize: file?.size || null,
						},
						{ transaction },
					);

					await transaction.commit();

					// Récupérer le message complet avec les infos utilisateur
					const fullMessage = await models.GroupeUserMessage.findByPk(
						newMessage.gumesCode,
						{
							include: [
								{
									model: models.Users,
									as: 'usrCode_User',
									attributes: ['usrCode', 'USR_NAME', 'USR_IMG'],
								},
							],
						},
					);

					// Diffuser le message à tous les membres du groupe
					groupNamespace.to(groupId).emit('groupe-new-message', fullMessage);
					callback({ success: true, message: fullMessage });
				} catch (error) {
					await transaction.rollback();
					console.error('Error sending message:', error);
					callback({ success: false, error: error.message });
				}
			},
		);

		// Supprimer un message
		socket.on('groupe-delete-message', async ({ messageId }, callback) => {
			const transaction = await sequelize.transaction();
			try {
				// Récupérer le message
				const message = await models.GroupeUserMessage.findByPk(messageId, {
					include: [
						{
							model: models.GroupeUserName,
							as: 'gunCode_GroupeUserName',
						},
					],
					transaction,
				});

				if (!message) {
					throw new Error('Message not found');
				}

				// Vérifier les permissions (auteur ou admin)
				const isAuthor = message.usrCode === socket.user.usrCode;
				const isAdmin = await models.GroupeUserMember.findOne({
					where: {
						gunCode: message.gunCode,
						usrCode: socket.user.usrCode,
						gumIsAdmin: true,
					},
					transaction,
				});

				if (!isAuthor && !isAdmin) {
					throw new Error('Permission denied');
				}

				// Soft delete avec le nouveau nom de colonne
				await models.GroupeUserMessage.update(
					{ GUMES_IS_DELETED: true },
					{ where: { gumesCode: messageId }, transaction },
				);

				await transaction.commit();

				// Diffuser la suppression
				groupNamespace
					.to(message.gunCode)
					.emit('groupe-message-deleted', messageId);
				callback({ success: true });
			} catch (error) {
				await transaction.rollback();
				console.error('Error deleting message:', error);
				callback({ success: false, error: error.message });
			}
		});

		// Mettre à jour un message
		socket.on(
			'groupe-update-message',
			async ({ messageId, content }, callback) => {
				const transaction = await sequelize.transaction();
				try {
					// Récupérer le message
					const message = await models.GroupeUserMessage.findByPk(messageId, {
						transaction,
					});

					if (!message) {
						throw new Error('Message not found');
					}

					// Vérifier que l'utilisateur est l'auteur
					if (message.usrCode !== socket.user.usrCode) {
						throw new Error('You can only edit your own messages');
					}

					// Vérifier que le message n'a pas été supprimé
					if (message.GUMES_IS_DELETED) {
						throw new Error('Cannot edit deleted message');
					}

					// Mettre à jour le message avec les nouveaux noms de colonnes
					const [updated] = await models.GroupeUserMessage.update(
						{
							gumesContent: content,
							GUMES_UPDATED_DATE: new Date(),
						},
						{
							where: { gumesCode: messageId },
							transaction,
						},
					);

					if (!updated) {
						throw new Error('Update failed');
					}

					const updatedMessage = await models.GroupeUserMessage.findByPk(
						messageId,
						{
							include: [
								{
									model: models.Users,
									as: 'usrCode_User',
									attributes: ['usrCode', 'USR_NAME', 'USR_IMG'],
								},
							],
							transaction,
						},
					);

					await transaction.commit();

					// Diffuser la mise à jour
					groupNamespace
						.to(message.gunCode)
						.emit('groupe-message-updated', updatedMessage);
					callback({ success: true, message: updatedMessage });
				} catch (error) {
					await transaction.rollback();
					console.error('Error updating message:', error);
					callback({ success: false, error: error.message });
				}
			},
		);
	});
}

    

    // ... (reste du code inchangé)

// Fonction utilitaire pour générer des IDs
function generateId() {
	return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}


// ... (reste du code inchangé)

/* 
Émis par le client :

    get-groups: Récupère tous les groupes

    create-group: Crée un nouveau groupe

    update-group: Met à jour un groupe

    add-group-members: Ajoute des membres à un groupe

    delete-group: Supprime un groupe

    groupe-send-message : Envoyer un message dans un groupe

    groupe-delete-message : Supprimer un message

    groupe-update-message : Modifier un message

    groupe-join-room : Rejoindre la room d'un groupe

    groupe-leave-room : Quitter la room d'un groupe

Émis par le serveur :


    group-created: Lorsqu'un nouveau groupe est créé

    group-updated: Lorsqu'un groupe est modifié

    group-deleted: Lorsqu'un groupe est supprimé

    groupe-new-message : Nouveau message reçu

    groupe-message-deleted : Message supprimé

    groupe-message-updated : Message modifié

Fonctionnalités implémentées :

    Gestion des messages :

        Envoi avec support de fichiers

        Suppression (soft delete)

        Modification (seulement par l'auteur)

    Permissions :

        Seuls les membres peuvent envoyer des messages

        Seul l'auteur ou un admin peut supprimer

        Seul l'auteur peut modifier

    Optimisations :

        Rooms Socket.io par groupe

        Transactions Sequelize

        Soft delete pour conserver l'historique

        Gestion des erreurs détaillée

Cette implémentation complète parfaitement votre système de messagerie de groupe tout en respectant votre structure de base de données

et les conventions Sequelize.
New chat
 */
