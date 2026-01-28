import bcrypt from 'bcrypt';
import { sequelize } from '../../db/config/database.js';
import { Op } from 'sequelize';
import initModels from '../../db/models/init-models.js';
import moment from 'moment';
import Groupes from '../../db/models/groupes.js';
import '../../services/env.js';
import fs from 'node:fs';
import path from 'path';
import { sendMailService } from './sendMailService.js';
import { AccountActionEmailTemplate } from './AccountActionEmailTemplate.js';
import { createAndEmitNotification } from '../../services/notificationService.js';

var models = initModels(sequelize);
const userPrefix = 'user';
const newUserGroupCode = 'grp-1';
const publicFolder = process.env.APP_PUBLIC_FOLDER;
const ProfileFolder = '/Images/Profile/';
const backUpFolder = '/Images/Profile/oldeProfile/';
const ProfileFolderFullPath = publicFolder + ProfileFolder;
const backUpFolderFullPath = publicFolder + backUpFolder;

/************************************************************************
 **************** Create account for users ******************************
 ************************************************************************/
export async function root(req, res) {
	return res.json({ message: 'ok' });
}

// Fonction utilitaire pour envoyer l'email après mise à jour
const sendAccountEmail = async (user, emailType) => {
	const subjectMap = {
		admin_valid_nouveau_compte: '✅ Votre compte a été validé',
		desactivation_compte_temporaire:
			'⚠️ Votre compte a été désactivé temporairement',
		admin_suppression_compte: '🗑️ Votre compte a été supprimé',
		restoration_compte_supprimer: '🔄 Votre compte a été restauré',
	};

	const subject =
		subjectMap[emailType] || 'Action sur votre compte - Helpdesk ARMP';
	const html = AccountActionEmailTemplate(user, emailType);
	sendMailService(user.usrMail, subject, html);
};

/************************************************************************
 **************** search and get all users ******************************
 ************************************************************************/
const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1);

const sanitizeInput = text => {
	return text
		.replace(/[<>]/g, '') // Supprimer les balises HTML
		.trim()
		.substring(0, 100); // Limiter la longueur
};

export const getUser = async (req, res) => {
	console.log(req.query);
	const deleted =
		!req.query.deleted || req.query.deleted === 'false' ? false : true;
	const valided =
		!req.query.valided || req.query.valided === 'false' ? false : true;
	const limit = parseInt(req.query.limit) || 5;
	const isNoQuery = Object.keys(req.query).length < 1;

	if (req.query.groupe) {
		const groupeId = req.query.groupe;
		const groupe = await models.Groupes.findByPk(groupeId);

		if (!groupe) {
			return res.json({
				message: `Le groupe dont l'ID = ${groupeId} n'existe pas.`,
			});
		}

		return models.Users.findAndCountAll({
			attributes: { exclude: ['usr_password'] },
			where: {
				grpCode: groupeId,
				usrIsValided: valided,
			},
			limit: limit,
		}).then(({ count, rows }) => {
			const message = `Il y a ${count} qui sont dans le groupe ${groupe.grpName}.`;
			return res.json({ message, data: rows, groupe: groupe });
		});
	}

	if (req.query.texte) {
		const texte = sanitizeInput(req.query.texte || '');

		if (texte.length < 2) {
			const message = `Le terme de recherche doit contenir au minimum 2 caractères.`;
			return res.status(400).json({ message });
		}

		return models.Users.findAndCountAll({
			attributes: { exclude: ['usr_password'] },
			where: {
				[Op.or]: {
					usrName: {
						[Op.or]: {
							[Op.like]: `%${texte}%`,
							[Op.startsWith]: capitalize(texte),
						},
					},
					usrFirstname: {
						[Op.or]: {
							[Op.like]: `%${texte}%`,
							[Op.startsWith]: capitalize(texte),
						},
					},
					usrMail: {
						[Op.or]: {
							[Op.like]: `%${texte}%`,
							[Op.startsWith]: texte,
						},
					},
				},
				[Op.and]: {
					usrIsDeleted: deleted,
					usrIsValided: valided,
				},
			},
			order: ['usrname'],
			limit: limit,
		}).then(({ count, rows }) => {
			const message = `Il y a ${count} qui correspondent au terme de recherche ${texte}.`;
			return res.json({ message, data: rows });
		});
	}

	if (isNoQuery) {
		return models.Users.findAll({
			attributes: { exclude: 'usr_password' },
			include: {
				as: 'grpCodeGroupe',
				model: Groupes,
				attributes: ['grp_code', 'grp_name', 'grp_description'],
			},
			order: ['usr_name'],
		})
			.then(users => {
				const message = 'La liste des utilisateurs a bien été récupéré.';
				//It's Delete the password because exclude usr_password is not working;
				users.map(user => {
					delete user.dataValues.usrPassword;
					return user;
				});
				res.json({ message, data: users });
			})
			.catch(error => {
				const message = `La liste des utilisateurs n'a pas pu être récupéré. 
                        Réessayez dans quelques instants.`;
				res.status(500).json({ message, data: error });
			});
	}

	if (valided === true || valided === false) {
		return models.Users.findAndCountAll({
			include: {
				as: 'grpCodeGroupe',
				model: Groupes,
				attributes: ['grp_code', 'grp_name', 'grp_description'],
			},
			attributes: { exclude: ['usr_password'] },
			where: {
				usrIsValided: valided,
			},
			limit: limit,
		})
			.then(({ count, rows }) => {
				const message = `Il y a ${count} qui ${
					valided ? 'sont validé' : 'ne sont pas validé'
				}.`;
				return res.json({ message, data: rows });
			})
			.catch(({ error }) => {
				const message = `Il y a une erreur lors de la recuperation du donnée'}.`;
				return res.json({ message, error: error });
			});
	}
};

