import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UserFieldVisibility extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    ufvCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'ufv_code'
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
    ufvFieldName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'ufv_field_name'
    },
    ufvVisibility: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'ufv_visibility'
    },
    ufvCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'ufv_created_date'
    }
  }, {
    sequelize,
    tableName: 'user_field_visibility',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "idx_ufv_user",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "idx_ufv_user_field",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "ufv_field_name" },
        ]
      },
      {
        name: "pk_user_field_visibility",
        unique: true,
        fields: [
          { name: "ufv_code" },
        ]
      },
    ]
  });
  }
}
