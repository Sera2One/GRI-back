import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class GroupeUserName extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    gunCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'gun_code'
    },
    gunName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'gun_name'
    },
    gunDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'gun_description'
    },
    gunImg: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'gun_img'
    },
    gunCreatedBy: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'gun_created_by'
    },
    gunIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'gun_is_deleted'
    },
    gunCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'gun_created_date'
    }
  }, {
    sequelize,
    tableName: 'groupe_user_name',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "idx_gun_created_by",
        fields: [
          { name: "gun_created_by" },
        ]
      },
      {
        name: "idx_gun_is_deleted",
        fields: [
          { name: "gun_is_deleted" },
        ]
      },
      {
        name: "pk_groupe_user_name",
        unique: true,
        fields: [
          { name: "gun_code" },
        ]
      },
    ]
  });
  }
}
