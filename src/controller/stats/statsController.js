import { sequelize } from '../../db/config/database.js';
import { Op } from 'sequelize';
import initModels from '../../db/models/init-models.js';
import json2csv from 'json2csv';
import '../../services/env.js';
import fs from 'node:fs';
import path from 'path';
import { getSystemUptime } from '../../services/systemUptime.js';

const { Parser } = json2csv;


const models = initModels(sequelize);
const publicFolder = process.env.APP_PUBLIC_FOLDER;

// =========================================================
// GET /api/v1/admin/sessions/stats
// =========================================================
export const getSessionStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Sessions actives
    const activeSessions = await models.Session.count({
      where: { sessionIsActive: true, sessionExpiresAt: { [Op.gt]: now } },
    });

    // 2. Utilisateurs uniques actifs
    const activeUsers = await models.Session.count({
      where: { sessionIsActive: true, sessionExpiresAt: { [Op.gt]: now } },
      distinct: true,
      col: 'usrCode',
    });

    // 3. Nouvelles sessions aujourd'hui
    const newSessionsToday = await models.Session.count({
      where: { sessionCreatedDate: { [Op.gte]: startOfDay } },
    });

    // 4. Sessions par navigateur (top 5) → PostgreSQL syntax + snake_case
    const browserStats = await models.Session.findAll({
      attributes: [
        [
          sequelize.literal(`"session_browser_info"->'browser'->>'name'`),
          'browser',
        ],
        [sequelize.fn('COUNT', sequelize.col('session_code')), 'count'],
      ],
      where: {
        sessionBrowserInfo: { [Op.not]: null },
        [Op.and]: sequelize.literal(`"session_browser_info"->'browser'->>'name' IS NOT NULL`),
      },
      group: [sequelize.literal(`"session_browser_info"->'browser'->>'name'`)],
      order: [[sequelize.fn('COUNT', sequelize.col('session_code')), 'DESC']],
      limit: 5,
      raw: true,
    });

    // 5. Sessions par système d'exploitation → PostgreSQL syntax + snake_case
    const osStats = await models.Session.findAll({
      attributes: [
        [
          sequelize.literal(`"session_browser_info"->'os'->>'name'`),
          'os',
        ],
        [sequelize.fn('COUNT', sequelize.col('session_code')), 'count'],
      ],
      where: {
        sessionBrowserInfo: { [Op.not]: null },
        [Op.and]: sequelize.literal(`"session_browser_info"->'os'->>'name' IS NOT NULL`),
      },
      group: [sequelize.literal(`"session_browser_info"->'os'->>'name'`)],
      order: [[sequelize.fn('COUNT', sequelize.col('session_code')), 'DESC']],
      raw: true,
    });

    // 6. Activité par heure (dernières 24h)
    const hourlyActivity = await models.Session.findAll({
      attributes: [
        [
          sequelize.fn(
            'EXTRACT',
            sequelize.literal('HOUR FROM "session_created_date"'),
          ),
          'hour',
        ],
        [sequelize.fn('COUNT', sequelize.col('session_code')), 'count'],
      ],
      where: {
        sessionCreatedDate: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      group: [sequelize.literal(`EXTRACT(HOUR FROM "session_created_date")`)],
      order: [[sequelize.literal(`EXTRACT(HOUR FROM "session_created_date")`), 'ASC']],
      raw: true,
    });

    // Générer un tableau de 24 heures (même vides)
    const activityByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyActivity.find((h) => parseInt(h.hour) === i)?.count || 0,
    }));

    res.json({
			success: true,
			activeSessions,
			activeUsers,
			newSessionsToday,
			browserStats: browserStats.map(b => ({
				browser: b.browser?.trim() || 'Inconnu',
				count: parseInt(b.count),
			})),
			osStats: osStats.map(o => ({
				os: o.os?.trim() || 'Inconnu',
				count: parseInt(o.count),
			})),
			activityByHour,
		});
  } catch (error) {
    console.error('Erreur stats sessions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Fonction utilitaire pour formater l'uptime
function formatUptime(startDate) {
  if (!startDate) return 'Inconnu';
  const now = new Date();
  const diffMs = now - new Date(startDate);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} jour(s), ${hours} heure(s), ${minutes} minute(s)`;
}

// =========================================================
// GET /api/v1/admin/stats
// =========================================================
export const getAdminStats = async (req, res) => {
  try {
		const now = new Date();
		const past48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
		const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		// =============================
		// STATE
		// =============================

		// 1. Utilisateurs en ligne (sessions actives non expirées)
		const onlineUsers = await models.Session.count({
			where: {
				sessionIsActive: true,
				sessionUserIsOnline: true,
				sessionExpiresAt: { [Op.gt]: now },
			},
			distinct: true,
			col: 'usrCode',
		});

		// 2. Messages (posts + commentaires) sur 48h
		const postsLast48h = await models.Post.count({
			where: { postCreatedDate: { [Op.gte]: past48h } },
		});

		const commentsLast48h = await models.Comment.count({
			where: { cmtCreatedDate: { [Op.gte]: past48h } },
		});

		const messagesLast48h = postsLast48h + commentsLast48h;

		// 3. Groupes actifs (avec au moins 1 membre non supprimé)
		const activeGroups = await models.GroupeUserMember.count({
			where: { gumUserIsDeleted: false },
			distinct: true,
			col: 'gunCode',
		});

		// 4. Stockage utilisé (PostFileJoint + MsgFileJoint)
		// On suppose que msgFileSize et pfjSize sont des strings représentant des octets
		// Pour PostFileJoint
		const postStorageResult = await models.PostFileJoint.findOne({
			attributes: [
				[
					sequelize.fn(
						'SUM',
						sequelize.cast(sequelize.col('pfj_size'), 'BIGINT'),
					),
					'totalBytes',
				],
			],
			where: {
				pfjIsDeleted: false,
				pfjSize: { [Op.not]: null, [Op.regexp]: '^[0-9]+$' }, // sécurité : que des chiffres
			},
			raw: true,
		});

		const postFilesStorageResult = parseInt(postStorageResult?.totalBytes || 0);

		console.log('postFilesStorageResult', postFilesStorageResult);

		// Pour MsgFileJoint
		const messageStorageResult = await models.MsgFileJoint.findOne({
			attributes: [
				[
					sequelize.fn(
						'SUM',
						sequelize.cast(sequelize.col('msg_file_size'), 'BIGINT'),
					),
					'totalBytes',
				],
			],
			where: {
				msgFileIsDeleted: false,
				msgFileSize: { [Op.not]: null, [Op.regexp]: '^[0-9]+$' },
			},
			raw: true,
		});

		const messageFilesStorageResult = parseInt(
			messageStorageResult?.totalBytes || 0,
		);

		// Gérer les valeurs null
		const postFilesStorage = postFilesStorageResult || 0;
		const messageFilesStorage = messageFilesStorageResult || 0;

		const totalBytes =
			parseInt(postFilesStorage || 0) + parseInt(messageFilesStorage || 0);
		const totalGB = (totalBytes / 1024 ** 3).toFixed(2); // Convertir en Go

		const publicStorageLimitGB =
			parseFloat(process.env.APP_PUBLIC_FOLDER_LIMIT_GB) || 20;
		const storageUsedPercent = Math.min(
			100,
			((totalBytes / (publicStorageLimitGB * 1024 ** 3)) * 100).toFixed(1),
		);

		// =============================
		// ACTIVITÉ RÉCENTE
		// =============================

		// 5. Nouveaux utilisateurs non validés
		const newUnvalidatedUsers = await models.Users.count({
			where: {
				usrIsValided: false,
				usrCreatedDate: { [Op.gte]: past48h },
			},
		});

		// 6. Pic d'activité (messages/posts par heure dernières 24h)
		const hourlyPosts = await models.Post.findAll({
			attributes: [
				[
					sequelize.fn(
						'EXTRACT',
						sequelize.literal('HOUR FROM "post_created_date"'),
					),
					'hour',
				],
				[sequelize.fn('COUNT', sequelize.col('post_code')), 'count'],
			],
			where: {
				postCreatedDate: { [Op.gte]: past24h },
			},
			group: [sequelize.literal(`EXTRACT(HOUR FROM "post_created_date")`)],
			raw: true,
		});

		const hourlyComments = await models.Comment.findAll({
			attributes: [
				[
					sequelize.fn(
						'EXTRACT',
						sequelize.literal('HOUR FROM "cmt_created_date"'),
					),
					'hour',
				],
				[sequelize.fn('COUNT', sequelize.col('cmt_code')), 'count'],
			],
			where: {
				cmtCreatedDate: { [Op.gte]: past24h },
			},
			group: [sequelize.literal(`EXTRACT(HOUR FROM "cmt_created_date")`)],
			raw: true,
		});

		// Fusionner posts + commentaires par heure
		const hourlyActivityMap = {};

		[...hourlyPosts, ...hourlyComments].forEach(item => {
			const hour = parseInt(item.hour);
			const count = parseInt(item.count);
			hourlyActivityMap[hour] = (hourlyActivityMap[hour] || 0) + count;
		});

		let peakHour = { hour: 0, count: 0 };
		for (const [hour, count] of Object.entries(hourlyActivityMap)) {
			if (count > peakHour.count) {
				peakHour = { hour: parseInt(hour), count };
			}
		}

		// Si aucune activité, on met 0
		if (Object.keys(hourlyActivityMap).length === 0) {
			peakHour = { hour: new Date().getHours(), count: 0 };
		}

		// =============================
		// ÉTAT DU SYSTÈME
		// =============================

		// Nouveau : uptime système via commande Linux
		let uptime = 'Inconnu';
		try {
			const bootTime = await getSystemUptime();			
			uptime = formatUptime(bootTime);
		} catch (err) {
			console.error('Erreur lors de la récupération de l’uptime système:', err);
			uptime = 'Erreur système';
		}

		// 8. Pic d'utilisateurs en ligne → approximation via sessions uniques par heure dernières 24h
		const hourlyOnlineUsers = await models.Session.findAll({
			attributes: [
				[
					sequelize.fn(
						'EXTRACT',
						sequelize.literal('HOUR FROM "session_created_date"'),
					),
					'hour',
				],
				[sequelize.fn('COUNT', sequelize.col('usr_code')), 'userCount'],
			],
			where: {
				sessionCreatedDate: { [Op.gte]: past24h },
				sessionIsActive: true,
				sessionUserIsOnline: true,
				sessionExpiresAt: { [Op.gt]: now },
			},
			group: [sequelize.literal(`EXTRACT(HOUR FROM "session_created_date")`)],
			raw: true,
		});

		let peakOnlineUsers = 0;
		hourlyOnlineUsers.forEach(record => {
			const count = parseInt(record.userCount);
			if (count > peakOnlineUsers) peakOnlineUsers = count;
		});

		// 9. Stats générales
		const totalUsers = await models.Users.count();
		const totalPosts = await models.Post.count({
			where: { postIsDeleted: false },
		});
		const totalComments = await models.Comment.count({
			where: { cmtIsDeleted: false },
		});

		// 10. Calculer la taille du dossier public
		let publicFolderBytes = 0;
		if (publicFolder && fs.existsSync(publicFolder)) {
			publicFolderBytes = getFolderSize(publicFolder);
		}

		const publicFolderGB = (publicFolderBytes / 1024 ** 3).toFixed(2);
		const publicFolderUsedPercent = Math.min(
			100,
			((publicFolderBytes / (publicStorageLimitGB * 1024 ** 3)) * 100).toFixed(
				1,
			),
		);

		// =============================
		// RÉPONSE FINALE
		// =============================

		const stats = {
			state: {
				onlineUsers,
				messagesLast48h,
				activeGroups,
				storageUsedPercent: parseFloat(storageUsedPercent),
				publicStorageLimitGB,
				storage: {
					postfile: postFilesStorage,
					messageFile: messageFilesStorage,
					used: publicFolderBytes,
					total: publicStorageLimitGB * 1024 ** 3,
				},
				storageUsed: `${totalGB} Go / ${publicStorageLimitGB} Go`,
				publicFolderUsed: `${publicFolderGB} Go / ${publicStorageLimitGB} Go`,
				publicFolderUsedPercent: parseFloat(publicFolderUsedPercent),
			},
			recentActivity: {
				newUnvalidatedUsers,
				peakActivity: peakHour, // { hour: 14, count: 89 }
			},
			systemStatus: {
				uptime,
				peakOnlineUsers,
				currentOnlineUsers: onlineUsers,
				totalUsers,
				totalPosts,
				totalComments,
			},
		};
		/*
		 */

		res.json({
			success: true,
			stats,
		});
	} catch (error) {
    console.error('Erreur lors de la récupération des stats admin:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
};

// =========================================================
// GET /api/v1/user/stats/id
// =========================================================
export const getUserStats = async (req, res) => {
	const usrCode =  req.params.id;
	if (!usrCode){
		
		return res
			.status(401)
			.json({ success: false, error: 'id utilisateur absent' });
	}

	try {
		const now = new Date();
		const past48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

		// =============================
		// STATE
		// =============================

		// 1. Post count
		const postsCount = await models.Post.count({
			where: { usrCode: usrCode },
		});

		// 2. Comment Count
		const commentsCount = await models.Comment.count({
			where: { usrCode: usrCode },
		});
		// 3. Message Count
		const messageLast48h_groupe = await models.GroupeUserMessage.count({
			where: {
				gumesIsDeleted: false,
				usrCode: usrCode,
				gumesCreatedDate: { [Op.gte]: past48h },
			},
		});

		const messageLast48h_user = await models.Destination.count({
			where: {
				destIsDeleted: false,
				[Op.or]: [{ usrCode: usrCode }, { destSenderCode: usrCode }],
				destCreatedDate: { [Op.gte]: past48h },
			},
		});

		const messagesLast48h = messageLast48h_user + messageLast48h_groupe;

		// 4. Groupes actifs (avec au moins 1 membre non supprimé)
		const TotalGroupe = await models.GroupeUserMember.count({
			where: {
				usrCode: usrCode,
				gumUserIsDeleted: false,
				gumUserAcceptJoin: true,
			},
		});

		// 5. Stockage utilisé (PostFileJoint + MsgFileJoint)
		// On suppose que msgFileSize et pfjSize sont des strings représentant des octets
		// Pour PostFileJoint
		const postStorageResult = await models.PostFileJoint.findOne({
			attributes: [
				[
					sequelize.fn(
						'SUM',
						sequelize.cast(sequelize.col('pfj_size'), 'BIGINT'),
					),
					'totalBytes',
				],
			],
			where: {
				usrCode: usrCode,
				pfjIsDeleted: false,
				pfjSize: { [Op.not]: null, [Op.regexp]: '^[0-9]+$' }, // sécurité : que des chiffres
			},
			raw: true,
		});

		const postFilesStorageResult = parseInt(
			postStorageResult?.totalBytes || 0,
		);

		// Pour MsgFileJoint
		const messageStorageResult = await models.MsgFileJoint.findOne({
			attributes: [
				[
					sequelize.fn(
						'SUM',
						sequelize.cast(sequelize.col('msg_file_size'), 'BIGINT'),
					),
					'totalBytes',
				],
			],
			where: {
				usrCode: usrCode,
				msgFileIsDeleted: false,
				msgFileSize: { [Op.not]: null, [Op.regexp]: '^[0-9]+$' },
			},
			raw: true,
		});

		const messageFilesStorageResult = parseInt(
			messageStorageResult?.totalBytes || 0,
		);

		// Gérer les valeurs null
		const postFilesStorage = postFilesStorageResult || 0;
		const messageFilesStorage = messageFilesStorageResult || 0;

		const totalBytes =
			parseInt(postFilesStorage || 0) + parseInt(messageFilesStorage || 0);
		const totalGB = (totalBytes / 1024 ** 3).toFixed(2); // Convertir en Go

		// =============================
		// RÉPONSE FINALE
		// =============================

		const stats = {
			postsCount: postsCount,
			commentsCount: commentsCount,
			messagesLast48h: messagesLast48h,
			activeGroups: TotalGroupe,
			storage: {
				postfile: postFilesStorage,
				messageFile: messageFilesStorage,
				used: `${totalGB} Go`,
				total: undefined,
			},
		};

		res.json({
			success: true,
			stats,
		});
	} catch (error) {
		console.error('Erreur lors de la récupération des stats admin:', error);
		res.status(500).json({ success: false, error: 'Erreur serveur interne' });
	}
};

// Fonction récursive pour calculer la taille d'un dossier
function getFolderSize(folderPath) {
  let totalSize = 0;

  function walkSync(currentDirPath) {
    const files = fs.readdirSync(currentDirPath);
    files.forEach((filename) => {
      const filePath = path.join(currentDirPath, filename);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        totalSize += stat.size;
      } else if (stat.isDirectory()) {
        walkSync(filePath);
      }
    });
  }

  try {
    walkSync(folderPath);
    return totalSize;
  } catch (error) {
    console.error(`Erreur lors du calcul de la taille du dossier ${folderPath}:`, error);
    return 0;
  }
}