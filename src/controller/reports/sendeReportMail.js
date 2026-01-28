import nodemailer from 'nodemailer';
import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';

const models = initModels(sequelize);

export const sendUrgentEmail = async report => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		auth: {
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD,
		},
	});

	const admins = await models.Users.findAll({
		where: { grpCode: 'grp-2' },
		attributes: ['usr_mail'],
	});

	const mail_configs = {
		from: {
			name: 'Helpdesk services',
			address: process.env.MAIL_USERNAME,
		},
		to: admins.map(a => a.usr_mail),
		subject: `🚨 Signalement Urgent #${report.code}`,
		html: `
      <h2>Signalement de sévérité ${report.rptSeverity}/5</h2>
      <p><strong>Type:</strong> ${report.rptType}</p>
      <p><strong>Raison:</strong> ${report.rptReason}</p>
      <p><strong>Reporter:</strong> ${report.reporter?.username}</p>
      <p><strong>Description:</strong> ${report.rptDescription}</p>
      <a href="${process.env.ADMIN_URL}/reports/${report.code}">
        Voir dans le dashboard
      </a>
    `,
	};

	await transporter.sendMail(mail_configs, function (error, info) {
		if (error) {
			console.log(error);
			console.log({ message: 'An error has occured' });
		}
		console.log({ message: 'Email sent succesfuly' });
	});
};
