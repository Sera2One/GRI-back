import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HistoryUserModified extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
    usrCreatorCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'usr_creator_list',
        key: 'usr_creator_code'
      },
      field: 'usr_creator_code'
    },
    historyUsrModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'history_usr_modif_date'
    },
    historyUsrModifDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'history_usr_modif_description'
    }
  }, {
    sequelize,
    tableName: 'history_user_modified',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "history_user_modified2_fk",
        fields: [
          { name: "usr_creator_code" },
        ]
      },
      {
        name: "history_user_modified_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "history_user_modified_pk",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "usr_creator_code" },
        ]
      },
      {
        name: "pk_history_user_modified",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "usr_creator_code" },
        ]
      },
    ]
  });
  }
}
