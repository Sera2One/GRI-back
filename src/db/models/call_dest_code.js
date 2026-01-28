import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CallDestCode extends Model {
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
    callCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'call',
        key: 'call_code'
      },
      field: 'call_code'
    },
    callDestIsAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'call_dest_is_accepted'
    },
    callDest: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'call_dest'
    },
    callDestCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'call_dest_created_date'
    }
  }, {
    sequelize,
    tableName: 'call_dest_code',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "call_dest_code2_fk",
        fields: [
          { name: "call_code" },
        ]
      },
      {
        name: "call_dest_code_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "call_dest_code_pk",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "call_code" },
        ]
      },
      {
        name: "pk_call_dest_code",
        unique: true,
        fields: [
          { name: "usr_code" },
          { name: "call_code" },
        ]
      },
    ]
  });
  }
}
