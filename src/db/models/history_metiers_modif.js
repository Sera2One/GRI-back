import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HistoryMetiersModif extends Model {
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
    mtrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'metiers',
        key: 'mtr_code'
      },
      field: 'mtr_code'
    },
    historyMtrModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'history_mtr_modif_date'
    },
    historyMtrModifDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'history_mtr_modif_description'
    }
  }, {
    sequelize,
    tableName: 'history_metiers_modif',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "history_metiers_modif2_fk",
        fields: [
          { name: "mtr_code" },
        ]
      },
      {
        name: "history_metiers_modif_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "history_metiers_modif_pk",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "mtr_code" },
        ]
      },
      {
        name: "pk_history_metiers_modif",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "mtr_code" },
        ]
      },
    ]
  });
  }
}
