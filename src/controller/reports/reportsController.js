import { Op } from 'sequelize';
import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import { generateId } from '../../services/generateId.js';
import { getIo } from '../../../server.js';
import { sendUrgentEmail } from './sendeReportMail.js';
import { createAndEmitNotification } from '../../services/notificationService.js';

const models = initModels(sequelize);

// Calcul de sévérité
const calculateSeverity = async (type, targetCode, reason) => {
	const weights = {
		spam: 2,
		harcelement: 4,
		haine: 5,
		nudite: 4,
		desinformation: 3,
		autre: 1,
	};
	let severity = weights[reason] || 1;

	const count = await models.Reports.count({
		where: { rptTargetCode: targetCode, rptStatus: 'pending' },
	});
	if (count >= 3) severity += 1;
	if (count >= 5) severity += 1;

	return Math.min(severity, 5);
};

// CRÉER un signalement
export const createReport = async (req, res) => {
	const transaction = await sequelize.transaction();

	try {
		const { type, targetCode, reason, description, usrCode } = req.body;

		// Validation
		if (!['post', 'comment', 'message'].includes(type)) {
			return res.status(400).json({ success: false, message: 'Type invalide' });
		}

		// Générer ID + sévérité
		const rptCode = await generateId('Reports');
		const severity = await calculateSeverity(type, targetCode, reason);

		// Créer signalement
		const report = await models.Reports.create(
			{
				rptCode,
				rptType: type,
				rptTargetCode: targetCode,
				usrCode,
				rptReason: reason,
				rptDescription: description,
				rptSeverity: severity,
			},
			{ transaction },
		);

		await transaction.commit();

		// Charger les détails pour Socket/Email
		const reportFull = await models.Reports.findOne({
			where: { rptCode },
			include: [
				{
					model: models.Users,
					as: 'usrCodeUser',
					attributes: ['usr_code', 'usr_name', 'usr_mail'],
				},
			],
		});

		// Émettre aux admins via Socket.IO
		const io = getIo();
		const admins = await models.Users.findAll({
			where: { grpCode: 'grp-2' },
			attributes: ['usr_code'],
			raw: true
		});

		console.log("admin", admins);
		

		admins.forEach(async admin => {
			await createAndEmitNotification(
				{
					type: 'REPORT_CREATED',
					recipientUserCode: admin.usr_code,
					actorUserCode: usrCode,
					targetType: 'report',
					targetCode: reportFull.rptCode,
					extra: JSON.stringify({
						reportCode: reportFull.code,
						reporterName: reportFull.reporter?.usr_name,
						targetType: type,
						targetCode: targetCode,
						severity: severity,
					}),
					priority: Math.min(severity, 2), // 0=normal, 1=high, 2=urgent
				}
			);
		});

		// Email immédiat si sévérité >= 4
		if (severity >= 4) {
			await sendUrgentEmail(reportFull);
		}

		res.status(201).json({ success: true, data: reportFull });
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({ success: false, message: error.message });
	}
};

// LISTER les signalements (Admin)
export const getReports = async (req, res) => {
	try {
		const {
			status = 'pending',
			page = 1,
			limit = 20,
			minSeverity = 1,
		} = req.query;
		console.log('req.query', req.query);

		const offset = (page - 1) * limit;

		const { count, rows } = await models.Reports.findAndCountAll({
			where: {
				rptStatus: status,
				rptSeverity: { [Op.gte]: minSeverity },
			},
			include: [
				{
					model: models.Users,
					as: 'usrCodeUser',
					attributes: ['usr_code', 'usr_name', 'usr_mail'],
				},
			],
			order: [
				['rptSeverity', 'DESC'],
				['rptCreatedAt', 'DESC'],
			],
			limit: parseInt(limit),
			offset: parseInt(offset),
		});

		res.json({
			success: true,
			data: {
				reports: rows,
				total: count,
				page: parseInt(page),
				totalPages: Math.ceil(count / limit),
			},
		});
	} catch (error) {
		console.error('error', error);

		res.status(500).json({ success: false, message: error.message });
	}
};

// METTRE À JOUR le statut (Admin)
export const updateReportStatus = async (req, res) => {
	try {
		const { rptCode } = req.params;
		const { status, usrCode } = req.body;

		if (!['reviewed', 'dismissed'].includes(status)) {
			return res
				.status(400)
				.json({ success: false, message: 'Statut invalide' });
		}

		const report = await models.Reports.findOne({ where: { rptCode } });
		if (!report)
			return res
				.status(404)
				.json({ success: false, message: 'Signalement introuvable' });

		await report.update({
			rptStatus: status,
			rptUpdatedAt: new Date(),
		});

		// Notifier la mise à jour
		const io = getIo();
		io.emit('report_updated', { rptCode, status, usrCode });

		res.json({ success: true, data: report });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// STATS pour le dashboard Admin
export const getReportStats = async (req, res) => {
	try {
		const stats = await models.Reports.findAll({
			attributes: ['rptStatus', [sequelize.fn('COUNT', '*'), 'count']],
			group: ['rptStatus'],
		});

		res.json({ success: true, data: stats });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
