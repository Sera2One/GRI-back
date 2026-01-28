import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PinnedPost extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    ppCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'pp_code'
    },
    postCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'post',
        key: 'post_code'
      },
      field: 'post_code'
    },
    ppCustomeTitle: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'pp_custome_title'
    },
    ppOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'pp_order'
    },
    ppIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'pp_is_deleted'
    },
    ppUserCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'pp_user_code'
    },
    ppCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'pp_created_date'
    }
  }, {
    sequelize,
    tableName: 'pinned_post',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "add_pinned_post_fk",
        fields: [
          { name: "post_code" },
        ]
      },
      {
        name: "pinned_post_pk",
        unique: true,
        fields: [
          { name: "pp_code" },
        ]
      },
      {
        name: "pk_pinned_post",
        unique: true,
        fields: [
          { name: "pp_code" },
        ]
      },
    ]
  });
  }
}
