import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PostHistoryModif extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    phmCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'phm_code'
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
    postCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'post',
        key: 'post_code'
      },
      field: 'post_code'
    },
    phmModifDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'phm_modif_description'
    },
    phmCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'phm_created_date'
    }
  }, {
    sequelize,
    tableName: 'post_history_modif',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "pk_phm",
        unique: true,
        fields: [
          { name: "phm_code" },
        ]
      },
    ]
  });
  }
}
