import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class MessageViews extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    msgCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'msg_code'
    },
    destUsrCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'dest_usr_code'
    },
    destSenderCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'dest_sender_code'
    },
    destIsReaded: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'dest_is_readed'
    },
    destIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'dest_is_deleted'
    },
    destCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'dest_created_date'
    },
    destModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'dest_modif_date'
    },
    msgUsrCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'msg_usr_code'
    },
    msgContenu: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'msg_contenu'
    },
    msgCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'msg_created_date'
    },
    msgModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'msg_modif_date'
    },
    senderUsrCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'sender_usr_code'
    },
    senderUsrName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'sender_usr_name'
    },
    senderUsrFirstname: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'sender_usr_firstname'
    },
    senderUsrMail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'sender_usr_mail'
    },
    senderUsrImg: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'sender_usr_img'
    },
    receiverUsrCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'receiver_usr_code'
    },
    receiverUsrName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'receiver_usr_name'
    },
    receiverUsrFirstname: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'receiver_usr_firstname'
    },
    receiverUsrMail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'receiver_usr_mail'
    },
    receiverUsrImg: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'receiver_usr_img'
    },
    msgFileCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'msg_file_code'
    },
    msgFilePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'msg_file_path'
    },
    msgFileSize: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'msg_file_size'
    },
    msgFileType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'msg_file_type'
    },
    msgFileExtension: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'msg_file_extension'
    },
    msgFileClientFileName: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'msg_file_client_file_name'
    },
    msgFileIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_file_is_deleted'
    },
    msgFileCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'msg_file_created_date'
    }
  }, {
    sequelize,
    tableName: 'message_views',
    schema: 'pe',
    timestamps: false
  });
  }
}
