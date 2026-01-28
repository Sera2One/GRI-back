import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class GroupeAcces extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    grpAccesCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "(grp-acces-",
      field: 'grp_acces_code'
    },
    grpCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'groupes',
        key: 'grp_code'
      },
      field: 'grp_code'
    },
    accesType: {
      type: DataTypes.ENUM("MODULE","MENU","PAGE","COMPONENT","BUTTON"),
      allowNull: false,
      primaryKey: true,
      field: 'acces_type'
    },
    accesCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'acces_code'
    },
    histGrpACode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'history_groupe_acces',
        key: 'hist_grp_a_code'
      },
      field: 'hist_grp_a_code'
    },
    grpAccesIsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'grp_acces_is_active'
    },
    grpAccesCreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'grp_acces_created_at'
    },
    grpAccesUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'grp_acces_updated_at'
    },
    grpAccesExtraValue: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'grp_acces_extra_value'
    }
  }, {
    sequelize,
    tableName: 'groupe_acces',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "idx_grp_acces_active",
        fields: [
          { name: "grp_acces_is_active" },
        ]
      },
      {
        name: "idx_grp_acces_entity",
        fields: [
          { name: "acces_type" },
          { name: "acces_code" },
        ]
      },
      {
        name: "idx_grp_acces_hist",
        fields: [
          { name: "hist_grp_a_code" },
        ]
      },
      {
        name: "pk_groupe_acces",
        unique: true,
        fields: [
          { name: "grp_code" },
          { name: "acces_type" },
          { name: "acces_code" },
        ]
      },
    ]
  });
  }
}
