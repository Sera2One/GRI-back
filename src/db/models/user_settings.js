import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UserSettings extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    usrSCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'usr_s_code'
    },
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      unique: "user_settings_usr_code_usr_s_scope_usr_s_device_code_key",
      field: 'usr_code'
    },
    usrSScope: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "user_settings_usr_code_usr_s_scope_usr_s_device_code_key",
      field: 'usr_s_scope'
    },
    usrSDeviceCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "user_settings_usr_code_usr_s_scope_usr_s_device_code_key",
      field: 'usr_s_device_code'
    },
    usrSValue: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      field: 'usr_s_value'
    },
    usrSCreatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'usr_s_created_at'
    },
    usrSUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'usr_s_updated_at'
    }
  }, {
    sequelize,
    tableName: 'user_settings',
    schema: 'pe',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "idx_user_settings_app_global",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "usr_s_scope" },
        ]
      },
      {
        name: "idx_user_settings_device",
        fields: [
          { name: "usr_s_device_code" },
        ]
      },
      {
        name: "idx_user_settings_scope",
        fields: [
          { name: "usr_s_scope" },
        ]
      },
      {
        name: "idx_user_settings_updated",
        fields: [
          { name: "usr_s_updated_at" },
        ]
      },
      {
        name: "idx_user_settings_user",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "user_settings_pkey",
        unique: true,
        fields: [
          { name: "usr_s_code" },
        ]
      },
      {
        name: "user_settings_usr_code_usr_s_scope_usr_s_device_code_key",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "usr_s_scope" },
          { name: "usr_s_device_code" },
        ]
      },
    ]
  });
  }
}
