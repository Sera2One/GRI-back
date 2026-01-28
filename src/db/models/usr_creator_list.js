import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UsrCreatorList extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    usrCreatorCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'usr_creator_code'
    },
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'usr_code'
    },
    usrCreatorDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'usr_creator_date'
    }
  }, {
    sequelize,
    tableName: 'usr_creator_list',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "add_user_creator_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "pk_usr_creator_list",
        unique: true,
        fields: [
          { name: "usr_creator_code" },
        ]
      },
      {
        name: "usr_creator_list_pk",
        unique: true,
        fields: [
          { name: "usr_creator_code" },
        ]
      },
    ]
  });
  }
}
