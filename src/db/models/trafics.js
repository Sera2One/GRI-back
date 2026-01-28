import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Trafics extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    traficCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'trafic_code'
    },
    termCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'terminaux',
        key: 'term_code'
      },
      field: 'term_code'
    },
    traficInfo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'trafic_info'
    },
    traficModif: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'trafic_modif'
    },
    traficCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'trafic_created_date'
    }
  }, {
    sequelize,
    tableName: 'trafics',
    schema: 'gri',
    timestamps: false,
    indexes: [
      {
        name: "generate_fk",
        fields: [
          { name: "term_code" },
        ]
      },
      {
        name: "pk_trafics",
        unique: true,
        fields: [
          { name: "trafic_code" },
        ]
      },
      {
        name: "trafics_pk",
        unique: true,
        fields: [
          { name: "trafic_code" },
        ]
      },
    ]
  });
  }
}
