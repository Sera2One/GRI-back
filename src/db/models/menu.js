import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Menu extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    menuCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'menu_code'
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
    menuName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'menu_name'
    },
    menuDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'menu_description'
    }
  }, {
    sequelize,
    tableName: 'menu',
    schema: 'pe',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "menu_pk",
        unique: true,
        fields: [
          { name: "menu_code" },
        ]
      },
      {
        name: "module_contient_menu_fk",
        fields: [
          { name: "mdl_code" },
        ]
      },
      {
        name: "pk_menu",
        unique: true,
        fields: [
          { name: "menu_code" },
        ]
      },
    ]
  });
  }
}
