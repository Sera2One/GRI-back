// sendMailService.js (mis à jour)

import NodeMailer from 'nodemailer';

export const sendMailService = (to, subject, htmlContent, res) => {
	let transporter = NodeMailer.createTransport({
		service: 'gmail',
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		auth: {
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD,
		},
	});

	const mail_configs = {
		from: {
			name: 'Helpdesk services',
			address: process.env.MAIL_USERNAME,
		},
		to: to,
		subject: subject,
		html: htmlContent,
	};

	transporter.sendMail(mail_configs, function (error, info) {
		if (error) {
			console.error('Erreur envoi email :', error);
			throw new Error('Erreur lors de l’envoi de l’email');
		}
		console.log('Email envoyé avec succès à :', to);
	});
};
