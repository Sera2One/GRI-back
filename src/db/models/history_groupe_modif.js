import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HistoryGroupeModif extends Model {
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
    historyGrpModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'history_grp_modif_date'
    },
    historyGrpModiDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'history_grp_modi_description'
    }
  }, {
    sequelize,
    tableName: 'history_groupe_modif',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "history_groupe_modif2_fk",
        fields: [
          { name: "grp_code" },
        ]
      },
      {
        name: "history_groupe_modif_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "history_groupe_modif_pk",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "grp_code" },
        ]
      },
      {
        name: "pk_history_groupe_modif",
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