export const getUserList = async (req, res) => {
	const limit = parseInt(req.query.limit) || 20;
	const page = parseInt(req.query.page) || 1;
	const order = (req.query.order || 'DESC').toUpperCase();
	const texte = sanitizeInput(req.query.texte || '');
	const offset = (page - 1) * limit;

	// Validation de l'ordre
	if (order !== 'ASC' && order !== 'DESC') {
		return res.status(400).json({
			message: 'Ordre de tri incorrect. Utilisez ASC ou DESC.',
		});
	}

	try {
		let whereCondition = {};

		// Filtre de recherche texte
		if (texte) {
			if (texte.length < 3) {
				const message = `Le terme de recherche doit contenir au minimum 3 caractères.`;
				return res.status(400).json({ message });
			}

			whereCondition[Op.or] = [
				{
					usr_name: {
						[Op.or]: [
							{ [Op.like]: `%${texte}%` },
							{ [Op.startsWith]: capitalize(texte) },
						],
					},
				},
				{
					usr_firstname: {
						[Op.or]: [
							{ [Op.like]: `%${texte}%` },
							{ [Op.startsWith]: capitalize(texte) },
						],
					},
				},
				{
					usr_mail: {
						[Op.like]: `%${texte}%`,
					},
				},
			];
		}

		// Requête principale
		const { count, rows } = await models.Users.findAndCountAll({
			where: whereCondition,
			attributes: [
				'usr_code',
				'usr_name',
				'usr_firstname',
				'usr_mail',
				'usr_img',
				'usr_created_date',
			],
			order: [
				['usr_name', order],
				['usr_firstname', order],
			],
			limit: limit,
			offset: offset,
			distinct: true,
		});

		const nbPage = Math.ceil(parseInt(count) / limit);

		const message = texte
			? `Il y a ${count} utilisateur(s) qui correspondent au terme de recherche "${texte}".`
			: 'La liste des utilisateurs a bien été récupérée.';

		return res.json({
			message,
			data: rows,
			page: page,
			nbPage: nbPage,
			filters: { texte, order },
		});
	} catch (error) {
		const message = `HTTP 500 Internal Server Error.`;
		console.error('Error in getUserList:', error);
		res.status(500).json({ message, error: error.message });
	}
};

/************************************************************************
 **************** get user by id **********************************
 ************************************************************************/
