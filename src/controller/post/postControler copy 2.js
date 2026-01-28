import { sequelize } from "../../db/config/database.js";
import { Op, where } from "sequelize";
import "../../services/env.js";
import moment from "moment";
import initModels from "../../db/models/init-models.js";
import Users from "../../db/models/users.js";
import fs  from "node:fs";
import path from 'path';
import { saveFileCreate } from "./saveFileCreate.js";
import { saveFileEdit } from "./saveFileEdit.js";
import { BackupDeleteFiles } from "./BackupDeleteFiles.js";
import { sanitizeFileName } from "../../services/sanitizeFileName.js";
import { generateUniqueFileName } from "../../services/generateUniqueFileName.js";
import { generateId } from "../../services/generateId.js";
import { getPreciseGMTTime } from "../../services/timeSync.js";

const models = initModels(sequelize);
const publicFolder = process.env.APP_PUBLIC_FOLDER;
const tmpFolder = publicFolder + "/tmp";
const postFolderName =  '/Post';
const postFolderPath = publicFolder + postFolderName;


/************************************************************************
 **************** Create Post ******************************
 ************************************************************************/
export const postPost = async (req, res) => {
  console.log("body", req.body)
  const { postTitle, postDescription , usrCode } = req.body;
  const transaction = await sequelize.transaction();

  if (!postTitle) {
    return res.status(500).json({ error: `Aucun titre` });
  }

  if (!postDescription) {
    return res.status(500).json({ error: `Aucun description` });
  }

  if (!usrCode) {
		return res.status(500).json({ error: `Aucun utilisateur associé` });
	}

  try {
    const post_is_exist = await models.Post.findOne({
			where: { postTitle },
			transaction,
		});
    if (post_is_exist) {
        return res.status(400).json({ error: `Le titre de Votre post existe déjà` });
    }

    const postCode = await generateId('Post');
    
    const savePostData = {
      postCode: postCode,
      usrCode: usrCode,
      postTitle: postTitle, 
      postDescription:postDescription,
			postCreatedDate: getPreciseGMTTime().iso,
			postIsValided: false,
			postIsDeleted: false,
		};

    // Create a new post
    console.log('savePostData', savePostData);
    const newpost = await models.Post.create(savePostData, { transaction });

    const filesToSave = await mouveTmptopostFolderPath({
			usrCode: usrCode,
			postCode: postCode,
		});

    console.log('filesToSave', filesToSave);
    

    if (filesToSave){
			await models.PostFileJoint.bulkCreate(filesToSave, { transaction });
    }

    await transaction.commit();

    const message = `Création post éffectue avec succès.`;
    res.json({ message, post: newpost });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/************************************************************************
 **************** search and get all Post ******************************
 ************************************************************************/
const capitalize = (str) => str.charAt(0).toUpperCase() + str.substring(1);

export const getPost = async (req, res) => {
  if (req.query.texte) {
    const texte = req.query.texte;
    const limit = parseInt(req.query.limit) || 5;
    const withDeletedFiles = req.query.withDeletedFiles || false;

    if (texte.length < 2) {
      const message = `Le terme de recherche doit contenir au minimum 2 caractères.`;
      return res.status(400).json({ message });
    }

    return models.Post.findAndCountAll({
      where: {
        [Op.or] : {
            postTitle: {
              [Op.or]: {
                [Op.like]: `%${texte}%`,
                [Op.startsWith]: capitalize(texte),
              },
            },
            postDescription: {
                [Op.or]: {
                  [Op.like]: `%${texte}%`,
                  [Op.startsWith]: capitalize(texte),
                },
            },

        } 
      },
      include: [
        {
          as: "usrCodeUser",
          model: Users,
          attributes: ["usr_code", "usr_name", "usr_firstname", "usr_mail", "usr_img"],
        },
        {
          as: "postFileJoints",
          model: models.PostFileJoint,
        },
      ],
      order: ["post_title"],
      limit: limit,
    }).then(({ count, rows }) => {
      const message = `Il y a ${count} qui correspondent au terme de recherche ${texte}.`;
      return res.json({ message, data: rows });
    });
  } else {
    models.Post.findAll({
			include: [
				{
					as: 'usrCodeUser',
					model: Users,
					attributes: [
						'usr_code',
						'usr_name',
						'usr_firstname',
						'usr_mail',
						'usr_img',
					],
				},
				{
					as: 'postFileJoints',
					model: models.PostFileJoint,
				},
			],
			order: ['post_title'],
		})
			.then(async post => {
				const message = 'La liste des Post a bien été récupéré.';

				const postresulte = await Promise.all(
					post.map(async element => {
						const findComment = await models.Comment.findAll({
							where: {
								postCode: element.postCode,
							},
						});
						element.setDataValue('Comment', findComment.length);
						return element;
					}),
				);

				res.json({ message, data: postresulte });
			})
			.catch(error => {
				const message = `HTTP 500 Internal Server Error.`;
				res.status(500).json({ message, data: error });
			});
  }
};

/************************************************************************
 **************** get Post by id **********************************
 ************************************************************************/
export const getPostById = async (req, res) => {
  models.Post.findByPk(req.params.id)
    .then((post) => {
      if (post === null) {
        const message = `Votre post demandé n'existe pas.`;
        return res.status(404).json({ message });
      }

      const message = `Votre post a bien été trouvée.`;
      res.json({ message, data: post });
    })
    .catch((error) => {
      const message = `Serveur erreur`;
      res.status(500).json({ message, data: error });
    });
};

/************************************************************************
 ****************  Update Post ***********************************
 ************************************************************************/
export const updatePost = async (req, res) => {
  const id = req.params.id;
  const postTitle = req.body.postTitle;
  const postCode = req.body.postCode;
  const usrCode = req.body.usrCode;

  const is_postCode_match_to_url = req.body.postCode != id;
  let oldpostObj = [];
  var is_not_valid_input =
    req.body.postTitle.length <= 2 ;

  if (is_not_valid_input) {
    const message = `Formulaire invalid : le titre de Votre post trop petite `;
    return res.status(404).json({ message });
  }

  if (is_postCode_match_to_url) {
    const message = `Formulaire invalid: id URL et formulaire ne corresponde pas `;
    return res.status(404).json({ message });
  }

    const finded_title = await models.Post.findOne({
      where: {
        [Op.and]:{
            postTitle: postTitle,
        [Op.not]:{
            postCode: id,
        }
      }}
    });

    if (finded_title) {
      return res.status(400).json({ error: `Le titre de Votre post existe déjà` });
    }

    models.Post.findByPk(id).then(async (oldpost) => {
      const postModifDate = moment().format("YYYY-MM-DD HH:mm:ss");
      if (oldpost === null) {
        const message = `Le post demandée n'existe pas.`;
        return res.status(404).json({ message });
      }
  
      //insert history to postModif
    if(oldpost.postModif === null || oldpost.postModif ===''){
      oldpostObj.push({postDescription: oldpost.postDescription, postModifDate: postModifDate,});
    }
    else{
      oldpostObj = JSON.parse(oldpost.postModif) || '{}';
      oldpostObj.push({postDescription: oldpost.postDescription, postModifDate: postModifDate,});
    }

    req.body.postCreatedDate = oldpost.postCreatedDate;
    req.body.postModifDate = postModifDate;
    req.body.postModif = JSON.stringify( oldpostObj);
    req.body.postIsDeleted = oldpost.postIsDeleted || false;
    req.body.postIsValided = oldpost.postIsValided || false;
    
    await BackupDeleteFiles({usrCode: usrCode, postCode: postCode, specifiedFilesToDelete: null});
    await saveFileEdit(usrCode ,postCode);
    
    models.Post.update(req.body, {
      where: { postCode: id },
    })
      .then(() => {
        models.Post.findByPk(id).then((post) => {
          const message = `Votre post a bien été modifié.`;
          res.json({ message, data: post });
        });
      })
      .catch((err) => {
        console.log(err);
        try {
          const message = `Votre post n'a pas pu être modifié.`;
          res.status(500).json({ message: message, data: err.parent.detail });
        } catch (higth_err) {
          const message = `Serveur error.`;
          res.status(500).json({ message: message, data: higth_err });
        }
      });
  });
};

/************************************************************************
 ****************  Delete Post *****************************************
 ************************************************************************/
export const deletePost = async (req, res) => {
  const id = req.params.id;
  models.Post.findByPk(id).then(async (post) => {
    if (post === null) {
      const message = `Le post demandé n'existe pas.`;
      return res.status(404).json({ message });
    }

    models.Post.update({
      postIsDeleted : true

    },{ where: { postCode: id } })
      .then((_) => {
        const message = `Le post est supprimé.`;
        res.json({ message });
      })
      .catch((err) => {
        try {
          const message = `Le post n'a pas pu être supprimé.`;
          res.status(500).json({ message, data: err.parent.detail });
        } catch (higth_err) {
          const message = `Serveur error.`;
          res.status(500).json({ message, data: higth_err });
        }
      });
  });
};

/************************************************************************
 ****************  Delete Restore disable enable Post ***********************************
 ************************************************************************/
 export const deleteRestoreDisableEnablePost = async (req, res) => {
  const id = req.params.id;
  const usrCode = req.body.usrCode;
  const postIsDeleted =  req.body.postIsDeleted;
  const postIsValided = req.body.postIsValided;
  let message;
  let adminAction;
  let oldpostObj = [];

  models.Post.findByPk(id).then(async (oldpost) => {
    const postModifDate = moment().format("YYYY-MM-DD HH:mm:ss");
    if (oldpost === null) {
      const message = `Le post demandée n'existe pas.`;
      return res.status(404).json({ message });
    }

    if(postIsDeleted == null){
      req.body.postIsDeleted = oldpost.postIsDeleted;
      if(postIsValided){
        message = `Ce poste a bien été désactivé.`;
        adminAction= `Désactivation.`;
      }
      if(!postIsValided){
        message = `Ce poste a bien été activé.`;
        adminAction= `Activation.`;
      }
    }
    if(postIsValided == null){
      req.body.postIsValided = oldpost.postIsValided;
      if(postIsDeleted){
        message = `Ce poste est temporairement mise en poubelle.`;
        adminAction= `Suppression.`;
      }
      if(!postIsDeleted){
        message = `Ce poste a bien été restoré.`;
        adminAction= `Restoration.`;
      }
    }
  
      //insert history to postModif
    if(oldpost.postModif === null || oldpost.postModif ===''){
      oldpostObj.push({adminCode: usrCode, adminAction: adminAction, postModifDate: postModifDate});
    }

    else{
      oldpostObj = JSON.parse(oldpost.postModif) || '{}';
      oldpostObj.push({adminCode: usrCode, adminAction: adminAction, postModifDate: postModifDate});
    }

    req.body.postCreatedDate = oldpost.postCreatedDate;
    req.body.postModifDate = postModifDate;
    req.body.postModif = JSON.stringify( oldpostObj);
    
    models.Post.update({
      postIsValided : req.body.postIsValided,
      postIsDeleted : req.body.postIsDeleted,
      postModifDate : req.body.postModifDate,
      postModif     : req.body.postModif,
    }, {
      where: { postCode: id },
    })
      .then(() => {
        models.Post.findByPk(id,{raw:true}).then((post) => {
          res.json({ message, data: post });
        });
      })
      .catch((err) => {
        console.log(err);
        try {
          message = `Votre post n'a pas pu être modifié.`;
          res.status(500).json({ message: message, data: err.parent.detail });
        } catch (higth_err) {
          message = `Serveur error.`;
          res.status(500).json({ message: message, data: higth_err });
        }
      });
  });
};


export const AddFileTmpPost = async (req, res) => {
	const allowedExtensions = ['jpg', 'jpeg', 'png', 'csv', 'doc', 'docx', 'pdf'];
	const allowedMIMEType = [
		'image/png',
		'image/jpeg',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/msword',
		'text/csv',
		'application/pdf',
	];
	const maxFiles = 12;
  const { usrCode, pfjCode } = req.body;

	if (!usrCode) {
		cleanupTmpFiles(req.files);
		return res.status(400).json({ message: 'Aucun utilisateur associé' });
	}

  if (!pfjCode) {
		cleanupTmpFiles(req.files);
		return res.status(400).json({ message: 'id temporairaire absent' });
	}

	if (!req.files || req.files.length === 0 || req.files.length > maxFiles) {
		cleanupTmpFiles(req.files);
		return res.status(400).json({ message: 'Nombre de fichiers non valide' });
	}

	for (const file of req.files) {
		const fileExtension = file.originalname.split('.').pop().toLowerCase();

		if (!allowedExtensions.includes(fileExtension)) {
			cleanupTmpFiles(req.files);
			return res.status(400).json({ message: 'Type de fichier non autorisé' });
		}

		if (!allowedMIMEType.includes(file.mimetype)) {
			cleanupTmpFiles(req.files);
			return res.status(400).json({ message: 'Type de fichier non autorisé' });
		}
	}

	const folderName = path.join(tmpFolder, usrCode);
	const fileMetadata = []; // Tableau pour stocker les métadonnées

	try {
		if (!fs.existsSync(folderName)) {
			fs.mkdirSync(folderName, { recursive: true });
		}

		console.log('req.files', req.files);

		for (const file of req.files) {
			const tmpPath = file.path;
			const fileExtension = file.originalname.split('.').pop().toLowerCase();
			const utf8Buffer = Buffer.from(file.originalname, 'binary').toString('utf-8'); // 'binary' to UTF-8 encoded Outputs buffer
			const securedOriginalName = sanitizeFileName(utf8Buffer);
			const newFileName = `${generateUniqueFileName()}.${fileExtension}`;
			const newPath = path.join(folderName, newFileName);

			fs.renameSync(tmpPath, newPath);
			fileMetadata.push({
				postCode: null,
				pfjCode: pfjCode,
				usrCode: usrCode,
				pfjPath: newPath,
				pfjType: file.mimetype,
				pfjSize: file.size,
				pfjName: securedOriginalName,
			});
		}

    console.log('fileMetadata', fileMetadata);
    

		updateJsonFile(folderName, fileMetadata);

		return res.json({ message: 'Fichiers téléchargés avec succès' });
	} catch (err) {
		cleanupTmpFiles(req.files);
		console.error(err);
		return res
			.status(500)
			.json({ message: 'Erreur lors du traitement des fichiers' });
	}
};



export const getAllFilesTmpPost = async (req, res) => {
  let jsonData = [];
  let message;
  const usrCode = req.query.usrCode;
  if (!usrCode) {
		return res.json({ message: 'Aucun utilisateur associé' });
	}

  const folderName = path.join(tmpFolder, usrCode);

  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }

		try {
			const jsonFilePath = path.join(folderName, `/info.json`);
			const data = await fs.promises.readFile(jsonFilePath, 'utf8');
			jsonData = JSON.parse(data).map(file => ({
				...file,
				pfjPath: file.pfjPath.replace(
					`${tmpFolder}/${usrCode}/`,
					`/tmp/${usrCode}/`,
				),
			}));
			message = 'Fichier sur le serveur';
		} catch (err) {
			message = 'Fichier uploadé vide';
		}

    const filesInFolder = fs.readdirSync(folderName);
    return res.json({
			message: message,
			filesInFolder: filesInFolder,
			metaData: jsonData,
		});

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la création du dossier' });
  }
};

