import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Session extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    sessionCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'session_code'
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
    sessionCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'session_created_date'
    },
    sessionLastActive: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'session_last_active'
    },
    sessionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'session_expires_at'
    },
    sessionRefreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'session_refresh_token'
    },
    sessionIsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'session_is_active'
    },
    sessionUserIsOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'session_user_is_online'
    },
    sessionIsTrusted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'session_is_trusted'
    },
    sessionBrowserInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'session_browser_info'
    },
    sessionIp: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'session_ip'
    },
    sessionDeviceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'session_device_id'
    }
  }, {
    sequelize,
    tableName: 'session',
    schema: 'pe',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "idx_session_active",
        fields: [
          { name: "session_is_active" },
        ]
      },
      {
        name: "idx_session_browser_name",
        fields: [
        ]
      },
      {
        name: "idx_session_created_date",
        fields: [
          { name: "session_created_date" },
        ]
      },
      {
        name: "idx_session_device",
        fields: [
          { name: "session_device_id" },
        ]
      },
      {
        name: "idx_session_expires",
        fields: [
          { name: "session_expires_at" },
        ]
      },
      {
        name: "idx_session_os_name",
        fields: [
        ]
      },
      {
        name: "idx_session_user",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "idx_session_usr_last_active",
        fields: [
          { name: "usr_code" },
          { name: "session_last_active", order: "DESC" },
        ]
      },
      {
        name: "pk_session",
        unique: true,
        fields: [
          { name: "session_code" },
        ]
      },
      {
        name: "session_pkey",
        unique: true,
        fields: [
          { name: "session_code" },
        ]
      },
      {
        name: "user_session_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
    ]
  });
  }
}
