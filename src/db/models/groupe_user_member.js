import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class GroupeUserMember extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    gumCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'gum_code'
    },
    gunCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'groupe_user_name',
        key: 'gun_code'
      },
      field: 'gun_code'
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
    gumRole: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "member",
      field: 'gum_role'
    },
    gumIsAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'gum_is_admin'
    },
    gumUserAcceptJoin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'gum_user_accept_join'
    },
    gumUserRefuseJoin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'gum_user_refuse_join'
    },
    gumRefuseAcceptDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'gum_refuse_accept_date'
    },
    gumUserAddedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'gum_user_added_date'
    },
    gumUserIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'gum_user_is_deleted'
    },
    gumUserIsDeletedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'gum_user_is_deleted_by'
    },
    gumUserIsAddBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'gum_user_is_add_by'
    }
  }, {
    sequelize,
    tableName: 'groupe_user_member',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "idx_gum_groupe",
        fields: [
          { name: "gun_code" },
        ]
      },
      {
        name: "idx_gum_role",
        fields: [
          { name: "gum_role" },
        ]
      },
      {
        name: "idx_gum_user",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "pk_groupe_user_member",
        unique: true,
        fields: [
          { name: "gum_code" },
        ]
      },
    ]
  });
  }
}
