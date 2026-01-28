import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Metiers extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    mtrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'mtr_code'
    },
    grpCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'groupes',
        key: 'grp_code'
      },
      field: 'grp_code'
    },
    mtrName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'mtr_name'
    },
    mtrDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'mtr_description'
    }
  }, {
    sequelize,
    tableName: 'metiers',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "association_groupe_metier_fk",
        fields: [
          { name: "grp_code" },
        ]
      },
      {
        name: "metiers_pk",
        unique: true,
        fields: [
          { name: "mtr_code" },
        ]
      },
      {
        name: "pk_metiers",
        unique: true,
        fields: [
          { name: "mtr_code" },
        ]
      },
    ]
  });
  }
}
