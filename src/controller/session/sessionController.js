import { sequelize } from '../../db/config/database.js';
import { Op } from 'sequelize';
import initModels from '../../db/models/init-models.js';
import json2csv from 'json2csv';
const { Parser } = json2csv;


const models = initModels(sequelize);

// =========================================================
// GET /api/v1/user/sessions
// =========================================================
export const getUserSessionHistory = async (req, res) => {
	try {
		const { usrCode } = req.query;

		const sessions = await models.Session.findAll({
			where: { usrCode: usrCode , sessionIsActive : true },
			order: [['session_last_active', 'DESC']],
			limit: 15,
			attributes: { exclude: ['session_device_id', 'session_refresh_token'] },
		});

		res.json({ success: true, data: sessions });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
};
// =========================================================
// PUT /api/v1/user/sessions
// =========================================================
export const putDisconnectSession = async (req, res) => {
	try {
		const { usrCode, sessionCode } = req.query;
		const whereCondition = { usrCode: usrCode };
		if (sessionCode) {
			whereCondition.sessionCode = sessionCode;
		}

		const sessions = await models.Session.update(
			{
				sessionIsActive: false,
				sessionUserIsOnline: false,
			},
			{
				where: whereCondition,
			},
		);

		res.json({ success: true, data: sessions });
	} catch (error) {
		res.status(500).json({ error: 'Erreur serveur' });
	}
};

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
// =========================================================
// GET /api/v1/admin/sessions/list
// Query: ?page=1&limit=20&usrCode=&browser=&os=&dateFrom=&dateTo=
// =========================================================
export const getSessionsList = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			usrCode,
			browser,
			os,
			dateFrom,
			dateTo,
			isActive,
		} = req.query;

		const where = {};

		// Filtre utilisateur
		if (usrCode) where.usrCode = usrCode;

		// Filtre statut actif
		if (isActive) where.sessionIsActive = isActive === 'true';

		// Filtre par date
		if (dateFrom || dateTo) {
			where.sessionCreatedDate = {};
			if (dateFrom) where.sessionCreatedDate[Op.gte] = new Date(dateFrom);
			if (dateTo) where.sessionCreatedDate[Op.lte] = new Date(dateTo);
		}

		// Filtre navigateur / OS via JSONB (PostgreSQL)
		if (browser || os) {
			where.sessionBrowserInfo = { [Op.not]: null }; // S'assurer que le champ existe
		}

		if (browser) {
			const safeBrowser = sequelize.escape(`%${browser}%`);
			where[Op.and] = {
				...where[Op.and],
				[Op.and]: sequelize.literal(
					`"session_browser_info"->'browser'->>'name' ILIKE ${safeBrowser}`,
				),
			};
		}

		if (os) {
			const safeOs = sequelize.escape(`%${os}%`);
			where[Op.and] = {
				...where[Op.and],
				[Op.and]: sequelize.literal(
					`"session_browser_info"->'os'->>'name' ILIKE ${safeOs}`,
				),
			};
		}

    console.log('where', where);
    

		const offset = (page - 1) * limit;

		const { count, rows } = await models.Session.findAndCountAll({
			where,
			include: [
				{
					as: 'usrCodeUser',
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
			order: [['session_created_date', 'DESC']],
			offset,
			limit,
			raw: false,
			nest: true,
		});

		// Extraire browser/os pour affichage
		const enrichedRows = rows.map(row => {
			let browserName = 'Inconnu';
			let osName = 'Inconnu';
			try {
				if (row.sessionBrowserInfo) {
					const info =
						typeof row.sessionBrowserInfo === 'string'
							? JSON.parse(row.sessionBrowserInfo)
							: row.sessionBrowserInfo;
					browserName = info.browser?.name || 'Inconnu';
					osName = info.os?.name || 'Inconnu';
				}
			} catch (e) {
				console.warn('Erreur parsing sessionBrowserInfo:', e.message);
				browserName = 'Inconnu';
				osName = 'Inconnu';
			}

			return {
				...(row.toJSON ? row.toJSON() : row),
				browserName,
				osName,
			};
		});

		res.json({
			success: true,
			data: enrichedRows,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total: count,
				pages: Math.ceil(count / limit),
			},
		});
	} catch (error) {
		console.error('Erreur liste sessions:', error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
};

// =========================================================
// POST /api/v1/admin/sessions/export
// Export CSV
// =========================================================

export const exportSessionsCSV = async (req, res) => {
  try {
    const sessions = await models.Session.findAll({
			include: [
				{
					model: models.Users,
					as: 'usrCodeUser',
					attributes: ['usr_name', 'usr_firstname'],
				},
			],
			order: [['session_created_date', 'DESC']],
			limit: 10000, // Limite raisonnable
		});

    const data = sessions.map((s) => {
      let browser = 'Inconnu', os = 'Inconnu';
      try {
				if (s.sessionBrowserInfo) {
					const info =
						typeof s.sessionBrowserInfo === 'string'
							? JSON.parse(s.sessionBrowserInfo)
							: s.sessionBrowserInfo;
					browser = info.browser?.name || 'Inconnu';
					os = info.os?.name || 'Inconnu';
				}
			} catch (e) {
				console.warn(
					'Erreur parsing sessionBrowserInfo lors de l’export CSV:',
					e.message,
				);
				browser = 'Inconnu';
				os = 'Inconnu';
			}

      return {
        sessionCode: s.sessionCode,
        utilisateur: `${s.usrCodeUser?.usrFirstname || ''} ${s.usrCodeUser?.usrName || ''}`.trim() || s.usrCode,
        ip: s.sessionIp,
        navigateur: browser,
        systeme: os,
        creeLe: s.sessionCreatedDate,
        expireLe: s.sessionExpiresAt,
        actif: s.sessionIsActive ? 'Oui' : 'Non',
        enLigne: s.sessionUserIsOnline ? 'Oui' : 'Non',
      };
    });

   const parser = new Parser({
			fields: [
				'sessionCode',
				'utilisateur',
				'ip',
				'navigateur',
				'systeme',
				'creeLe',
				'expireLe',
				'actif',
				'enLigne',
			],
		});

    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('sessions_export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Erreur export CSV:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
