import bcrypt from 'bcrypt';
import { sequelize } from '../db/config/database.js';
import { Op } from 'sequelize';
import initModels from '../db/models/init-models.js';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import fetch from 'node-fetch';
import { getPreciseGMTTime } from '../services/timeSync.js';

var models = initModels(sequelize);
const userPrefix = 'user';
const newUserGroupCode = 'grp-1';
const fiveDaysInMilisecond = 5 * 24 * 60 * 60 * 1000;
const fiveMinutes = 5 * 60;

/************************************************************************
 **************** Create account for users ******************************
 ************************************************************************/
export async function postUserA(req, res) {
	const usrName = req.body.usrName;
	const usrFirstname = req.body.usrFirstname;
	const usrMail = req.body.usrMail;
	const usrLogin = req.body.usrLogin;
	const usrPassword = req.body.usrPassword;
	const usrGender = req.body.usrGender;

	const is_usrCode_null = !req.body.usrCode || req.body.usrCode === null;

	if (usrName.length < 1) {
		return res.status(401).json({
			error: "Le champ nom est obligatoire",
			errorUsrName: true,
			errorUsrFirstname: false,
			errorUsrMail: false,
			errorUsrLogin: false,
			errorUsrPassword: false,
			errorUsrGender: false,

		});
	}

	if (usrFirstname.length < 1) {
		return res.status(401).json({
			error: "Le champ prénoms est obligatoire",
			errorUsrName: false,
			errorUsrFirstname: true,
			errorUsrMail: false,
			errorUsrLogin: false,
			errorUsrPassword: false,
			errorUsrGender: false,

		});
	}

	if (usrMail.length < 1) {
		return res.status(401).json({
			error: "Le champ mail est obligatoire",
			errorUsrName: false,
			errorUsrFirstname: false,
			errorUsrMail: true,
			errorUsrLogin: false,
			errorUsrPassword: false,
			errorUsrGender: false,

		});
	}

	if (usrLogin.length < 1) {
		return res.status(401).json({
			error: "Ce champ loging est obligatoire",
			errorUsrName: false,
			errorUsrFirstname: false,
			errorUsrMail: false,
			errorUsrLogin: true,
			errorUsrPassword: false,
			errorUsrGender: false,

		});
	}

	if (usrPassword.length < 1) {
		return res.status(401).json({
			error: "Mot de passe absent",
			errorUsrName: false,
			errorUsrFirstname: false,
			errorUsrMail: false,
			errorUsrLogin: false,
			errorUsrPassword: true,
			errorUsrGender: false,

		});
	}

	if (usrPassword.length < 8) {
		return res.status(401).json({
			error: "Le mot de passe doit avoir au moins 8 caractère",
			errorUsrName: false,
			errorUsrFirstname: false,
			errorUsrMail: false,
			errorUsrLogin: false,
			errorUsrPassword: true,
			errorUsrGender: false,

		});
	}

	if (usrGender.length < 1) {
		return res.status(401).json({
			error: "Veillez choisir votre genre",
			errorUsrName: false,
			errorUsrFirstname: false,
			errorUsrMail: false,
			errorUsrLogin: false,
			errorUsrPassword: false,
			errorUsrGender: true,


		});
	}

	try {
		const mail_is_exist = await models.Users.findOne({
			where: {
				usrMail: usrMail,
			},
		});
		const usr_login_is_exist = await models.Users.findOne({
			where: {
				usrLogin: usrLogin,
			},
		});

		const user_is_exist = await models.Users.findOne({
			where: {
				[Op.and]: [{ usrName: usrName }, { usrFirstname: usrFirstname }],
			},
		});

		if (user_is_exist) {
			return res
				.status(400)
				.json({
					error: `Ce personne existe déjà`,
					errorUsrName: true,
					errorUsrFirstname: true,
				});
		}

		if (mail_is_exist) {
			return res
				.status(400)
				.json({
					error: `Cette adresse email existe déjà dans le serveur`,
					errorUsrMail: true,
				});
		}

		if (usr_login_is_exist) {
			return res
				.status(400)
				.json({
					error: `Ce login existe déjà dans la base de donnée`,
					errorUsrLogin: true,
				});
		}

		// Add id if id is null
		if (is_usrCode_null) {
			const get_last_id = await models.Users.findAll({
				attributes: ['usr_code'],
				order: ['usr_code'],
				raw: true,
			});
			console.log('luuuuu', get_last_id);
			if (get_last_id.length > 1) {
				const last_id = get_last_id
					.map(function (id) {
						var id_verify = parseInt(id.usr_code);
						if (isNaN(id_verify)) {
							id_verify = parseInt(id.usr_code.split('-')[1]);
						}
						return id_verify;
					})
					.reduce((previousId, currentId) =>
						previousId > currentId ? previousId : currentId,
					);
				req.body.usrCode = userPrefix + '-' + (last_id + 1);
			}

			if (get_last_id.length < 1) {
				req.body.usrCode = userPrefix + '-' + 1;
			}
		}

		// Encrypt the password
		req.body.usrPassword = await bcrypt.hash(usrPassword, 10);
		// Set date
		req.body.usrCreatedDate = getPreciseGMTTime().iso;

		// Create a new user
		// Set date
		req.body.usrCreatedDate = getPreciseGMTTime().iso;
		req.body.grpCode = newUserGroupCode;
		req.body.usrIsDeleted = false;
		req.body.usrIsValided = false;

		const newUser = await models.Users.create(req.body);
		const message = `Création compte éffectue avec succès.`;

		const { sign } = jwt;
		const access_token = sign(
			{ usrCode: newUser.usrCode },
			process.env.JWT_SECRET,
			{
				expiresIn: fiveMinutes,
			},
		);
		const refresh_token = sign(
			{ usrCode: newUser.usrCode },
			process.env.JWT_REFRESH_TOKEN,
			{
				expiresIn: fiveDaysInMilisecond,
			},
		);

		res
			.header('Authorization', 'Bearer ' + access_token)
			.cookie('access_token', access_token, {
				httpOnly: true,
				maxAge: fiveDaysInMilisecond,
				SameSite: false,
			})
			.cookie('refresh_token', refresh_token, {
				httpOnly: true,
				maxAge: fiveDaysInMilisecond,
				SameSite: false,
			})
			.json({ message, user: newUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
}

/************************************************************************
 **************** users login***********************************
 ************************************************************************/
export const login = async (req, res) => {
	const { usrLogin, usrPassword, captChaValue } = req.body;
	const captchaServeurKey = '6Le5S-0pAAAAAJfHRzIOP5S_Wv1ru4xOqxsfBh_3';

	try {
		const captchaVerified = await fetch(
			`https://www.google.com/recaptcha/api/siteverify`,
			{
				method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${captchaServeurKey}&response=${captChaValue}`,
			},
		).then(_res => _res.json());
    
		if (!captchaVerified.success === true) {
			return res
				.status(401)
				.json({
					error: 'Captcha non verfié',
					errorPassword: false,
					errorLogin: false,
					errorCaptcha: true,
				});
		}

		// Find the user by usrMail or by login
		var user = await models.Users.findOne({
			where: {
				[Op.or]: [{ usrMail: usrLogin }, { usrLogin: usrLogin }],
			},
		});

		if (user === null) {
			return res
				.status(401)
				.json({
					error: 'Cet email ou ce login est introuvable',
					errorPassword: false,
					errorLogin: true,
          errorCaptcha: false,
				});
		}
		if (user.usrIsDeleted === true) {
			return res.status(401).json({
				error: "Ce compte a été supprimé, veiller contactez l'administrateur",
				errorPassword: true,
				errorLogin: true,
        errorCaptcha: false,
			});
		}

		bcrypt.compare(usrPassword, user.usrPassword, (err, isMatch) => {
			console.log(err);
			if (err || !isMatch) {
				return res
					.status(401)
					.json({
						error: 'Mot de passe invalide',
						errorPassword: true,
						errorLogin: false,
            errorCaptcha: false,
					});
			}
			if (isMatch) {
				const { sign } = jwt;
				const access_token = sign(
					{ usrCode: user.usrCode },
					process.env.JWT_SECRET,
					{
						expiresIn: fiveMinutes,
					},
				);
				const refresh_token = sign(
					{ usrCode: user.usrCode },
					process.env.JWT_REFRESH_TOKEN,
					{
						expiresIn: fiveDaysInMilisecond,
					},
				);
				const message = `Connexion avec succès.`;
				//Remove password;
				const usrPassordExist = user.usrPassword;
				if (usrPassordExist) {
					user.usrPassword = '';
				}

				return res
					.header('Authorization', 'Bearer ' + access_token)
					.cookie('access_token', access_token, {
						httpOnly: true,
						maxAge: fiveDaysInMilisecond,
						sameSite: 'None',
						secure: true,
					})
					.cookie('refresh_token', refresh_token, {
						httpOnly: true,
						maxAge: fiveDaysInMilisecond,
						sameSite: 'None',
						secure: true,
					})
					.json({
						message,
						data: user,
						access_token: access_token,
						refresh_token: refresh_token,
					});
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
};

/************************************************************************
 **************** App Client login***********************************
 ************************************************************************/
export const appLogin = async (req, res) => {
	const { usrLogin, usrPassword } = req.body;

	try {
		// Find the user by usrMail or by login
		var user = await models.Users.findOne({
			where: {
				[Op.or]: [{ usrMail: usrLogin }, { usrLogin: usrLogin }],
			},
		});

		if (user === null) {
			return res
				.status(401)
				.json({
					error: 'Cet email ou ce login est introuvable',
					errorPassword: false,
					errorLogin: true,
				});
		}
		if (user.usrIsDeleted === true) {
			return res.status(401).json({
				error: "Ce compte a été supprimé, veiller contactez l'administrateur",
				errorPassword: true,
				errorLogin: true,
			});
		}

		bcrypt.compare(usrPassword, user.usrPassword, (err, isMatch) => {
			console.log(err);
			if (err || !isMatch) {
				return res
					.status(401)
					.json({
						error: 'Mot de passe invalide',
						errorPassword: true,
						errorLogin: false,
					});
			}
			if (isMatch) {
				const { sign } = jwt;
				const access_token = sign(
					{ usrCode: user.usrCode },
					process.env.JWT_SECRET,
					{
						expiresIn: fiveMinutes,
					},
				);
				const refresh_token = sign(
					{ usrCode: user.usrCode },
					process.env.JWT_REFRESH_TOKEN,
					{
						expiresIn: fiveDaysInMilisecond,
					},
				);
				const message = `Connexion avec succès.`;
				//Remove password;
				const usrPassordExist = user.usrPassword;
				if (usrPassordExist) {
					user.usrPassword = '';
				}

				return res
					.header('Authorization', 'Bearer ' + access_token)
					.cookie('access_token', access_token, {
						httpOnly: true,
						maxAge: fiveDaysInMilisecond,
						sameSite: 'None',
						secure: true,
					})
					.cookie('refresh_token', refresh_token, {
						httpOnly: true,
						maxAge: fiveDaysInMilisecond,
						sameSite: 'None',
						secure: true,
					})
					.json({
						message,
						data: user,
						access_token: access_token,
						refresh_token: refresh_token,
					});
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
};

/************************************************************************
 **************** users logout ***********************************
 ************************************************************************/
export const logout = async (req, res) => {
	try {
		res.clearCookie('access_token', { path: '/' });
		res.clearCookie('refresh_token', { path: '/' });
		res.json('Deconnexion avec succès');
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

/************************************************************************
 **************** refresh token ***********************************
 ************************************************************************/

export const refresh = async (req, res) => {
	//const fiveMinutes = 10;
	try {
		const refresh_token = req.cookies.refresh_token;

		const decodedToken = jwt.verify(
			refresh_token,
			process.env.JWT_REFRESH_TOKEN,
		);

		const newAccessToken = jwt.sign({ decodedToken }, process.env.JWT_SECRET, {
			expiresIn: fiveMinutes,
		});

		res.cookie('access_token', newAccessToken, {
			sameSite: 'None',
			secure: true,
			maxAge: fiveDaysInMilisecond,
			httpOnly: true,
		});
		res.status(200).send({
			message: 'refresh token à jour!',
		});
	} catch (err) {
		res.status(500).send({ message: err.message });
	}
};
