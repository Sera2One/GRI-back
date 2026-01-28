import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class State extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    stateCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'state_code'
    },
    stateName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'state_name'
    },
    stateDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'state_description'
    },
    stateModif: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'state_modif'
    },
    stateIsReaded: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'state_is_readed'
    },
    stateIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'state_is_deleted'
    },
    stateCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'state_created_date'
    },
    stateModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'state_modif_date'
    }
  }, {
    sequelize,
    tableName: 'state',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "pk_state",
        unique: true,
        fields: [
          { name: "state_code" },
        ]
      },
      {
        name: "state_pk",
        unique: true,
        fields: [
          { name: "state_code" },
        ]
      },
    ]
  });
  }
}
