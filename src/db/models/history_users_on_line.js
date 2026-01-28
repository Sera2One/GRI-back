import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HistoryUsersOnLine extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    usrOnLineCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
      field: 'usr_on_line_code'
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
    sessionCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'session_code'
    },
    usrOnLineLoginDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'usr_on_line_login_date'
    },
    usrOnLineLogoutDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'usr_on_line_logout_date'
    },
    usrOnLineIsTrue: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'usr_on_line_is_true'
    }
  }, {
    sequelize,
    tableName: 'history_users_on_line',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "add_history_user_online_fk",
        fields: [
          { name: "session_code" },
        ]
      },
      {
        name: "add_user_online_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "history_users_on_line_pk",
        unique: true,
        fields: [
          { name: "usr_on_line_code" },
        ]
      },
      {
        name: "pk_history_users_on_line",
        unique: true,
        fields: [
          { name: "usr_on_line_code" },
        ]
      },
    ]
  });
  }
}
