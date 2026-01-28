import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class DestMsgRoomGrp extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    msgRoomGrpCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'msg_room_groupe',
        key: 'msg_room_grp_code'
      },
      field: 'msg_room_grp_code'
    },
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
    destMsgRoomGrpSenderCode: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      field: 'dest_msg_room_grp_sender_code'
    },
    destMsgRoomGrpIsReaded: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'dest_msg_room_grp_is_readed'
    },
    destMsgRoomGrpIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'dest_msg_room_grp_is_deleted'
    },
    destMsgRoomGrpCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'dest_msg_room_grp_created_date'
    },
    destMsgRoomGrpModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'dest_msg_room_grp_modif_date'
    }
  }, {
    sequelize,
    tableName: 'dest_msg_room_grp',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "dest_msg_room_grp2_fk",
        fields: [
          { name: "msg_code" },
        ]
      },
      {
        name: "dest_msg_room_grp3_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "dest_msg_room_grp_fk",
        fields: [
          { name: "msg_room_grp_code" },
        ]
      },
      {
        name: "dest_msg_room_grp_pk",
        unique: true,
        fields: [
          { name: "msg_room_grp_code" },
          { name: "msg_code" },
          { name: "usr_code" },
        ]
      },
      {
        name: "pk_dest_msg_room_grp",
        unique: true,
        fields: [
          { name: "msg_room_grp_code" },
          { name: "msg_code" },
          { name: "usr_code" },
        ]
      },
    ]
  });
  }
}
