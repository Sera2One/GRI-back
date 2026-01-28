import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Messages extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    msgCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'msg_code'
    },
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'usr_code'
    },
    msgContenu: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'msg_contenu'
    },
    msgHasPieceJoint: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_has_piece_joint'
    },
    msgModif: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'msg_modif'
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
    msgParentCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'messages',
        key: 'msg_code'
      },
      field: 'msg_parent_code'
    },
    msgForwardedFrom: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'msg_forwarded_from'
    },
    msgForwardedFromUser: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'msg_forwarded_from_user'
    }
  }, {
    sequelize,
    tableName: 'messages',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "messages_parent_code_idx",
        fields: [
          { name: "msg_parent_code" },
        ]
      },
      {
        name: "messages_pk",
        unique: true,
        fields: [
          { name: "msg_code" },
        ]
      },
      {
        name: "pk_messages",
        unique: true,
        fields: [
          { name: "msg_code" },
        ]
      },
      {
        name: "sender_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
    ]
  });
  }
}
