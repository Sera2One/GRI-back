import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HistoryUsrCreateGroupe extends Model {
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
    grpCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'groupes',
        key: 'grp_code'
      },
      field: 'grp_code'
    },
    historyCreateGrpDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'history_create_grp_date'
    }
  }, {
    sequelize,
    tableName: 'history_usr_create_groupe',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "history_usr_create_groupe2_fk",
        fields: [
          { name: "grp_code" },
        ]
      },
      {
        name: "history_usr_create_groupe_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "history_usr_create_groupe_pk",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "grp_code" },
        ]
      },
      {
        name: "pk_history_usr_create_groupe",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "grp_code" },
        ]
      },
    ]
  });
  }
}