export const deleteFilesTmpPost = async (req, res) => {
  const { pfjCode, usrCode } = req.query;
  if (!usrCode) {
		return res.json({ message: 'Aucun utilisateur associé' });
	}

  if (!pfjCode) {
		return res.json({ message: 'pfjCode: absent' });
	}

  console.log('req.query', req.query);
  
	const tmpFolderPath = path.join(tmpFolder, `/${usrCode}`);
	const jsonFilePath = path.join(tmpFolderPath, 'info.json');
	let errorMessage;

	try {
		// 1. Lire le fichier info.json
		let jsonData;
		try {
			const data = await fs.promises.readFile(jsonFilePath, 'utf8');
			jsonData = JSON.parse(data);
		} catch (err) {
			errorMessage = `❌ Impossible de lire le fichier info.json pour ${usrCode}`;
			console.error(errorMessage, err);

			return res.status(400).json({ message: errorMessage, ismpty: true });
		}

		// 2. Trouver le fichier à supprimer
		const fileToDelete = jsonData.find(file => file.pfjCode === pfjCode);
		if (!fileToDelete) {
			errorMessage = `⚠️ Aucun fichier trouvé avec l'id du "${pfjCode}"`;
			console.warn(errorMessage);
			return res.status(400).json({ message: errorMessage });
		}

		// 3. Supprimer le fichier physique
		const filePathToDelete = fileToDelete.pfjPath;
		try {
			await fs.promises.unlink(filePathToDelete);
		} catch (err) {
			if (err.code === 'ENOENT') {
				console.warn(`⚠️ Le fichier ${filePathToDelete} n’existe plus.`, err);
			} else {
				console.error(
					`❌ Erreur lors de la suppression du fichier : ${filePathToDelete}`,
					err,
				);
				throw err;
			}
		}

		// 4. Mettre à jour le tableau JSON (supprimer l'entrée)
		const updatedData = jsonData.filter(file => file.pfjCode !== pfjCode);

		// 5. Si le tableau est vide, on peut aussi supprimer le dossier tmp/usrCode
		if (updatedData.length === 0) {
      // On supprime le fichier vide même si elle vide, cas dernier fichier supprimé.
      await fs.promises.unlink(jsonFilePath);

			return res.json({
				message: `Les fichier coté serveur sont vide`,
				ismpty: true,
			});

		} else {
			// Sinon, sauvegarder le fichier info.json mis à jour
			await fs.promises.writeFile(
				jsonFilePath,
				JSON.stringify(updatedData, null, 2),
				'utf8',
			);
			return res.json({
				message: `📝 info.json mis à jour après suppression.`,
			});
		}
	} catch (err) {
		return res
			.status(400)
			.json({
				message: `❌ Erreur lors de la suppression du fichier pour l'user ${usrCode}`,
			});
	}
};

