import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class MotDePasseOublie extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    mdpoCode: {
      type: DataTypes.STRING(250),
      allowNull: false,
      primaryKey: true,
      field: 'mdpo_code'
    },
    usrCode: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'usr_code'
    },
    mdpoDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'mdpo_date'
    },
    mdpoExpireDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'mdpo_expire_date'
    },
    mdpoInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'mdpo_info'
    },
    mdpOtp: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'mdp_otp'
    },
    mdpStatus: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'mdp_status'
    }
  }, {
    sequelize,
    tableName: 'mot_de_passe_oublie',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "pk_mot_de_passe_oublie",
        unique: true,
        fields: [
          { name: "mdpo_code" },
        ]
      },
    ]
  });
  }
}
