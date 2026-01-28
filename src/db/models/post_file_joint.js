import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PostFileJoint extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    pfjCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'pfj_code'
    },
    postCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'post',
        key: 'post_code'
      },
      field: 'post_code'
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
    pfjPath: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'pfj_path'
    },
    pfjType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'pfj_type'
    },
    pfjSize: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'pfj_size'
    },
    pfjName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'pfj_name'
    },
    pfjIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'pfj_is_deleted'
    },
    pfjIsDeletedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'pfj_is_deleted_by'
    },
    pfjCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'pfj_created_date'
    },
    pfjDeletedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'pfj_deleted_date'
    }
  }, {
    sequelize,
    tableName: 'post_file_joint',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "pk_pfj",
        unique: true,
        fields: [
          { name: "pfj_code" },
        ]
      },
    ]
  });
  }
}
