import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PostReactions extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    pReactCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'p_react_code'
    },
    postCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'post',
        key: 'post_code'
      },
      unique: "post_reactions_post_code_usr_code_p_react_reaction_key",
      field: 'post_code'
    },
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      unique: "post_reactions_post_code_usr_code_p_react_reaction_key",
      field: 'usr_code'
    },
    pReactReaction: {
      type: DataTypes.ENUM("like","love","laugh","wow","sad","angry"),
      allowNull: false,
      unique: "post_reactions_post_code_usr_code_p_react_reaction_key",
      field: 'p_react_reaction'
    },
    pReactCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now'),
      field: 'p_react_created_date'
    }
  }, {
    sequelize,
    tableName: 'post_reactions',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "idx_post_reactions_post_id",
        fields: [
          { name: "post_code" },
        ]
      },
      {
        name: "idx_post_reactions_user_id",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "post_reactions_pkey",
        unique: true,
        fields: [
          { name: "p_react_code" },
        ]
      },
      {
        name: "post_reactions_post_code_usr_code_p_react_reaction_key",
        unique: true,
        fields: [
          { name: "post_code" },
          { name: "usr_code" },
          { name: "p_react_reaction" },
        ]
      },
    ]
  });
  }
}
