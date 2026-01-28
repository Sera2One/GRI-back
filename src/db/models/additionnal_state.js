import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class AdditionnalState extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    msgCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'messages',
        key: 'msg_code'
      },
      field: 'msg_code'
    },
    stateCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'state',
        key: 'state_code'
      },
      field: 'state_code'
    }
  }, {
    sequelize,
    tableName: 'additionnal_state',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "additionnal_state2_fk",
        fields: [
          { name: "state_code" },
        ]
      },
      {
        name: "additionnal_state_fk",
        fields: [
          { name: "msg_code" },
        ]
      },
      {
        name: "additionnal_state_pk",
        unique: true,
        fields: [
          { name: "msg_code" },
          { name: "state_code" },
        ]
      },
      {
        name: "pk_additionnal_state",
        unique: true,
        fields: [
          { name: "msg_code" },
          { name: "state_code" },
        ]
      },
    ]
  });
  }
}
