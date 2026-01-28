import { sequelize } from "../../../db/config/database.js";
import { Op, Sequelize } from "sequelize";
import initModels from "../../../db/models/init-models.js";
import moment from "moment";
import Users from "../../../db/models/users.js";
import Messages from "../../../db/models/messages.js";
import fs  from "node:fs";
import path from 'path';
import MsgFileJoint from "../../../db/models/msg_file_joint.js";

var models = initModels(sequelize);
const messagePrefix = "msg";
const PrefixSeparator = "-";
const publicFolder = process.env.APP_PUBLIC_FOLDER;
const tmpFolder = publicFolder + "/Message/FileJointTmp/";

export async function postMessage(req, res) {
  // Verification si toute est correcte avant le sauvegard
  const UsrCodeIsNullOrMissing = !req.body.usrCode || req.body.usrCode === null;
  const MessageIsNullOrMissing =
    !req.body.msgContenu || req.body.msgContenu === null;
  const DestinationIsNullOrMissing =
    !req.body.destCodeListe || req.body.destCodeListe === null;
  const limit = parseInt(req.query.limit) || 20;

  if (UsrCodeIsNullOrMissing) {
    return res.status(400).json({ error: `Users id vide` });
  }

  if (DestinationIsNullOrMissing) {
    return res
      .status(400)
      .json({ error: `La dest_code (destination) ne peut pas être vide` });
  }

  if (MessageIsNullOrMissing) {
    return res.status(400).json({ error: `Le message ne peut pas être vide` });
  }



  //générer l'id message
  const getLastMessage = await models.Messages.findAll({
    order: [["msg_created_date", "DESC"]],
    raw: true,
    limit: limit,
  });

  const last_msg_code = !getLastMessage.length
    ? 0
    : getLastMessage
        .map(function (id) {
          return parseInt(id.msgCode.match(/\d+/g));
        })
        .reduce((previousId, currentId) =>
          previousId > currentId ? previousId : currentId
        );

  const msgCode = messagePrefix + PrefixSeparator + (last_msg_code + 1);
  const msgCreatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
  const msgContenu = req.body.msgContenu;
  const destCodeListe = req.body.destCodeListe;
  const msgPieceJoint = req.body.msgPieceJoint || null;
  const usrCode = req.body.usrCode;

  const msgToSave = {
    msgCode: msgCode,
    usrCode: usrCode,
    msgContenu: msgContenu,
    msgPieceJoint: msgPieceJoint,
    msgCreatedDate: msgCreatedDate,
    msgIsDeleted: false,
    msgModifDate: null,
  };

  const findUserMissing= [];
  let errorMissingDestination = false;
    for (const dest of destCodeListe) {
      if(!dest.destCode){
        errorMissingDestination = true ;
      }
      const user = await models.Users.findByPk(dest.destCode);
      if(!user){
        findUserMissing.push(dest.destCode);
      }
  };

  if(errorMissingDestination){
    const messageError = "Attention, destCode absent dans destCodeListe ";
    res.status(400).json({ error : messageError , destCodeListe : findUserMissing });
    return;
  }

  console.log('findUserMissing',findUserMissing)
  if(findUserMissing.length > 0){
    const messageError = "Les utilisateur suivant n'existe pas dans la base de donnée";
    res.status(400).json({ error : messageError , destCodeListe : findUserMissing });
    return;
  }

  const destToSave = destCodeListe.map((dest) => {
    return {
      msgCode: msgCode,
      usrCode: dest.destCode,
      destSenderCode: usrCode,
      destIsReaded: false,
      destIsDeleted: false,
      destCreatedDate: msgCreatedDate,
      destModifDate: null,
    };
  });

  try {
    // Sauvegarde le message dans la base de donnée
    const newMessage = await models.Messages.create(msgToSave);
    const message = `Message envoyé.`;
    const saveStatus = [];
    for (const dest of destToSave) {
      const resulte = await models.Destination.create(dest);
      saveStatus.push(resulte);
    }
      
    res.json({ message, newMessage: newMessage, saveStatus: saveStatus });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur de destination" });
  }
}

