import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Pages extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    pageCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'page_code'
    },
    mdlCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'modules',
        key: 'mdl_code'
      },
      field: 'mdl_code'
    },
    pageName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'page_name'
    },
    pageDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'page_description'
    }
  }, {
    sequelize,
    tableName: 'pages',
    schema: 'pe',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "module_contient_page_fk",
        fields: [
          { name: "mdl_code" },
        ]
      },
      {
        name: "pages_pk",
        unique: true,
        fields: [
          { name: "page_code" },
        ]
      },
      {
        name: "pk_pages",
        unique: true,
        fields: [
          { name: "page_code" },
        ]
      },
    ]
  });
  }
}
