import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class GroupeUserMessage extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    gumesCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'gumes_code'
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
    gumesContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'gumes_content'
    },
    gumesIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'gumes_is_deleted'
    },
    gumesCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'gumes_created_date'
    },
    gumesUpdatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'gumes_updated_date'
    },
    gumesParentCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'groupe_user_message',
        key: 'gumes_code'
      },
      field: 'gumes_parent_code'
    },
    gumesForwardedFrom: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'gumes_forwarded_from'
    },
    gumesForwardedFromUser: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'gumes_forwarded_from_user'
    }
  }, {
    sequelize,
    tableName: 'groupe_user_message',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "groupe_messages_parent_code_idx",
        fields: [
          { name: "gumes_parent_code" },
        ]
      },
      {
        name: "idm_gum_groupe",
        fields: [
          { name: "gun_code" },
        ]
      },
      {
        name: "idm_gum_user",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "idx_gumes_forwarded_from",
        fields: [
          { name: "gumes_forwarded_from" },
        ]
      },
      {
        name: "idx_gumes_forwarded_from_user",
        fields: [
          { name: "gumes_forwarded_from_user" },
        ]
      },
      {
        name: "pk_groupe_user_message",
        unique: true,
        fields: [
          { name: "gumes_code" },
        ]
      },
    ]
  });
  }
}
