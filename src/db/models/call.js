import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Call extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    callCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'call_code'
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
    callIsMissed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'call_is_missed'
    },
    callCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'call_created_date'
    }
  }, {
    sequelize,
    tableName: 'call',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "call_pk",
        unique: true,
        fields: [
          { name: "call_code" },
        ]
      },
      {
        name: "calling_user_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "pk_call",
        unique: true,
        fields: [
          { name: "call_code" },
        ]
      },
    ]
  });
  }
}
