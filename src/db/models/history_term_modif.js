import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HistoryTermModif extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'usr_code'
    },
    termCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'terminaux',
        key: 'term_code'
      },
      field: 'term_code'
    },
    historyTermModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'history_term_modif_date'
    },
    historyTermModifDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'history_term_modif_description'
    }
  }, {
    sequelize,
    tableName: 'history_term_modif',
    schema: 'gri',
    timestamps: false,
    indexes: [
      {
        name: "history_term_modif2_fk",
        fields: [
          { name: "term_code" },
        ]
      },
      {
        name: "history_term_modif_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "history_term_modif_pk",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "term_code" },
        ]
      },
      {
        name: "pk_history_term_modif",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "term_code" },
        ]
      },
    ]
  });
  }
}
