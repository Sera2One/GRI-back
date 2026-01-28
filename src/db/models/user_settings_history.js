import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UserSettingsHistory extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    usrSHCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'usr_s_h_code'
    },
    usrSCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'user_settings',
        key: 'usr_s_code'
      },
      field: 'usr_s_code'
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
    usrSHScope: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'usr_s_h_scope'
    },
    usrSHDeviceCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'usr_s_h_device_code'
    },
    usrSHOldValue: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'usr_s_h_old_value'
    },
    usrSHNewValue: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'usr_s_h_new_value'
    },
    usrSHChangedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'usr_s_h_changed_by'
    },
    usrSHChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'usr_s_h_changed_at'
    }
  }, {
    sequelize,
    tableName: 'user_settings_history',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "user_settings_history_pkey",
        unique: true,
        fields: [
          { name: "usr_s_h_code" },
        ]
      },
    ]
  });
  }
}
