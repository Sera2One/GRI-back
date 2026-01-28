import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Comment extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    cmtCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'cmt_code'
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
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'usr_code'
    },
    cmtRootCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'cmt_root_code'
    },
    cmtParentCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'cmt_parent_code'
    },
    cmtDeleteBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'cmt_delete_by'
    },
    cmtResponseLv: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'cmt_response_lv'
    },
    cmtContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cmt_content'
    },
    cmtIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'cmt_is_deleted'
    },
    cmtSaveAsHistory: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'cmt_save_as_history'
    },
    cmtCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'cmt_created_date'
    },
    cmtModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cmt_modif_date'
    }
  }, {
    sequelize,
    tableName: 'comment',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "comment_cmt_code_idx",
        fields: [
          { name: "cmt_code" },
        ]
      },
      {
        name: "comment_delete_by_idx",
        fields: [
          { name: "cmt_delete_by" },
        ]
      },
      {
        name: "comment_delete_idx",
        fields: [
          { name: "cmt_is_deleted" },
        ]
      },
      {
        name: "comment_parent_cmt_code_idx",
        fields: [
          { name: "cmt_parent_code" },
        ]
      },
      {
        name: "comment_post_code_idx",
        fields: [
          { name: "post_code" },
        ]
      },
      {
        name: "comment_root_cmt_code_idx",
        fields: [
          { name: "cmt_root_code" },
        ]
      },
      {
        name: "comment_save_as_history_idx",
        fields: [
          { name: "cmt_save_as_history" },
        ]
      },
      {
        name: "comment_usr_code_idx",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "pk_comment",
        unique: true,
        fields: [
          { name: "cmt_code" },
        ]
      },
    ]
  });
  }
}
