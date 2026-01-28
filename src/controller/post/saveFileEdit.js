import { sequelize } from "../../db/config/database.js";
import moment from "moment";
import initModels from "../../db/models/init-models.js";
import fs  from "node:fs";
import path from 'path';
import "../../services/env.js";

const models = initModels(sequelize);

/*!todo
* Ce fichier permet de deplacer les fichiers de /tmp vers /post/user/<img,doc,video >/filename
* Elle ne deplace pas si elle existe
* Enregistre dans la base de donné si elle existe dans /post/user/<img,doc,video >
* Edition Post seulement
*/


export const saveFileEdit = async (usrCode,postCode) => {
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
      const destPath = path.join(destFolder ,file);
      console.log("destFolder",destFolder);
      console.log("file",file)




      if (fs.existsSync(destPath)){
        // Supprimé le fichier dans /tmp/user/<img,doc,video >/filename si elle existe dans /Post/...
        fs.unlinkSync(srcPath);
      }else{
        //Deplace si elle n'existe pas dans le /Post/
        const newDestPath = path.join(destFolder , postCode +"-"+ file);
        filePostPath.push(newDestPath.replace(publicFolder,''));
        fs.renameSync(srcPath, newDestPath);

      }
    
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

        console.log("filePostPath", filePostPath)
};