export const getUserById = async (req, res) => {
	models.Users.findByPk(req.params.id)
		.then(usr => {
			if (usr === null) {
				const message = `L'utilisateur demandé n'existe pas. Réessayez avec un autre identifiant.`;
				return res.status(404).json({ message });
			}
			if (usr.usrIsDeleted === true) {
				const message = `L'utilisateur demandé a été supprimé.`;
				return res.status(404).json({ message });
			}

			const message = `L'utilisateur a bien été trouvé.`;
			res.json({ message, data: usr });
		})
		.catch(error => {
			const message = `L'utilisateur n'a pas pu être récupéré. Réessayez dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
};

/************************************************************************
 ****************  Update table users ***********************************
 ************************************************************************/
export const updateUser = async (req, res) => {
	const id = req.params.id;
	let isUpdated = false;
	let user;
	const usrModifDate = moment().format('YYYY-MM-DD HH:mm:ss');
	const {
		usrCode,
		usrNickName,
		usrName,
		usrFirstname,
		usrMail,
		usrPassword,
		usrNewPassword,
		action,
		usrContact,
		usrLogin,
		usrIsValided,
		usrIsDeleted,
		usrImg,
		grpCode,
		usrGender,
		usrAddresse,
		usrBio,
		usrLanguage,
		usrWork,
		usrTheme,
	} = req.body;

	if (usrCode !== id) {
		return res
			.status(400)
			.json({ error: `Le usrCode ne correspond pas à l'URL.` });
	}

	if (!action) {
		return res.status(400).json({ error: `Aucune action spécifiée.` });
	}

	try {
		user = await models.Users.findByPk(id);
		if (!user) {
			return res.status(404).json({ error: `L'utilisateur n'existe pas.` });
		}
	} catch (err) {
		return res
			.status(500)
			.json({ error: `Erreur lors de la recherche de l'utilisateur.` });
	}

	try {
		if (action === 'password-edit') {
			if (!usrPassword) {
				return res
					.status(400)
					.json({ message: `Ancien mot de passe obligatoire.` });
			}

			if (!usrNewPassword) {
				return res.status(400).json({ error: `Nouveau mot de passe absent.` });
			}

			console.log('user.usrPassword', user.usrPassword);

			return bcrypt.compare(
				usrPassword,
				user.usrPassword,
				async (err, isMatch) => {
					console.log('err', err);
					console.log('isMatch', isMatch);

					if (err || !isMatch) {
						console.log('Mot de passe invalide');
						return res.status(400).json({ error: 'Mot de passe incorrect' });
					}

					if (isMatch) {
						await models.Users.update(
							{
								usrModif: `Changement de mot de passe`,
								usrPassword: await bcrypt.hash(usrNewPassword, 10),
								usrModifDate: usrModifDate,
							},
							{ where: { usrCode: id } },
						).then(function (result) {
							isUpdated = result[0] === 1;
							if (isUpdated) {
								return res.json({
									message: `Modification du mot de passe success`,
								});
							} else {
								return res.status(400).json({
									error: `Enregistrement dans mot de passe dans la base de donnée échoé`,
								});
							}
						});
					}
				},
			);
		}

		if (action === 'account-edit') {
			if (!usrName && !usrFirstname && !usrMail) {
				return res
					.status(400)
					.json({ error: `Nom, prénom et mail obligatoire.` });
			}

			const user_mail_is_duplicated = await models.Users.findOne({
				where: {
					usrMail: usrMail,
				},
			});

			const user_usrLogin_is_duplicated = await models.Users.findOne({
				where: {
					usrLogin: usrLogin,
				},
			});

			if (user_mail_is_duplicated) {
				if (user_mail_is_duplicated.usrCode !== id) {
					return res.status(400).json({
						error: `Duplication de L'email, quelqu'un a déja cette addresse email`,
					});
				}
			}

			if (user_usrLogin_is_duplicated) {
				if (user_usrLogin_is_duplicated.usrCode !== id) {
					return res.status(400).json({
						error: `Duplication du login, quelqu'un a déja ce login`,
					});
				}
			}

			return await models.Users.update(
				{
					usrName: usrName,
					usrFirstname: usrFirstname,
					usrContact: usrContact,
					usrMail: usrMail,
					usrLogin: usrLogin,
					usrGender: usrGender,
					usrAddresse: usrAddresse,

					usrNickName: usrNickName,
					usrBio: usrBio,
					usrLanguage: usrLanguage,
					usrWork: usrWork,
					usrTheme: usrTheme,

					usrModifDate: usrModifDate,
					usrModif: `Modification du profil de l'utilisateur`,
				},
				{ where: { usrCode: id } },
			).then(async function (result) {
				isUpdated = result[0] === 1;
				if (isUpdated) {
					const newUser = await models.Users.findByPk(id);
					return res.json({
						message: `Modification du compte success`,
						data: newUser,
					});
				} else {
					return res.status(400).json({
						error: `Enregistrement dans la base de donnée échoé`,
					});
				}
			});
		}

		if (action === 'groupe-edit') {
			if (!grpCode) {
				return res.status(400).json({ error: `Code groupe obligatoire.` });
			}

			return await models.Users.update(
				{
					grpCode: grpCode,
					usrModifDate: usrModifDate,
					usrModif: `Changement du groupe l'utilisateur`,
				},
				{ where: { usrCode: id } },
			).then(async function (result) {
				isUpdated = result[0] === 1;
				if (isUpdated) {
					const newUser = await models.Users.findByPk(id);
					return res.json({
						message: `Changement groupe success`,
						data: newUser,
					});
				} else {
					return res.status(400).json({
						error: `Changement du groupe échoé`,
					});
				}
			});
		}

		if (action === 'validation-edit') {
			if (usrIsValided === undefined) {
				return res.status(400).json({ error: `Statut de validation absent` });
			}

			const [updatedRows] = await models.Users.update(
				{
					usrIsValided: usrIsValided,
					usrModifDate: usrModifDate,
					usrModif: usrIsValided
						? `Validation de l'utilisateur`
						: `Révocation de la validation de l'utilisateur`,
				},
				{ where: { usrCode: id } },
			);

			if (updatedRows === 1) {
				const updatedUser = await models.Users.findByPk(id);
				if (updatedUser) {
					// Envoyer l'email uniquement si usrMail existe
					if (updatedUser.usrMail) {
						const emailType = usrIsValided
							? 'admin_valid_nouveau_compte'
							: 'desactivation_compte_temporaire';
						await sendAccountEmail(updatedUser, emailType);
					}
					return res.json({
						message: `Modification du compte réussie`,
						data: updatedUser,
					});
				}
			}

			return res.status(400).json({
				error: `Échec de la mise à jour en base de données`,
			});
		}

		if (action === 'suppression-status-edit') {
			if (usrIsDeleted === undefined) {
				return res.status(400).json({ error: `Statut de suppression absent` });
			}

			const [updatedRows] = await models.Users.update(
				{
					usrIsDeleted: usrIsDeleted,
					usrModifDate: usrModifDate,
					usrModif: usrIsDeleted
						? `Suppression de l'utilisateur`
						: `Restauration de l'utilisateur`,
				},
				{ where: { usrCode: id } },
			);

			if (updatedRows === 1) {
				const updatedUser = await models.Users.findByPk(id);
				if (updatedUser) {
					if (updatedUser.usrMail) {
						const emailType = usrIsDeleted
							? 'admin_suppression_compte'
							: 'restoration_compte_supprimer';
						await sendAccountEmail(updatedUser, emailType);
					}
					return res.json({
						message: `Modification du compte réussie`,
						data: updatedUser,
					});
				}
			}

			return res.status(400).json({
				error: `Échec de la mise à jour en base de données`,
			});
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: `Une erreur est survenue. Réessayez plus tard. error :`,
			error: error.message || error,
		});
	}
};