async function mouveTmptopostFolderPath({ usrCode , postCode}) {
	const jsonFilePath = path.join(tmpFolder, `/${usrCode}/info.json`);
	const sourceFolderPath = path.join(tmpFolder, `/${usrCode}`);
	const destinationFolderPath = path.join(postFolderPath, usrCode);
	const destinationJsonFilePath = path.join(destinationFolderPath, `/${postCode}_info.json`);

	try {
		const rawData = await fs.promises.readFile(jsonFilePath, 'utf8');

		const jsonData = JSON.parse(rawData);
		// Supprimer le chemin relatif
		const updatedData = jsonData.map((file, index) => ({
			...file,
			pfjPath: file.pfjPath.replace(
				`${tmpFolder}/${usrCode}/`,
				`${postFolderName}/${usrCode}/`,
			),
			pfjCode: `${postCode}_${index}`,
			postCode: postCode,
		}));

		console.log('updatedData', updatedData);

		try {
			await fs.promises.access(destinationFolderPath);
		} catch {
			await fs.promises.mkdir(destinationFolderPath, { recursive: true });
		}

		const files = await fs.promises.readdir(sourceFolderPath);

		if (files.length === 0) {
			console.log(
				`📂 Le dossier "${sourceFolderPath}" est vide. Aucun fichier à déplacer.`,
			);
			return '';
		}

		// 4. Déplacer chaque fichier un par un
		for (const fileName of files) {
			const sourceFile = path.join(sourceFolderPath, fileName);
			const destFile = path.join(destinationFolderPath, fileName);

			try {
				// Vérifie qu'on ne déplace pas un répertoire
				const stats = await fs.promises.stat(sourceFile);
				if (!stats.isFile()) {
					console.warn(`📁 Ignoré (ce n'est pas un fichier) : ${sourceFile} ,et fichier json ignoré `);
					continue;
				}

        if (fileName === "info.json") {
          await fs.promises.unlink(sourceFile);
					console.warn(`✅ fichier info.json supprimé`);
					continue;
				}

				// Déplacer le fichier
				await fs.promises.rename(sourceFile, destFile);
				console.log(`✅ Fichier déplacé : ${sourceFile} → ${destFile}`);
			} catch (err) {
				console.error(
					`❌ Impossible de déplacer le fichier "${fileName}" :`,
					err.message,
				);
			}
		}

		await fs.promises.writeFile(
			destinationJsonFilePath,
			JSON.stringify(updatedData, null, 2),
			'utf8',
		);

		console.log('✅ Fichier info.json mis à jour et déplacé.');
		return updatedData;
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.warn("⚠️ Le fichier info.json n'existe pas encore.");
		} else {
			console.error('❌ Erreur lors du déplacement ou mise à jour:', err);
		}
		return null;
	}
}


