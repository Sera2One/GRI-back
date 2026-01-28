import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Groupes extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    grpCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'grp_code'
    },
    mtrCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'metiers',
        key: 'mtr_code'
      },
      field: 'mtr_code'
    },
    grpName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'grp_name'
    },
    grpDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'grp_description'
    },
    grpCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'grp_created_date'
    }
  }, {
    sequelize,
    tableName: 'groupes',
    schema: 'pe',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "association_groupe_metier2_fk",
        fields: [
          { name: "mtr_code" },
        ]
      },
      {
        name: "groupes_pk",
        unique: true,
        fields: [
          { name: "grp_code" },
        ]
      },
      {
        name: "pk_groupes",
        unique: true,
        fields: [
          { name: "grp_code" },
        ]
      },
    ]
  });
  }
}
