import { sequelize } from "../../db/config/database.js";
import moment from "moment";
import initModels from "../../db/models/init-models.js";
import fs  from "node:fs";
import path from 'path';
import "../../services/env.js";

const models = initModels(sequelize);


export const saveFileCreate = async (usrCode,postCode) => {
  const publicFolder = process.env.APP_PUBLIC_FOLDER;

  const saveFolder = path.join( publicFolder+ "/Post", usrCode);
  const tmpFolder = path.join( publicFolder+ "/tmp", usrCode);
  const filePostPath= [];
    
  // Déplacer les fichiers de tmp/usrCode vers Post/usrCode
  try {
    if (!fs.existsSync(saveFolder)) {
      fs.mkdirSync(saveFolder, { recursive: true });
    }

  } catch (err) {
    console.error(err);
  }

  // Filtrer les fichiers et les déplacer dans les dossiers appropriés
  const imageFolder = path.join(saveFolder, "img");
  const docFolder = path.join(saveFolder, "doc");
  const videoFolder = path.join(saveFolder, "video");

  try {
    if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
    if (!fs.existsSync(docFolder)) fs.mkdirSync(docFolder);
    if (!fs.existsSync(videoFolder)) fs.mkdirSync(videoFolder);

    const files = fs.readdirSync(tmpFolder);
    for (const file of files) {
      const fileExtension = path.extname(file).slice(1).toLowerCase();
      let destFolder;
      switch (fileExtension) {
        case "jpg":
        case "png":
        case "gif":
          destFolder = imageFolder;
          break;
        case "doc":
        case "docx":
        case "pdf":
          destFolder = docFolder;
          break;
        case "mp4":
        case "avi":
        case "mov":
          destFolder = videoFolder;
          break;
        default:
          continue;
      }


      const srcPath = path.join(tmpFolder, file);
      const destPath = path.join(destFolder , postCode + "-" + file);
      filePostPath.push(destPath.replace(publicFolder,''));
      fs.renameSync(srcPath, destPath);
    
    }
  } catch (err) {
    console.error(err);
    // Gérer l'erreur de filtrage et de déplacement des fichiers
  }

  // Récupérer le dernier fileJointCode dans la base de données
  const getFileInDatabase = await models.FileJoint.findAll({
    order: [["fileJointCreatedDate", "DESC"]],
    raw: true,
    limit: 5,
  });

  const last_code = !getFileInDatabase.length
    ? 0
    : getFileInDatabase
        .map(function (code) {
          return parseInt(code.fileJointCode.match(/\d+/g));
        })
        .reduce((previousCode, currentCode) =>
          previousCode > currentCode ? previousCode : currentCode
        );

  // Enregistrer les fichiers dans la base de données
  for (let i = 0; i < filePostPath.length; i++) {
    const file = filePostPath[i];
    const newCode = last_code + i + 1;
    const saveFileJoinSchema = {
      fileJointCode: `fileJoin-${newCode}`,
      postCode: postCode,
      fileJointPath: file,
      fileJointIsExtension: path.extname(file).slice(1),
      fileJointCreatedDate: moment().format("YYYY-MM-DD HH:mm:ss"),
      fileJointIsDeleted  : false,
      fileJointDeletedDate: null,
    };
    const saveFileJointPost = await models.FileJoint.create(saveFileJoinSchema);
  }
};
