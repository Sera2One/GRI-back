import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CallRoomAutorizedUser extends Model {
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
    msgRoomGrpUserAddDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'msg_room_grp_user_add_date'
    },
    msgRoomGrpUserIsRemouved: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_room_grp_user_is_remouved'
    },
    msgRoomGrpUserIsAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'msg_room_grp_user_is_admin'
    },
    msgRoomGrpUserIsAddBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'msg_room_grp_user_is_add_by'
    },
    msgRoomGrpUserIsRemoveBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'msg_room_grp_user_is_remove_by'
    },
    msgRoomGrpUserAdminAddBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'msg_room_grp_user_admin_add_by'
    }
  }, {
    sequelize,
    tableName: 'call_room_autorized_user',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "call_room_autorized_user2_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "call_room_autorized_user_fk",
        fields: [
          { name: "msg_room_grp_code" },
        ]
      },
      {
        name: "call_room_autorized_user_pk",
        unique: true,
        fields: [
          { name: "msg_room_grp_code" },
          { name: "usr_code" },
        ]
      },
      {
        name: "pk_call_room_autorized_user",
        unique: true,
        fields: [
          { name: "msg_room_grp_code" },
          { name: "usr_code" },
        ]
      },
    ]
  });
  }
}
