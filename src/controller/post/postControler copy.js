import { sequelize } from "../../db/config/database.js";
import { Op, where } from "sequelize";
import "../../services/env.js";
import moment from "moment";
import initModels from "../../db/models/init-models.js";
import Users from "../../db/models/users.js";
import FileJoint from "../../db/models/file_joint.js";
import fs  from "node:fs";
import path from 'path';
import { saveFileCreate } from "./saveFileCreate.js";
import { saveFileEdit } from "./saveFileEdit.js";
import { BackupDeleteFiles } from "./BackupDeleteFiles.js";

const models = initModels(sequelize);
const publicFolder = process.env.APP_PUBLIC_FOLDER;
const tmpFolder = publicFolder + "/tmp";


/************************************************************************
 **************** Create Post ******************************
 ************************************************************************/
export const postPost = async (req, res) => {
  console.log("body", req.body)
  const postTitle = req.body.postTitle;
  const postDescription = req.body.postDescription;
  const limit = parseInt(req.query.limit) || 5;
  const postPrefix ="post";
  const PrefixSeparator ="-";

  if (!postTitle) {
    return res.status(500).json({ error: `Aucun titre` });
  }
  if (!postDescription) {
    return res.status(500).json({ error: `Aucun description` });
}

  try {
    const post_is_exist = await models.Post.findOne({
      where: {postTitle}
    });
    if (post_is_exist) {
        return res.status(400).json({ error: `Le titre de Votre post existe déjà` });
    }
    
    //générer Votreid  de Votre post
  const getpost = await models.Post.findAll({
    order: [["postCreatedDate", "DESC"]],
    raw: true,
    limit: limit,
  });
  console.log("log", getpost);
  const last_id = !getpost.length
    ? 0
    : getpost
        .map(function (id) {
          console.log("id.postCode", typeof( id.postCode));
          return parseInt(id.postCode.match(/\d+/g));
        })
        .reduce((previousId, currentId) =>
          previousId > currentId ? previousId : currentId
        );

    req.body.postCode = postPrefix + PrefixSeparator + (last_id + 1);
    // Set date
    req.body.postCreatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body.postIsValided = false;
    req.body.postIsDeleted = false;
    // Create a new post
    console.log("logA", req.body);
    const newpost = await models.Post.create(req.body);
    await saveFileCreate(req.body.usrCode ,req.body.postCode);
    const message = `Création post éffectue avec succès.`;
    res.json({ message, post: newpost });
  } catch (error) {
    console.error(error);
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
    const table = req.query.table;
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
          as: "fileJoints",
          model: FileJoint,
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
          as: "usrCodeUser",
          model: Users,
          attributes: ["usr_code", "usr_name", "usr_firstname", "usr_mail", "usr_img"],
        },
        {
          as: "fileJoints",
          model: FileJoint,
        },

      ],
      order: ["post_title"],
    })
      .then(async (post) => {
        const message = "La liste des Post a bien été récupéré.";
        
         const postresulte =  await Promise.all( post.map(async element => {
            const findComment = await models.Comment.findAll({
              where: {
                postCode : element.postCode
              }}
            )
              element.setDataValue('Comment', findComment.length) ;
              return element; 
           
          }));


        res.json({ message, data: postresulte });
      })
      .catch((error) => {
        const message = `HTTP 500 Internal Server Error.`;
        res.status(500).json({ message, data: error });
      });
  }
};

/************************************************************************
 **************** get button by id **********************************
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

export const getAllFilesTmpPost = async (req, res) => {

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

export const deleteFilesTmpPostAA = async (req, res) => {

  if (!req.query.usrCode) {
    return res.json({ message: "Aucun utilisateur associé" });
  }

  if (!req.query.fileToDelete || !req.query.deleteAll) {
    return res.json({ message: "Nom du fichier à supprimer requise" });
  } 

  const folderName = path.join(tmpFolder, req.query.usrCode);
  const fileToDelete = req.query.fileToDelete;
  const fileToDeletePath = folderName +"/"+ fileToDelete;
  const deleteAll = req.query.deleteAll || false;
  let noError = false;

try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }
    
    fs.readdirSync(folderName).map(fileName => {
      if(fileName === fileToDelete ){
        fs.rm(fileToDeletePath, { recursive: true, force: true }, (error) => {
          // This function run on success
          //nothing here if fails, onSuccess error : null , onError error:none
          console.log("deleted")
          noError = true;
        });
      }

      if(deleteAll){
        fs.rm(folderName +"/"+ fileName, {force: true },(error) => {
          noError = true;
        });
      }

    });
    console.log("niee", noError);
    if(noError){
      if(deleteAll){
        return res.json({ message: `Tout a été supprimée avec success sur le serveur`});
      }

      return res.json({ message: fileToDelete + "a été supprimé"});
      
    }else{
      return res.status(500).json({ message: 'Erreur lors de la suppression du ' + fileToDelete });
    }
    
  } catch (err) {
    console.error(err);
    //return res.status(500).json({ message: 'Erreur lors de la suppression du ' + fileToDelete });
  }
};

export const deleteFilesTmpPost = async (req, res) => {
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

export const PostEditRequest = async (req, res) => {
  if (!req.params.usr_code) {
    return res.json({ message: "Aucun utilisateur associé" });
  }

  if (!req.params.post_code) {
    return res.json({ message: "Nom du fichier à supprimer ou deleteAll requis" });
  }

  const usrCode = req.params.usr_code
  const postCode = req.params.post_code
  const tmpFolderUser = path.join(tmpFolder, usrCode);


  models.Post.findByPk(postCode)
    .then(async (post) => {
      if (post === null) {
        const message = `Votre post demandé n'existe pas.`;
        return res.status(404).json({ message });
      }

    
      const filesToMouve = await models.FileJoint.findAll({
        attributes: ['file_joint_path'],
        where: { postCode: postCode },
        raw:true
      })

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

      for (const file of filesToMouve) {
        if (file.file_joint_path) { // Vérifier si file.file_joint_path n'est pas undefined
          const srcPath = path.join (publicFolder, file.file_joint_path);
          const destPath = path.join(tmpFolderUser, path.basename(file.file_joint_path));

          try {
            await fs.promises.copyFile(srcPath, destPath);
          } catch (err) {
            console.error(`Erreur lors de la copie du fichier ${srcPath} : ${err}`);
          }
        }
      }

      const message = `Seccess.`;
      res.set('Cache-Control', 'no-store');
      return res.json({ message }); 
    
    
    }).catch((err) => {
      console.error('Erreur lors de la requête :', err);
      res.status(500).json({ message: 'Une erreur est survenue lors du traitement de la requête.' });
    });
};




