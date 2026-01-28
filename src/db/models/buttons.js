import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Buttons extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    btnCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'btn_code'
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
    btnName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'btn_name'
    },
    btnDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'btn_description'
    },
    btnModif: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'btn_modif'
    }
  }, {
    sequelize,
    tableName: 'buttons',
    schema: 'pe',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "buttons_pk",
        unique: true,
        fields: [
          { name: "btn_code" },
        ]
      },
      {
        name: "module_contient_btn_fk",
        fields: [
          { name: "mdl_code" },
        ]
      },
      {
        name: "pk_buttons",
        unique: true,
        fields: [
          { name: "btn_code" },
        ]
      },
    ]
  });
  }
}
