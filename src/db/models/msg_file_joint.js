import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class MsgFileJoint extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    msgFileCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
      field: 'msg_file_code'
    },
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'usr_code'
    },
    msgCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'messages',
        key: 'msg_code'
      },
      field: 'msg_code'
    },
    msgFilePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'msg_file_path'
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
    },
    msgFileDeletedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'msg_file_deleted_date'
    },
    msgFileSize: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'msg_file_size'
    }
  }, {
    sequelize,
    tableName: 'msg_file_joint',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "add_file_joint_msg_fk",
        fields: [
          { name: "msg_code" },
        ]
      },
      {
        name: "msg_file_joint_is_deleted_by_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "msg_file_joint_pk",
        unique: true,
        fields: [
          { name: "msg_file_code" },
        ]
      },
      {
        name: "pk_msg_file_joint",
        unique: true,
        fields: [
          { name: "msg_file_code" },
        ]
      },
    ]
  });
  }
}
