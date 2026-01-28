import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class MsgRoomGroupe extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    msgRoomGrpCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
      field: 'msg_room_grp_code'
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
    msgRoomGrpName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'msg_room_grp_name'
    },
    msgRoomGrpIsUsedOnlyMsg: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_room_grp_is_used_only_msg'
    },
    msgRoomGrpIsUsedOnlyRoom: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_room_grp_is_used_only_room'
    },
    msgRoomGrpIsUsedOnlyGrp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_room_grp_is_used_only_grp'
    },
    msgRoomGrpIsPermanent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_room_grp_is_permanent'
    },
    msgRoomGrpIsPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_room_grp_is_public'
    },
    msgRoomGrpIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_room_grp_is_deleted'
    },
    msgRoomGrpCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'msg_room_grp_created_date'
    },
    msgRoomGrpDeletedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'msg_room_grp_deleted_date'
    }
  }, {
    sequelize,
    tableName: 'msg_room_groupe',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "call_room_creator_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "msg_room_groupe_pk",
        unique: true,
        fields: [
          { name: "msg_room_grp_code" },
        ]
      },
      {
        name: "pk_msg_room_groupe",
        unique: true,
        fields: [
          { name: "msg_room_grp_code" },
        ]
      },
    ]
  });
  }
}
