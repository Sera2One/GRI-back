import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HistoryGroupeAcces extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    histGrpACode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'hist_grp_a_code'
    },
    histGrpADate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'hist_grp_a_date'
    },
    histGrpAAction: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'hist_grp_a_action'
    },
    histGrpAUser: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'hist_grp_a_user'
    },
    histGrpAComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'hist_grp_a_comment'
    },
    grpCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'groupes',
        key: 'grp_code'
      },
      field: 'grp_code'
    },
    accesType: {
      type: DataTypes.ENUM("MODULE","MENU","PAGE","COMPONENT","BUTTON"),
      allowNull: false,
      field: 'acces_type'
    },
    accesCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'acces_code'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    sequelize,
    tableName: 'history_groupe_acces',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "pk_history_groupe_acces",
        unique: true,
        fields: [
          { name: "hist_grp_a_code" },
        ]
      },
    ]
  });
  }
}
