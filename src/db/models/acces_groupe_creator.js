import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class AccesGroupeCreator extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    grpCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'groupes',
        key: 'grp_code'
      },
      field: 'grp_code'
    },
    usrCreatorCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'usr_creator_list',
        key: 'usr_creator_code'
      },
      field: 'usr_creator_code'
    }
  }, {
    sequelize,
    tableName: 'acces_groupe_creator',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "acces_groupe_creator2_fk",
        fields: [
          { name: "usr_creator_code" },
        ]
      },
      {
        name: "acces_groupe_creator_fk",
        fields: [
          { name: "grp_code" },
        ]
      },
      {
        name: "acces_groupe_creator_pk",
        unique: true,
        fields: [
          { name: "grp_code" },
          { name: "usr_creator_code" },
        ]
      },
      {
        name: "pk_acces_groupe_creator",
        unique: true,
        fields: [
          { name: "grp_code" },
          { name: "usr_creator_code" },
        ]
      },
    ]
  });
  }
}
