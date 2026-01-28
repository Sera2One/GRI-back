import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ListUserCreated extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'usr_code'
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
    },
    createdDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'created_date'
    }
  }, {
    sequelize,
    tableName: 'list_user_created',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "list_user_created2_fk",
        fields: [
          { name: "usr_creator_code" },
        ]
      },
      {
        name: "list_user_created_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "list_user_created_pk",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "usr_creator_code" },
        ]
      },
      {
        name: "pk_list_user_created",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "usr_creator_code" },
        ]
      },
    ]
  });
  }
}
