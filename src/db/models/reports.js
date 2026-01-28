import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Reports extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    rptCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'rpt_code'
    },
    rptType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'rpt_type'
    },
    rptTargetCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'rpt_target_code'
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
    rptReason: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'rpt_reason'
    },
    rptDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rpt_description'
    },
    rptStatus: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "pending",
      field: 'rpt_status'
    },
    rptSeverity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      field: 'rpt_severity'
    },
    rptCreatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'rpt_created_at'
    },
    rptUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'rpt_updated_at'
    }
  }, {
    sequelize,
    tableName: 'reports',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "idx_reports_created_at",
        fields: [
          { name: "rpt_created_at", order: "DESC" },
        ]
      },
      {
        name: "idx_reports_status_severity",
        fields: [
          { name: "rpt_status" },
          { name: "rpt_severity", order: "DESC" },
        ]
      },
      {
        name: "idx_reports_target",
        fields: [
          { name: "rpt_type" },
          { name: "rpt_target_code" },
        ]
      },
      {
        name: "idx_reports_usr_code",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "reports_pkey",
        unique: true,
        fields: [
          { name: "rpt_code" },
        ]
      },
    ]
  });
  }
}
