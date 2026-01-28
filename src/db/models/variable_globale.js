import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class VariableGlobale extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    varGCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'var_g_code'
    },
    varGName: {
      type: DataTypes.STRING(250),
      allowNull: false,
      field: 'var_g_name'
    },
    varGType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'var_g_type'
    },
    varGDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'var_g_description'
    },
    varGValue: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'var_g_value'
    },
    varGCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'var_g_created_date'
    }
  }, {
    sequelize,
    tableName: 'variable_globale',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "pk_variable_globale",
        unique: true,
        fields: [
          { name: "var_g_code" },
        ]
      },
      {
        name: "variable_globale_pk",
        unique: true,
        fields: [
          { name: "var_g_code" },
        ]
      },
    ]
  });
  }
}
