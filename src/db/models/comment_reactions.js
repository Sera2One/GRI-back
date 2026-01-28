import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CommentReactions extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    cReactCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'c_react_code'
    },
    postCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'post',
        key: 'post_code'
      },
      unique: "comment_reactions_post_code_cmt_code_usr_code_c_react_react_key",
      field: 'post_code'
    },
    cmtCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "comment_reactions_post_code_cmt_code_usr_code_c_react_react_key",
      field: 'cmt_code'
    },
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      unique: "comment_reactions_post_code_cmt_code_usr_code_c_react_react_key",
      field: 'usr_code'
    },
    cReactReaction: {
      type: DataTypes.ENUM("like","love","laugh","wow","sad","angry"),
      allowNull: false,
      unique: "comment_reactions_post_code_cmt_code_usr_code_c_react_react_key",
      field: 'c_react_reaction'
    },
    cReactCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'c_react_created_date'
    }
  }, {
    sequelize,
    tableName: 'comment_reactions',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "comment_reactions_pkey",
        unique: true,
        fields: [
          { name: "c_react_code" },
        ]
      },
      {
        name: "comment_reactions_post_code_cmt_code_usr_code_c_react_react_key",
        unique: true,
        fields: [
          { name: "post_code" },
          { name: "cmt_code" },
          { name: "usr_code" },
          { name: "c_react_reaction" },
        ]
      },
      {
        name: "idx_comment_reactions_comment_id",
        fields: [
          { name: "cmt_code" },
        ]
      },
      {
        name: "idx_comment_reactions_comment_post_id",
        fields: [
          { name: "post_code" },
        ]
      },
      {
        name: "idx_comment_reactions_comment_user_id",
        fields: [
          { name: "usr_code" },
        ]
      },
    ]
  });
  }
}