/************************************************************************
 ****************  Delete users *****************************************
 ************************************************************************/

export const deleteUser = async (req, res) => {
	const id = req.params.id;

	models.Users.findByPk(id).then(async user => {
		if (user === null) {
			const message = `L'utilisateur demandé n'existe pas. Réessayez avec un autre identifiant.`;
			return res.status(404).json({ message });
		}
		req.body.usrIsDeleted = true;
		req.body.usrModifDate = moment().format('YYYY-MM-DD HH:mm:ss');
		models.Users.update(
			{ usrIsDeleted: true },
			{
				where: { usrCode: id },
			},
		)
			.then(() => {
				models.Users.findByPk(id).then(user => {
					const message = `L'utilisateur est considéré comme supprimé.`;
					res.json({ message, data: user });
				});
			})
			.catch(err => {
				try {
					const message = `L'utilisateur n'a pas pu être supprimé. Réessayez dans quelques instants.`;
					res.status(500).json({ message, data: err.parent.detail });
				} catch (higth_err) {
					const message = `Serveur error.`;
					res.status(500).json({ message, data: higth_err });
				}
			});
	});
};

/************************************************************************
 ****************  get profile users from backend *****************************************
 ************************************************************************/

export const getUserProfile = async (req, res) => {
	if (!req.params.id) {
		return res
			.status(403)
			.json({ message: 'Accès refusé: aucun utilisateur associé' });
	}
	const usrCode = req.params.id;

	const userfolder = path.join(ProfileFolderFullPath, usrCode);

	try {
		if (!fs.existsSync(userfolder)) {
			fs.mkdirSync(userfolder, { recursive: true });
		}
		const filesInFolder = fs.readdirSync(userfolder);
		return res.json({ message: 'Fichier sur le serveur', filesInFolder });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ message: 'Erreur lors de la création du dossier' });
	}
};

