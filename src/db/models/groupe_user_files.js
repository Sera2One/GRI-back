import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class GroupeUserFiles extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    gufCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'guf_code'
    },
    gumesCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'groupe_user_message',
        key: 'gumes_code'
      },
      field: 'gumes_code'
    },
    gunCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'groupe_user_name',
        key: 'gun_code'
      },
      field: 'gun_code'
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
    gufName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'guf_name'
    },
    gufPath: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'guf_path'
    },
    gufType: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'guf_type'
    },
    gufSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'guf_size'
    },
    gufIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'guf_is_deleted'
    },
    gufCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'guf_created_date'
    },
    gufDeletedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'guf_deleted_date'
    }
  }, {
    sequelize,
    tableName: 'groupe_user_files',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "pk_groupe_user_files",
        unique: true,
        fields: [
          { name: "guf_code" },
        ]
      },
    ]
  });
  }
}
