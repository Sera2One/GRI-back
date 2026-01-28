import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class TerminalType extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    termTypeCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
      field: 'term_type_code'
    },
    termTypeUserCodeAdd: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'term_type_user_code_add'
    },
    termTypeDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'term_type_description'
    },
    termTypeImgDescription: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'term_type_img_description'
    },
    termTypeCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'term_type_created_date'
    },
    termTypeName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'term_type_name'
    }
  }, {
    sequelize,
    tableName: 'terminal_type',
    schema: 'gri',
    timestamps: false,
    indexes: [
      {
        name: "pk_term_type_code",
        unique: true,
        fields: [
          { name: "term_type_code" },
        ]
      },
    ]
  });
  }
}