export const addUserProfile = async (req, res) => {
	const usrCode = req.params?.id;
	if (!usrCode) {
		return res.json({ message: 'Aucun utilisateur associé' });
	}

	const tmpFilePath = req.file.path;
	const fileExtension = req.file.originalname.split('.')[1];
	const newFileName = `${moment().format(
		'YYYY-MM-DD_HH-mm-ss',
	)}.${fileExtension}`;
	const DefinitifUserProfilePath = path.join(
		ProfileFolderFullPath,
		req.body.usrCode,
		newFileName,
	);
	const userProfilefolderPath = path.join(
		ProfileFolderFullPath,
		req.body.usrCode,
	);
	const userDestanationBackupPath = path.join(
		backUpFolderFullPath,
		req.body.usrCode,
	);

	try {
		//Create the folder if note existe before move it user profile
		if (!fs.existsSync(userProfilefolderPath)) {
			fs.mkdirSync(userProfilefolderPath, { recursive: true });
		}

		if (!fs.existsSync(userDestanationBackupPath)) {
			fs.mkdirSync(userDestanationBackupPath, { recursive: true });
		}

		//Mouve all files in the userProfileFolder if exist,
		// all files because it can be contain error file.
		if (fs.existsSync(userProfilefolderPath)) {
			const files = fs.readdirSync(userProfilefolderPath);
			for (const file of files) {
				const filePath = path.join(userProfilefolderPath, file);
				const destanationBackup = path.join(userDestanationBackupPath, file);
				fs.renameSync(filePath, destanationBackup);
			}
		}

		//Mouve the image file from tmp to userProfileFolder
		fs.renameSync(tmpFilePath, DefinitifUserProfilePath, err => {
			if (err) {
				console.error(err);
				return res.status(500).json({
					message:
						'Error 500: Serveur error, erreur lors du déplacement du fichier',
				});
			}
		});

		const saveProfilToDB =
			`${ProfileFolder}${usrCode}/` + path.basename(DefinitifUserProfilePath);
		models.Users.update(
			{
				usrImg: saveProfilToDB,
			},
			{
				where: { usrCode: usrCode },
			},
		)
			.then(() => {
				models.Users.findByPk(usrCode).then(user => {
					const message = `Le profile de l'utilisateur a bien été modifié.`;
					res.json({ message, data: user });
				});
			})
			.catch(err => {
				try {
					const message = `Le profile de l'utilisateur n' a pas pu été modifié. Réessayez dans quelques instants.`;
					res.status(500).json({ message, data: err.parent.detail });
				} catch (higth_err) {
					const message = `Error 500: Serveur error.`;
					res.status(500).json({ message: message, data: higth_err });
				}
			});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message:
				'Error 500: Serveur error, erreur lors de la création du dossier',
		});
	}
};
