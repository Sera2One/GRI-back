import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Components extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    cmpnCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'cmpn_code'
    },
    mdlCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'modules',
        key: 'mdl_code'
      },
      field: 'mdl_code'
    },
    cmpnName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'cmpn_name'
    },
    cmpnDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cmpn_description'
    }
  }, {
    sequelize,
    tableName: 'components',
    schema: 'pe',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "components_pk",
        unique: true,
        fields: [
          { name: "cmpn_code" },
        ]
      },
      {
        name: "module_contient_cmpn_fk",
        fields: [
          { name: "mdl_code" },
        ]
      },
      {
        name: "pk_components",
        unique: true,
        fields: [
          { name: "cmpn_code" },
        ]
      },
    ]
  });
  }
}
