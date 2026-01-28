import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
const models = initModels(sequelize);

/**
 * Crée une notification en BDD + émet via Socket.IO
 * @param {Object} value
 * @param {string} value.notifType - Type de notification (valeur possible: "COMMENT_POSTED",
	"COMMENT_REPLIED",
	"MESSAGE_RECEIVED",
	"CALL_INVITATION",
	"GROUP_INVITATION",
	"USER_VALIDATION_REQUEST",
	"USER_VALIDATED",
	"USER_REJECTED",
	"ACCESS_GRANTED",
	"FILE_ARCHIVED",
	"MENTION",
	"CALL_STARTED",
	"ADMIN_MESSAGE",
	"MISSED_CALL",
	"ROLE_CHANGED")
 * @param {string} value.userCode - À qui notifier (ce-lui qui appartient la notification)
 * @param {string} value.notifActorCode - Qui a déclenché l'action
 * @param {string} value.notifTargetType - Type d'entité cible (ex: 'Post', 'Comment')
 * @param {string} value.notifTargetCode - ID métier de l'entité cible
 * @param {Object} value.notifExtra - Données supplémentaires (JSONB)
 * @param {number} value.notifPriority - 0=normal, 1=haute, 2=urgente
 * @param {string} value.notifChannel - Valeurs possible 'in_app', 'email','sms',
 * @param {Object} value.notifActorCodeUser - information sur notifActorCode
 * @param {string} value.notifBody - notification extra admin message seulement 
 * @param {string} value.notifTitle
 * @param {string} value.notifExtra
 * --- Cas 1 notifType = COMMENT_REPLIED ,
 *     notifExtra ={"postCode": "post_ID","replyCode": "comment_ID","replyContent": "TEXT" }
 * --- Cas 2 notifType = MESSAGE_RECEIVED
 *     notifExtra ={"msgCode": "message_ID","msgContent": "TEXT" }
 * --- Cas 3 notifType = GROUP_INVITATION
 *     notifExtra = {"grpCode": "groupe_ID","grpName": "TEXT" }
 * --- Cas 4 notifType = GROUP_INVITATION
 *     notifExtra = {"grpCode": "groupe_ID","grpName": "TEXT", "grpDescription": "TEXT || null" }
 * --- Cas 5 notifType = 
 * 	CALL_INVITATION , 
 *    USER_VALIDATION_REQUEST , 
 *    USER_VALIDATED ,
 *    USER_REJECTED,
 *    ACCESS_GRANTED,
 *    FILE_ARCHIVED,
 *	MENTION,
 *	CALL_STARTED,
 *	ADMIN_MESSAGE,
 *	MISSED_CALL,
 *	ROLE_CHANGED
 *    notifExtra = null
	{
		"message": "Il y a 2 notification pour l'utilisateur  user-1. page 1/1",
		"data": [
				{
						"notifCode": "notif-16",
						"userCode": "user-1",
						"notifType": "COMMENT_POSTED",
						"notifActorCode": "user-8",
						"notifTargetCode": "post-1",
						"notifTargetType": "Post",
						"notifTitle": null,
						"notifBody": null,
						"notifActorIsRead": false,
						"notifActorReadDate": null,
						"notifActorCreatedDate": "2025-09-12T08:27:00.266Z",
						"notifPriority": 0,
						"notifExpiresAt": "2025-12-11T08:27:00.264Z",
						"notifExtra": {
							"commentCode": "cmt-52",
							"commentContent": "bonjour"
						},
						"notifChannel": "in_app",
						"notifActorCodeUser": {
							"usr_code": "user-8",
							"usr_name": "Jean",
							"usr_firstname": "DERA",
							"usr_mail": "dera@gmail.com",
							"usr_img": "/Images/Profile/user-8/2025-06-10_13-46-53.jpg"
						}
				},
				{
                              "notifCode": "notif-24",
                              "userCode": "user-8",
                              "notifType": "COMMENT_REPLIED",
                              "notifActorCode": "user-1",
                              "notifTargetCode": "cmt-58",
                              "notifTargetType": "Comment",
                              "notifTitle": null,
                              "notifBody": null,
                              "notifActorIsRead": false,
                              "notifActorReadDate": null,
                              "notifActorCreatedDate": "2025-09-12T11:39:37.813Z",
                              "notifPriority": 0,
                              "notifExpiresAt": "2025-12-11T11:39:37.813Z",
                              "notifExtra": {
                                        "postCode": "post-10",
                                        "replyCode": "cmt-59",
                                        "replyContent": "OK aa"
                              },
                              "notifChannel": "in_app",
                              "notifActorCodeUser": {
                                        "usr_code": "user-1",
                                        "usr_name": "Jean Jacques Séraphin",
                                        "usr_firstname": "HERINANDRIANA",
                                        "usr_mail": "herinandrianajjs@gmail.com",
                                        "usr_img": "/Images/Profile/user-1/2025-06-07_07-24-23.png"
                              }
                    }
				
		],
		"page": 1,
		"nbPage": 1,
		"count": 3
	}
 */
