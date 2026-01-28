import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class GroupeAccesView extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    grpCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'grp_code'
    },
    grpName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'grp_name'
    },
    grpDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'grp_description'
    },
    entityType: {
      type: DataTypes.ENUM("MODULE","MENU","PAGE","COMPONENT","BUTTON"),
      allowNull: true,
      field: 'entity_type'
    },
    entityCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'entity_code'
    },
    entityName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'entity_name'
    },
    entityDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'entity_description'
    },
    btnModif: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'btn_modif'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'is_active'
    },
    extraValue: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'extra_value'
    },
    grpAccesCreatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'grp_acces_created_at'
    },
    grpAccesUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'grp_acces_updated_at'
    },
    histGrpACode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'hist_grp_a_code'
    },
    moduleSource: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'module_source'
    }
  }, {
    sequelize,
    tableName: 'groupe_acces_view',
    schema: 'pe',
    timestamps: false
  });
  }
}