export async function updateMessage(req, res) {
  const UsrCodeIsNullOrMissing = !req.body.usrCode || req.body.usrCode === null;
  const MesCodeIsNullOrMissing =
    !req.body.msgCode || req.body.msgCode === null;
  const id = req.params.id;
  const is_msgCode_match_to_url = req.body.msgCode != id;

  if (UsrCodeIsNullOrMissing) {
    return res.status(400).json({ error: `usrCode vide` });
  }

  if (MesCodeIsNullOrMissing) {
    return res.status(400).json({ error: `msgCode vide` });
  }

  if (is_msgCode_match_to_url) {
    const message = `Formulaire invalid: le msgCode ne correspont pas à l'URL `;
    return res.status(404).json({ message });
  }

  const oldMessage = await models.Messages.findByPk(id);
  if (!oldMessage) {
    const message = ` Le msgCode démendé n'exist pas `;
    return res.status(404).json({ message });
  }

  if(oldMessage.usrCode !== req.body.usrCode){
    const message = ` Le msgCode entrée n'appartient pas à l'usrCode entrée `;
    return res.status(404).json({ message });
  }

  const msgCode = req.body.msgCode;
  const msgModifDate = moment().format("YYYY-MM-DD HH:mm:ss");
  const msgContenu = req.body.msgContenu || oldMessage.msgContenu;
  const msgIsDeleted = req.body.msgIsDeleted || false;
  const msgPieceJoint = req.body.msgPieceJoint || oldMessage.msgPieceJoint;
  const usrCode = req.body.usrCode;
  let oldMessageObj = [];

  //insert history to msgModif
  if(oldMessage.msgModif === null || oldMessage.msgModif ===''){
    oldMessageObj.push({msgContenu: oldMessage.msgContenu, msgPieceJoint: msgPieceJoint  ,  msgModifDate: msgModifDate,});
  }
  else{
    oldMessageObj = JSON.parse(oldMessage.msgModif) || '{}';
    oldMessageObj.push({msgContenu: oldMessage.msgContenu, msgPieceJoint: msgPieceJoint, msgModifDate: msgModifDate,});
  }

  const msgToSave = {
    msgCode: msgCode,
    usrCode : usrCode,
    msgContenu: msgContenu,
    msgPieceJoint: msgPieceJoint,
    msgIsDeleted: msgIsDeleted,
    msgModif: JSON.stringify(oldMessageObj),
    msgModifDate: msgModifDate,
  };

  try {
    await models.Destination.update({destIsDeleted: msgIsDeleted},{
      where: { msgCode: msgCode }
    })
    await models.Messages.update(msgToSave, {
      where: { msgCode: msgCode },
    })
      .then(async (_) => {
        const newMessage = await models.Messages.findByPk(req.body.msgCode);
        const message = `Edition message éffectue avec succès.`;
        res.json({ message, newMessage: newMessage });
      })
      .catch((error) => {
        const message = `Edition message éffectue avec succès.`;
        res.status(400).json({ message: message, error });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/************************************************************************
 **************** search and get Messages ******************************
 ************************************************************************/

export async function getMessage(req, res) {
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = 0 + (page - 1) * limit;
  const senderCode = req.query.sender_code;
  const destinationCode = req.query.destination_code;
  const destIsDeleted = req.query.destIsDeleted || false;
  var data = [];

  if (!senderCode) {
    const errormsg = "SenderCode absent";
    return res.status(400).json({ error: errormsg });
  }

  const isSenderExist = await models.Users.findByPk(senderCode);
  const isDestinationExist = await models.Users.findByPk(destinationCode);

  if (!isSenderExist) {
    return res
      .status(400)
      .json({ error: "Ce sender_code n'exist pas dans la base de donnée" });
  }

  if (destinationCode) {
    if (!isDestinationExist) {
      return res
        .status(400)
        .json({
          error: "Ce destination_code n'exist pas dans la base de donnée",
        });
    }
  }

  if (destinationCode) {
    await models.Destination.findAndCountAll({
			where: {
				[Op.and]: [
					{
						[Op.or]: [
							{
								destSenderCode: destinationCode,
								usrCode: senderCode,
							},
							{
								destSenderCode: senderCode,
								usrCode: destinationCode,
							},
						],
					},
					{
						destIsDeleted: destIsDeleted,
					},
				],
			},
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
					as: 'msgCodeMessage',
					model: Messages,
					attributes: [
						'msg_code',
						'usr_code',
						'msg_contenu',
						'msg_created_date',
						'msg_modif_date',
					],
				},
				{
					as: 'msgFileJoints',
					model: MsgFileJoint,
					where: {
						// Ajout de la condition de jointure
						msg_code: Sequelize.col('msgCodeMessage.msg_code'),
					},
					required: false,
					attributes: [
						'msg_file_code',
						'usr_code',
						'msg_file_path',
						'msg_file_type',
						'msg_file_client_file_name',
						'msg_file_is_deleted',
						'msg_file_created_date',
						'msg_file_size',
					],
				},
			],
			limit: limit,
			offset: offset,
			order: [['dest_created_date', 'DESC']],
			attributes: [
				'msg_code',
				['usr_code', 'dest_code'],
				['dest_sender_code', 'sender_code'],
				'dest_is_readed',
				'dest_is_deleted',
				'dest_created_date',
				'dest_modif_date',
			],
		}).then(({ count, rows }) => {
			const nbPage = Math.ceil(parseInt(count) / limit);
			data.message = `Voici les messages (${count}) pour l'id source ${senderCode} et l'id destinataire =  ${destinationCode}. page ${page}/${nbPage}`;
			data.rows = rows;
			data.page = page;
			data.nbPage = nbPage;
		});
  }

  if (!destinationCode) {

  const uniqueDestCode = {};
  const uniqueSenderCode = {};
  let messageUser = {};
  let lastMessageCodePerUser = {}

  messageUser = await models.Destination.findAndCountAll({
    where: {
        [Op.or] : {destSenderCode: senderCode , usrCode: senderCode } ,
        destIsDeleted: destIsDeleted,
    },
    raw:true,
    order: ["dest_created_date"],
    limit: 1000,
    attributes: [
      "msg_code","msg_code",
      ["usr_code", "dest_code"],
      ["dest_sender_code", "sender_code"],
    ],
  });

  for (const msg of messageUser.rows) {
    uniqueDestCode[msg.dest_code] = msg;
    uniqueSenderCode[msg.sender_code] = msg;
  };

  if (uniqueSenderCode[senderCode]) {
    delete uniqueSenderCode[senderCode];
  }

  if(uniqueDestCode[senderCode]){
    delete uniqueDestCode[senderCode];
  }

  console.log("uniqueDestCode",uniqueDestCode);
  console.log("uniqueSenderCode",uniqueSenderCode);

  const lastMessagePerUser = Object.values(uniqueDestCode).concat(Object.values(uniqueSenderCode)) || ["null"];
  //const lastMessagePerUser = Object.values(uniqueDestCode) || ["null"];

  console.log("lastMessagePerUser", lastMessagePerUser);

  lastMessageCodePerUser = lastMessagePerUser.map((msg)=>{return msg.msg_code });

    await models.Destination.findAndCountAll({
			where: {
				msgCode: {
					[Op.or]: lastMessageCodePerUser,
				},
			},
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
					as: 'msgCodeMessage',
					model: Messages,
					attributes: [
						'msg_code',
						'usr_code',
						'msg_contenu',
						'msg_created_date',
						'msg_modif_date',
					],
				},
				{
					as: 'msgFileJoints',
					model: MsgFileJoint,
					where: {
						// Ajout de la condition de jointure
						msg_code: Sequelize.col('msgCodeMessage.msg_code'),
					},
					required: false,
					attributes: [
						'msg_file_code',
						'usr_code',
						'msg_file_path',
						'msg_file_type',
						'msg_file_client_file_name',
						'msg_file_is_deleted',
						'msg_file_created_date',
						'msg_file_size',
					],
					attributes: [
						'msg_file_code',
						'usr_code',
						'msg_file_path',
						'msg_file_type',
						'msg_file_client_file_name',
						'msg_file_is_deleted',
						'msg_file_created_date',
						'msg_file_size',
					],
				},
			],
			limit: limit,
			offset: offset,
			order: ['dest_created_date'],
			attributes: [
				'msg_code',
				'msg_code',
				['usr_code', 'dest_code'],
				['dest_sender_code', 'sender_code'],
				'dest_is_readed',
				'dest_is_deleted',
				'dest_created_date',
				'dest_modif_date',
			],
		})
			.then(({ count, rows }) => {
				const nbPage = Math.ceil(parseInt(count) / limit);
				data.message = `Il y a ${count} message l'id utilisateur source = ${senderCode}.  Page ${page}/${nbPage}`;
				data.rows = rows;
				data.page = page;
				data.nbPage = nbPage;
				console.log('count', count);
			})
			.catch(error => {
				data.error = error;
			});
  }

  try{
    data.unReadMessage = Object.values(
      data.rows
        .filter((row) => row.destIsReaded === false)
        .reduce((accumulator, value) => {
          const usrName = value.dataValues.usrCodeUser.dataValues.usr_name;
          const usrFirstname =
            value.dataValues.usrCodeUser.dataValues.usr_firstname;
          const usrCode = value.dataValues.dest_code;
          const usrImg = value.dataValues.usrCodeUser.dataValues.usr_img;

          var a = [];
          if (accumulator[usrCode] === undefined) {
            a[usrCode] = 1;
          } else {
            a[usrCode] = accumulator[usrCode].messageNoLu + 1;
          }
          accumulator[usrCode] = {
            messageNoLu: a[usrCode],
            usrCode: usrCode,
            usrName: usrName,
            usrFirstname: usrFirstname,
            usrImg: usrImg
          };
          return accumulator;
        }, {})
    );

    data.userListe = Object.values(
      data.rows.reduce((accumulator, value) => {
        const usrName = value.dataValues.usrCodeUser.dataValues.usr_name;
        const usrFirstname =
          value.dataValues.usrCodeUser.dataValues.usr_firstname;
        const usrCode = value.dataValues.dest_code;
        const usrImg = value.dataValues.usrCodeUser.dataValues.usr_img;
        var a = [];
        if (accumulator[usrCode] === undefined) {
          a[usrCode] = 1;
        } else {
          a[usrCode] = accumulator[usrCode].messageNoLu + 1;
        }
        accumulator[usrCode] = {
          usrCode: usrCode,
          usrName: usrName,
          usrFirstname: usrFirstname,
          usrImg: usrImg
        };
        return accumulator;
      }, {})
    );
  }catch(error){
    const message = `Serveur error`;
    console.log(error)
    return res.status(500).json({ message: message, error: error });
  }
  if (data.message) {
    return res.json({
      messageNonLu: data.messageNonLu,
      page : data.page ,
      nbPage : data.nbPage,
      message: data.message,
      userListe: data.userListe,
      unReadMessage: data.unReadMessage,
      data: data.rows,
    });
  }
  const message = `Parametre manquante`;
  return res.status(500).json({ message: message, error: data.error });
}

