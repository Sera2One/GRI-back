import moment from "moment";
import { sequelize } from "../../db/config/database.js";
import initModels from "../../db/models/init-models.js";
import fs  from "node:fs";
import path from 'path';
import { Op } from "sequelize";
import "../../services/env.js";

/*!todo
* Ce compare post/user/<img,doc,video >/filename et /tmp/usr
* Deplacér les fichier dans post/user/<img,doc,video >/filename seulement si elle n'existe pas dans /tmp/user vers le dossier de sauvegarde
* puis les fichiers supprimé auront une valeur date dans fileJointDeletedDate et fileJoinIsDeleted true dans la db.
* Elle ne suppreme pas les dossier de tmp
*/
const models = initModels(sequelize);
const publicFolder = process.env.APP_PUBLIC_FOLDER;
const tmpFolder = publicFolder + "/tmp";
const BackupsFolder = "/Post/backup_deleted_files_post/";


export const BackupDeleteFiles = async ({usrCode, postCode ,specifiedFilesToDelete} ) => {
    
  // Déplacer les fichiers de tmp/usrCode vers Post/usrCode
  const tmpFolderUser = path.join(tmpFolder, usrCode);
  const UserBackupFolder = path.join( publicFolder+BackupsFolder,usrCode);
  try {
    const AllfilesPostInDB = await models.FileJoint.findAll({
      where: { postCode: postCode },
      raw:true
    });

    if (!fs.existsSync(UserBackupFolder)) {
      fs.mkdirSync(UserBackupFolder, { recursive: true });
    }

    const imageFolder = path.join(UserBackupFolder, "img");
    const docFolder = path.join(UserBackupFolder, "doc");
    const videoFolder = path.join(UserBackupFolder, "video");

    try {
      if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
      if (!fs.existsSync(docFolder)) fs.mkdirSync(docFolder);
      if (!fs.existsSync(videoFolder)) fs.mkdirSync(videoFolder);
    } catch (err) {
      console.error(err);
    }

    if(specifiedFilesToDelete){
      for (const file of specifiedFilesToDelete) {
        if (file.fileJointPath) { // Vérifier si file.fileJointPath n'est pas undefined
          const srcPath = path.join (publicFolder, file.fileJointPath);
          const destPath = path.join(publicFolder,file.fileJointPath.replace("/Post/", BackupsFolder) )
          try {
            fs.renameSync(srcPath, destPath);
            const saveDB = await models.FileJoint.update(
              {
                fileJointDeletedDate : moment().format("YYYY-MM-DD HH:mm:ss"),
                fileJointIsDeleted   : true
             },
              {where: { 
                [Op.and]: {
                  postCode: postCode,
                  fileJointPath: file.fileJointPath,
                }
              }}
            );
          } catch (err) {
            console.error(`Erreur lors de la suppression du fichier ${srcPath} : ${err}`);
          }

        }
      }

    }else{
      for (const fileInPostDB of AllfilesPostInDB) {

        if (fileInPostDB.fileJointPath && !fileInPostDB.fileJointDeletedDate) { // Vérifier si file.fileJointPath n'est pas undefined ou a été supprimé
          const srcPath = path.join (publicFolder, fileInPostDB.fileJointPath);
          const destPath = path.join(publicFolder,fileInPostDB.fileJointPath.replace("/Post/",BackupsFolder))
          const tmpPath = path.join(tmpFolderUser, path.basename(fileInPostDB.fileJointPath));
          if (!fs.existsSync(tmpPath)){          
            try {
              fs.renameSync(srcPath, destPath);
              const saveDB = await models.FileJoint.update(
                {
                  fileJointDeletedDate : moment().format("YYYY-MM-DD HH:mm:ss"),
                  fileJointIsDeleted   : true
                },
                {where: { 
                  [Op.and]: {
                    postCode: postCode,
                    fileJointPath: fileInPostDB.fileJointPath,
                  }
                }}
              );
            } catch (err) {
              console.error(`Erreur lors de la suppression du fichier ${srcPath} : ${err}`);
            }
          }
        }
      }
    }

  } catch (err) {
    console.error(err);
  }
};
