import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Modules extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    mdlCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'mdl_code'
    },
    mdlName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'mdl_name'
    },
    mdlDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'mdl_description'
    }
  }, {
    sequelize,
    tableName: 'modules',
    schema: 'pe',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "modules_pk",
        unique: true,
        fields: [
          { name: "mdl_code" },
        ]
      },
      {
        name: "pk_modules",
        unique: true,
        fields: [
          { name: "mdl_code" },
        ]
      },
    ]
  });
  }
}
