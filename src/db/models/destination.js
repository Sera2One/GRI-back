import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Destination extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    msgCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'messages',
        key: 'msg_code'
      },
      field: 'msg_code'
    },
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'usr_code'
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
    }
  }, {
    sequelize,
    tableName: 'destination',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "destination2_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "destination_fk",
        fields: [
          { name: "msg_code" },
        ]
      },
      {
        name: "destination_pk",
        unique: true,
        fields: [
          { name: "msg_code" },
          { name: "usr_code" },
        ]
      },
      {
        name: "pk_destination",
        unique: true,
        fields: [
          { name: "msg_code" },
          { name: "usr_code" },
        ]
      },
    ]
  });
  }
}