export const deleteMessage = async (req, res) => {
  console.log('okksk');
  const id = req.params.id;
  const usrCode = req.params.usrCode;
  models.Messages.findByPk(id).then(async (message) => {
    if (message === null) {
      const message = `Le message demandé n'existe pas.`;
      return res.status(404).json({ message });
    }

    if(message.usrCode !== usrCode){
      const message = `Le message demandé n'existe pas.`;
      return res.status(400).json({ message }); 
    }
    models.Destination.update( {destIsDeleted: true} ,{ where: { msgCode: id } }).catch((err)=>{
      // Nothing to do;
    })
    models.Messages.update( {msgIsDeleted: true} ,{ where: { msgCode: id } })
      .then(async (_) => {
        const message = `Le message est supprimé.`;
        res.json({ message });
      })
      .catch((err) => {
        try {
          const message = `Le message n'a pas pu être supprimé.`;
          res.status(500).json({ message, data: err.parent.detail });
        } catch (higth_err) {
          const message = `Serveur error.`;
          res.status(500).json({ message, data: higth_err });
        }
      });
  });
};


export const AddFileTmpMsg = async (req, res) => {
  if (!req.body.usrCode) {
    return res.json({ message: "Aucun utilisateur associé" });
  }

  const tmpPath = req.file.path;
  const fileExtension = req.file.originalname.split('.')[1];
  const newFileName = `${moment().format("YYYY-MM-DD_HH-mm-ss")}.${fileExtension}`;
  const newPath = path.join(tmpFolder, req.body.usrCode, newFileName);
  const folderName = path.join(tmpFolder, req.body.usrCode);

  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }

    fs.renameSync(tmpPath, newPath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur lors du déplacement du fichier' });
      }
    });
    
    return res.json({ message: 'Fichier téléchargé avec succès' });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la création du dossier' });
  }
};