export const PostEditRequest = async (req, res) => {
  if (!req.params.usr_code) {
    return res.status(400).json({ message: 'Aucun utilisateur associé' });
  }

  if (!req.params.post_code) {
    return res
			.status(400)
			.json({ message: 'Nom du fichier à supprimer ou deleteAll requis' });
  }

  const usrCode = req.params.usr_code
  const postCode = req.params.post_code
  const tmpFolderUser = path.join(tmpFolder, usrCode);
  const post = await models.Post.findByPk(postCode);

  if (post === null) {
		return res.status(400).json({ message : `Ce post n'existe pas.` });
	}


  models.PostFileJoint.findAll({ 
      where: { postCode: postCode },
      raw: true 
      })
		.then(async files => {
			if (files === null) {
				const message = `Post demande pas de fichier.`;
				return res.json({ message });
			}

			//Delete content of tmpFolder if exist
			if (fs.existsSync(tmpFolderUser)) {
				const files = fs.readdirSync(tmpFolderUser);
				for (const file of files) {
					const filePath = path.join(tmpFolderUser, file);
					fs.unlinkSync(filePath);
				}
			}

			if (!fs.existsSync(tmpFolderUser)) {
				fs.mkdirSync(tmpFolderUser, { recursive: true });
			}

			const filePath = path.join(tmpFolderUser, 'info.json');
			fs.writeFileSync(filePath, JSON.stringify(files, null, 2));

			const message = `Seccess.`;
			res.set('Cache-Control', 'no-store');
			return res.json({ message });
		})
		.catch(err => {
			console.error('Erreur lors de la requête :', err);
			res
				.status(500)
				.json({
					message: 'Une erreur est survenue lors du traitement de la requête.',
				});
		});
};


// Fontion utile
const cleanupTmpFiles = (files) => {
  if (!files || files.length === 0) return;

  for (const file of files) {
    try {
      const filePath = file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Erreur lors de la suppression du fichier ${file.originalname}:`, err);
    }
  }
};

async function updateJsonFile(folderName, fileMetadata) {
	const filePath = path.join(folderName, 'info.json');

	let oldData = [];

	try {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if (err) {
				console.error(err);
				fs.writeFileSync(filePath, JSON.stringify(fileMetadata, null, 2));
				return [];
			}

      console.log("file exist data", data);
      
			oldData = JSON.parse(data);
			const finalData = [...fileMetadata, ...oldData];

			// Écrire dans le fichier
			fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2));
			console.log('Les données ont été sauvegardées dans info.json');
		});
		console.log('data', oldData);
	} catch (err) {
		if (err.code !== 'ENOENT') {
			console.error('Erreur lors de la lecture du fichier:', err);
			return;
		}
		// Si le fichier n'existe pas encore, on continue avec oldData = []
		console.log('Le fichier info.json n’existe pas encore.');
	}
}


