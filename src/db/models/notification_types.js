import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class NotificationTypes extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    notifType: {
      type: DataTypes.ENUM("COMMENT_POSTED","COMMENT_REPLIED","MESSAGE_RECEIVED","CALL_INVITATION","GROUP_INVITATION","USER_VALIDATION_REQUEST","USER_VALIDATED","USER_REJECTED","ACCESS_GRANTED","FILE_ARCHIVED","MENTION","CALL_STARTED","NEW_","MISSED_CALL","ROLE_CHANGED","REPORT_CREATED"),
      allowNull: false,
      primaryKey: true,
      field: 'notif_type'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    defaultTtlHours: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'default_ttl_hours'
    }
  }, {
    sequelize,
    tableName: 'notification_types',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "notification_types_pkey",
        unique: true,
        fields: [
          { name: "notif_type" },
        ]
      },
    ]
  });
  }
}