export const getNotifications = async (req, res) => {
	const limit = parseInt(req.query.limit) || 20;
	const page = parseInt(req.query.page) || 1;
	const usrCode = req.query.usrCode;
	const offset = (page - 1) * limit;

	try {
		// 1. Récupérer les notifications
		const { count, rows: notifications } =
			await models.Notifications.findAndCountAll({
				where: {
					userCode: usrCode,
				},
				include: [
					{
						as: 'notifActorCodeUser',
						model: models.Users,
						attributes: [
							'usr_code',
							'usr_name',
							'usr_firstname',
							'usr_mail',
							'usr_img',
						],
					},
				],
				order: [['notifActorCreatedDate', 'DESC']],
				offset: offset,
				limit: limit,
				raw: true,
				nest: true,
			});

		// 2. Extraire TOUS les usrCode à charger (dernier acteur + contributeurs uniques)
		const userCodesToLoad = new Set();

		for (const notif of notifications) {
			// Dernier acteur (déjà dans notifActorCodeUser, mais on le prend au cas où)
			if (notif.notifActorCode) {
				userCodesToLoad.add(notif.notifActorCode);
			}

			// Dernier acteur dans notifExtra (fallback)
			if (notif.notifExtra?.lastActorCode) {
				userCodesToLoad.add(notif.notifExtra.lastActorCode);
			}

			// Tous les contributeurs uniques
			if (Array.isArray(notif.notifExtra?.itemUsersCodes)) {
				notif.notifExtra.itemUsersCodes.forEach(code => {
					if (code) userCodesToLoad.add(code);
				});
			}
		}		

		// 3. Charger TOUS les utilisateurs en une seule requête
		const userCodesArray = [...userCodesToLoad];
		const users = userCodesArray.length
			? await models.Users.findAll({
					where: {
						usrCode: userCodesArray,
					},
					attributes: ['usr_code', 'usr_name', 'usr_firstname', 'usr_img'],
					raw: true,
					nest: true,
			  })
			: [];

		// Créer un dictionnaire pour accès rapide
		const userMap = {};
		users.forEach(user => {
			userMap[user.usr_code] = user;
		});

		// 4. Enrichir chaque notification avec les infos utilisateurs
		const enrichedNotifications = notifications.map(notif => {
			// Dernier acteur (si pas déjà chargé via include)
			if (!notif.notifActorCodeUser && notif.notifExtra?.lastActorCode) {
				notif.notifActorCodeUser =
					userMap[notif.notifExtra.lastActorCode] || null;
			}

			// Liste des contributeurs uniques avec leurs infos
			if (Array.isArray(notif.notifExtra?.itemUsersCodes)) {
				const uniqueUserCodes = [
					...new Set(notif.notifExtra.itemUsersCodes.filter(Boolean)),
				];
				notif.contributors = uniqueUserCodes
					.map(code => userMap[code])
					.filter(Boolean);
			} else {
				notif.contributors = [];
			}

			return notif;
		});

		const nbPage = Math.ceil(count / limit);

		const result = {
			message: `Il y a ${count} notification(s) pour l'utilisateur ${usrCode}. Page ${page}/${nbPage}`,
			data: enrichedNotifications,
			page: page,
			nbPage: nbPage,
			count: count,
		};

		res.json(result);
	} catch (error) {
		console.error('Error getting notification:', error);
		res.status(500).json({ message: 'Erreur serveur', error: error.message });
	}
};

export const markAllRead = async (req, res) => {
	try {
		await models.Notifications.update(
			{ notifActorIsRead: true },
			{ where: { userCode: req.query.usrCode } },
		);
		res.json({ success: true });
	} catch (e) {
		console.error(e);
		res.status(500).json({ message: 'Serveur erreur', error: e.message });
	}
};

export const markAsRead = async (req, res) => {		
	try {
		
		await models.Notifications.update(
			{
				notifActorIsRead: true,
				notifActorReadDate: new Date(),
			},
			{ where: { notifCode: req.query.notifCode } },
		);
		res.json({ success: true });
	} catch (e) {
		console.error(e);
		res.status(500).json({ message: 'Serveur erreur', error: e.message });
	}
};
