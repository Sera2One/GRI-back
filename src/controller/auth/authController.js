import bcrypt from 'bcrypt';
import { sequelize } from '../../db/config/database.js';
import { Op } from 'sequelize';
import initModels from '../../db/models/init-models.js';
import '../../../src/services/env.js';
import { otp_render_view } from './mail_template.js';
import { PasswordResetSuccess_render } from './PasswordResetSuccess_template.js';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import fetch from 'node-fetch';
import NodeMailer from 'nodemailer';
import { generateSecureKey, verifySecureKey } from '../../services/serverKey.js';
import { getPreciseGMTTime } from '../../services/timeSync.js';
import { createAndEmitNotification } from '../../services/notificationService.js';


var models = initModels(sequelize);
const userPrefix = 'user';
const newUserGroupCode = 'grp-1';
const sevenDaysInMilisecond = 7 * 24 * 60 * 60 * 1000;
const TenMinutes = 10 * 60;

const isValidEmail = email => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

/************************************************************************
 **************** Create account for users ******************************
 ************************************************************************/
export async function postUser(req, res) {
	const { usrName, usrFirstname, usrMail, usrLogin, usrPassword, usrGender } =
		req.body;
	const transaction = await sequelize.transaction();

	const is_usrCode_null = !req.body.usrCode || req.body.usrCode === null;

	if (usrName.length < 1) {
		return res.status(401).json({
			error: 'Le champ nom est obligatoire',
			errorUsrName: true,
			errorUsrFirstname: false,
			errorUsrMail: false,
			errorUsrLogin: false,
			errorUsrPassword: false,
			errorUsrGender: false,
		});
	}
	// Update testeur : usrFirstname non obligatoire
	/* if (usrFirstname.length < 1) {
		return res.status(401).json({
			error: "Le champ prénoms est obligatoire",
			errorUsrName: false,
			errorUsrFirstname: true,
			errorUsrMail: false,
			errorUsrLogin: false,
			errorUsrPassword: false,
			errorUsrGender: false,

		});
	} */

	if (usrMail.length < 1) {
		return res.status(401).json({
			error: 'Le champ mail est obligatoire',
			errorUsrName: false,
			errorUsrFirstname: false,
			errorUsrMail: true,
			errorUsrLogin: false,
			errorUsrPassword: false,
			errorUsrGender: false,
		});
	}

	if (usrMail && !isValidEmail(usrMail)) {
		setErrorMail({
			error: true,
			errorText: 'Veuillez saisir une adresse e-mail valide.',
		});

		return res.status(401).json({
			error: 'Veuillez saisir une adresse e-mail valide.',
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
			error: 'Ce champ loging est obligatoire',
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
			error: 'Mot de passe absent',
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
			error: 'Le mot de passe doit avoir au moins 8 caractère',
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
			error: 'Veillez choisir votre genre',
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
			return res.status(400).json({
				error: `Ce personne existe déjà`,
				errorUsrName: true,
				errorUsrFirstname: true,
			});
		}

		if (mail_is_exist) {
			return res.status(400).json({
				error: `Cette adresse email existe déjà dans le serveur`,
				errorUsrMail: true,
			});
		}

		if (usr_login_is_exist) {
			return res.status(400).json({
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

		const newUser = await models.Users.create(req.body, { transaction });
		
		await transaction.commit();


		const admins = await models.Users.findAll({
			where: { grpCode: 'grp-2' },
			attributes: ['usrCode'],
		});

		// Créer une notification

		for (const user of admins) {
			await createAndEmitNotification({
				type: 'USER_VALIDATION_REQUEST',
				recipientUserCode: user.usrCode,
				actorUserCode: newUser.usrCode,
				targetType: 'users',
				targetCode: newUser.usrCode,
			});
		}

		const message = `Création compte éffectue avec succès.`;

		const { sign } = jwt;
		const access_token = sign(
			{ usrCode: newUser.usrCode },
			process.env.JWT_SECRET,
			{
				expiresIn: TenMinutes,
			},
		);
		const refresh_token = sign(
			{ usrCode: newUser.usrCode },
			process.env.JWT_REFRESH_TOKEN,
			{
				expiresIn: sevenDaysInMilisecond,
			},
		);

		res
			.header('Authorization', 'Bearer ' + access_token)
			.cookie('access_token', access_token, {
				httpOnly: true,
				maxAge: TenMinutes,
				SameSite: false,
			})
			.cookie('refresh_token', refresh_token, {
				httpOnly: true,
				maxAge: sevenDaysInMilisecond,
				SameSite: false,
			})
			.json({ message, user: newUser });
	} catch (error) {
		console.error(error);
		await transaction.rollback();
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
						expiresIn: TenMinutes,
					},
				);
				const refresh_token = sign(
					{ usrCode: user.usrCode },
					process.env.JWT_REFRESH_TOKEN,
					{
						expiresIn: sevenDaysInMilisecond,
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
						maxAge: sevenDaysInMilisecond,
						sameSite: 'None',
						secure: true,
					})
					.cookie('refresh_token', refresh_token, {
						httpOnly: true,
						maxAge: sevenDaysInMilisecond,
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
						expiresIn: TenMinutes,
					},
				);
				const refresh_token = sign(
					{ usrCode: user.usrCode },
					process.env.JWT_REFRESH_TOKEN,
					{
						expiresIn: sevenDaysInMilisecond,
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
						maxAge: sevenDaysInMilisecond,
						sameSite: 'None',
						secure: true,
					})
					.cookie('refresh_token', refresh_token, {
						httpOnly: true,
						maxAge: sevenDaysInMilisecond,
						sameSite: 'None',
						secure: true,
					})
					.json({
						message,
						data: user,
						access_token: access_token,
						refresh_token: refresh_token,
						ok: "OK test"
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
			expiresIn: TenMinutes,
		});

		res.cookie('access_token', newAccessToken, {
			sameSite: 'None',
			secure: true,
			maxAge: sevenDaysInMilisecond,
			httpOnly: true,
		});
		res.status(200).send({
			message: 'refresh token à jour!',
		});
	} catch (err) {
		res.status(500).send({ message: err.message });
	}
};

/************************************************************************
 **************** users logout ***********************************
 ************************************************************************/
 export const MailIsExist = async (req, res) => {
  try {
    let user = null;
    const usrLogin = req.body.usrLogin;

    if(!req.body.usrLogin){
      return res
          .status(401)
          .json({ error: "L' Adresse email ou login obligatoire" , nextStep: false});
    }

  user = await models.Users.findOne({
    where: {
      [Op.or]: [{ usrMail: usrLogin }, { usrLogin: usrLogin }],
    },
    raw: true
  });

  if (user === null) {
    
	return res
		.status(401)
		.json({ error: "Adresse email ou login introuvable" , nextStep: false });
    
  }
  if (user.usrIsDeleted === true) {
    return res.status(401).json({
      error: "Ce compte a été supprimé, veiller comtactez l'administrateur",
    });
  }

  return res.json({ message: "Le login ou l' email exite" , nextStep: true ,data : user });


  } catch (err) {
    res.status(500).json({ message: err.message  , nextStep: false});
  }
};




/************************************************************************
 **************** sendOTPETomail ****************************************
 ************ One Time Password :  mot de passe à usage unique **********
 ************************************************************************/
export const sendOTPETomail = async (req, res) => {
  let user = null;
  const OTPvalidityInMinute = 5;
  const usrLogin = req.body.usrLogin;

  if(!req.body.usrLogin){
    return res
        .status(401)
        .json({ error: "Login ou matricule ou Adresse email obligatoire" });
  }

  user = await models.Users.findOne({
    where: {
      [Op.or]: [{ usrMail: usrLogin }, { usrLogin: usrLogin }],
    },
    raw: true
  });

  if (user.usrIsDeleted === true) {
    return res.status(401).json({
      error: "Ce compte a été supprimé, veiller comtactez l'administrateur",
    });
  }



  const OTP = generateRandomSixDigitCode();
  console.log("moment()",moment().add(OTPvalidityInMinute , 'minutes').format("YYYY-MM-DD_HH:mm:ss:SSS"));
  try {
    await models.MotDePasseOublie.create({
      mdpoCode: moment().format("YYYY-MM-DD_HH:mm:ss:SSS"),
      usrCode : user.usrCode,
      mdpoDate :  moment().format("YYYY-MM-DD HH:mm:ss"),
      mdpoExpireDate : moment().add(OTPvalidityInMinute , 'minutes').format("YYYY-MM-DD HH:mm:ss") ,
      mdpoInfo : null,
      mdpOtp : OTP,
      mdpStatus : "not_used",
    })
  } catch (error) {
    const message = `Il y a une erreur au niveau de la base de donnée`;
    console.error(error)
    res.status(400).json({ error: message });
  }

  let transporter = NodeMailer.createTransport({
    service: "gmail",
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mail_configs = {
    from: { 
      name : "Helpdesk services",
      address:process.env.MAIL_USERNAME
    },
    to: user.cltMail || user.usrMail,
    subject: "Demande de reinitialisation mot de passe perdue",
    html: otp_render_view(OTP,user),
  };

  transporter.sendMail(mail_configs, function (error, info) {
    if (error) {
      console.log(error);
      return  res.status(500).json({ message : "An error has occured"});
    }
    return  res.json({ message : "Email sent succesfuly"});
  });
};

function generateRandomSixDigitCode() {
  // Générer un nombre aléatoire entre 0 et 999999
  const randomNumber = Math.floor(Math.random() * 1000000);
  
  // Convertir en chaîne et ajouter des zéros devant si nécessaire
  const randomCode = String(randomNumber).padStart(6, '0');
  
  return randomCode;
}


/************************************************************************
 **************** OTP Verifie ***********************************
************************************************************************/
export const OTPVerifie = async (req, res) => {
  try {
    let user = null;
    const usrLogin = req.body.usrLogin;

    if(!req.body.usrLogin){
      return res
          .status(401)
          .json({ error: "L' Adresse email ou login obligatoire" , nextStep: false});
    }

  user = await models.Users.findOne({
    where: {
      [Op.or]: [{ usrMail: usrLogin }, { usrLogin: usrLogin }],
    },
    raw: true
  });

  if (user === null) {
      return res
        .status(401)
        .json({ error: "Adresse email ou login introuvable" , nextStep: false });
    
  }

  if (user.usrIsDeleted === true) {
    return res.status(401).json({
      error: "Ce compte a été supprimé, veiller comtactez l'administrateur",
    });
  }

  return res.json({ message: "Le login ou l' email exite" , nextStep: true ,data : user });


  } catch (err) {
    res.status(500).json({ message: err.message  , nextStep: false});
  }
};


/************************************************************************
 **************** OTP Verifie ***********************************
************************************************************************/
export const passwordReset = async (req, res) => {
  try {
    let user = null;
    const usrLogin = req.body.usrLogin;
    const mdpOtp = req.body.mdpOtp;
    const newPassword = process.env.DEFAULT_PASSWORD_RESET;

    if(!req.body.usrLogin){
      return res
          .status(401)
          .json({ error: "L' Adresse email ou login obligatoire"});
    }

    if(!req.body.mdpOtp){
      return res
          .status(401)
          .json({ error: "Le code OTP est obligatoire"});
    }
  
    user = await models.Users.findOne({
      where: {
        [Op.or]: [{ usrMail: usrLogin }, { usrLogin: usrLogin }],
      },
      raw: true
    });
  
if (user === null) {
	return res
	.status(401)
	.json({ error: "Adresse email ou login introuvable" });
    }

  const userCode = user.cltCode ? user.cltCode : user.usrCode;

  const OTPIsExits = await models.MotDePasseOublie.findOne({
    where: {
      [Op.and] : {
		usrCode: userCode,
		mdpOtp: mdpOtp,
		mdpStatus:"not_used"
      }
    },
    raw: true
  });

  if(!OTPIsExits){
    return res
          .status(401)
          .json({ error: "Le code OTP que vous avez entrée ne corresponde pas dans le mail envoyé" });
  }

  const now = moment(new Date());
  const end = moment(OTPIsExits.mdpoExpireDate);
  const duration = moment.duration(now.diff(end));
  const Minutes = duration.asMinutes();

  if(Minutes > process.env.OTP_CODE_DELAY_IN_MINUTE){
    return res
          .status(401)
          .json({ error: "Le code OTP est expiré" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  if(user.usrCode){
    models.Users.update({
      usrPassword : hashedPassword
    }, {
      where: { usrCode: userCode },
    })
  }

  console.log("userCode",userCode);

  let transporter = NodeMailer.createTransport({
    service: "gmail",
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mail_configs = {
    from: { 
      name : "Helpdesk services",
      address:process.env.MAIL_USERNAME
    },
    to: user.usrMail,
    subject: "Reinitialisation mot de passe",
    html: PasswordResetSuccess_render( newPassword ,user),
  };

   await models.MotDePasseOublie.update({
    mdpStatus : "used"
   },{
    where: {
      mdpoCode : OTPIsExits.mdpoCode
    }
  });

  transporter.sendMail(mail_configs, function (error, info) {
    if (error) {
      console.log(error);
      return  res.status(500).json({ message : "An error has occured"});
    }
    return  res.json({ message : "Email sent succesfuly"});
  });


  return res.json({ 
    message: `Votre mot de passe temporaire est ${newPassword} , veuillez le modifiez modifiez pour securisé votre compte `,
    newPassword: newPassword
});


  } catch (err) {
    res.status(500).json({ message: err.message  , nextStep: false});
  }
};


/************************************************************************
 ********** API pour fournir la clé serveur au client  ******************
 ************************************************************************/

export const getServerKey = async (req, res) => {
	try {
		const { userCode, date: inputDate } = req.query;

		if (!userCode) {
			return res.status(400).json({
				success: false,
				message: "Le paramètre 'userCode' est requis.",
			});
		}

		let data = [];

		const regexFullDate = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
		const regexMonth = /^\d{4}-\d{2}$/; // YYYY-MM
		const regexYear = /^\d{4}$/; // YYYY

		const today = new Date().toISOString().split('T')[0];

		const dateStr = (inputDate || today).trim();

		if (regexFullDate.test(dateStr)) {
			// ➤ Cas 1 : Date complète → clé du jour
			const serverKey = generateSecureKey(userCode, dateStr);
			data.push({ user: userCode, serverKey, date: dateStr });
		} else if (regexMonth.test(dateStr)) {
			// ➤ Cas 2 : Mois → tous les jours du mois
			const [year, month] = dateStr.split('-');
			const daysInMonth = new Date(year, month, 0).getDate();

			for (let day = 1; day <= daysInMonth; day++) {
				const dayStr = String(day).padStart(2, '0');
				const fullDateStr = `${year}-${month}-${dayStr}`;
				const serverKey = generateSecureKey(userCode, fullDateStr);
				data.push({ user: userCode, serverKey, date: fullDateStr });
			}
		} else if (regexYear.test(dateStr)) {
			// ➤ Cas 3 : Année → tous les jours de l'année
			const year = parseInt(dateStr);

			for (let month = 1; month <= 12; month++) {
				const monthStr = String(month).padStart(2, '0');
				const daysInMonth = new Date(year, month, 0).getDate();

				for (let day = 1; day <= daysInMonth; day++) {
					const dayStr = String(day).padStart(2, '0');
					const fullDateStr = `${year}-${monthStr}-${dayStr}`;
					const serverKey = generateSecureKey(userCode, fullDateStr);
					data.push({ user: userCode, serverKey, date: fullDateStr });
				}
			}
		} else {
			// ➤ Format invalide
			return res.status(400).json({
				success: false,
				message:
					'Format de date invalide. Utiliser YYYY-MM-DD, YYYY-MM ou YYYY',
			});
		}

		res.json({
			success: true,
			data,
		});
	} catch (err) {
		console.error('Erreur serveur : ', err.message);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur interne',
		});
	}
};


/************************************************************************
 ********** API pour fournir la clé serveur au client  ******************
 ************************************************************************/
export const getVerifyKey = async (req, res) => {
	try {
		const { userCode, serverKey , date } = req.body;

		const resulte = verifySecureKey(serverKey, userCode, date || new Date());

		res.json({
			success: resulte,
			message: resulte ? "La clé est authentique" : "Ce clé n'est pas authentique",
		});
	} catch (err) {
		console.log('err : ', err.message);

		res
			.status(500)
			.send({
				message: 'Erreur serveur, le serveur ne supporte le module crypto ',
			});
	}
};