export const getAllFilesTmpMsg = async (req, res) => {
  if (!req.query.usrCode) {
    return res.json({ message: "Aucun utilisateur associé" });
  }

  const folderName = path.join(tmpFolder, req.query.usrCode);

  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }
    const filesInFolder = fs.readdirSync(folderName);
    return res.json({ message: 'Fichier sur le serveur', filesInFolder });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la création du dossier' });
  }
};

export const deleteFilesTmpMsg = async (req, res) => {
  if (!req.query.usrCode) {
    return res.json({ message: "Aucun utilisateur associé" });
  }

  if (!req.query.fileToDelete && !req.query.deleteAll) {
    return res.json({ message: "Nom du fichier à supprimer ou deleteAll requis" });
  }

  const folderName = path.join(tmpFolder, req.query.usrCode);
  const fileToDelete = req.query.fileToDelete;
  const fileToDeletePath = path.join(folderName, fileToDelete);
  const deleteAll = req.query.deleteAll || false;
  let noError = true;

  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }

    if (fileToDelete) {
      await fs.promises.unlink(fileToDeletePath);
      console.log("File deleted:", fileToDelete);
    } else if (deleteAll) {
      const files = await fs.promises.readdir(folderName);
      await Promise.all(files.map(async (fileName) => {
        await fs.promises.unlink(path.join(folderName, fileName));
        console.log("File deleted:", fileName);
      }));
    }
  } catch (err) {
    console.error(err);
    noError = false;
  }

  if (noError) {
    if (deleteAll) {
      return res.json({ message: `Tout a été supprimé avec succès sur le serveur` });
    }
    return res.json({ message: `${fileToDelete} a été supprimé` });
  } else {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};