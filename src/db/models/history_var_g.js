import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HistoryVarG extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    varGCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'variable_globale',
        key: 'var_g_code'
      },
      field: 'var_g_code'
    },
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
    varGlobalDateHistory: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'var_global_date_history'
    },
    varGlobalModifDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'var_global_modif_description'
    }
  }, {
    sequelize,
    tableName: 'history_var_g',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "history_var_g2_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "history_var_g_fk",
        fields: [
          { name: "var_g_code" },
        ]
      },
      {
        name: "history_var_g_pk",
        unique: true,
        fields: [
          { name: "var_g_code" },
          { name: "usr_code" },
        ]
      },
      {
        name: "pk_history_var_g",
        unique: true,
        fields: [
          { name: "var_g_code" },
          { name: "usr_code" },
        ]
      },
    ]
  });
  }
}
