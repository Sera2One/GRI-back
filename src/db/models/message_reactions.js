import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class MessageReactions extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    mReactCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'm_react_code'
    },
    msgCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "message_reactions_msg_code_usr_code_m_react_reaction_key",
      field: 'msg_code'
    },
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      unique: "message_reactions_msg_code_usr_code_m_react_reaction_key",
      field: 'usr_code'
    },
    mReactReaction: {
      type: DataTypes.ENUM("like","love","laugh","wow","sad","angry"),
      allowNull: false,
      unique: "message_reactions_msg_code_usr_code_m_react_reaction_key",
      field: 'm_react_reaction'
    },
    mReactCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'm_react_created_date'
    }
  }, {
    sequelize,
    tableName: 'message_reactions',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "idx_message_reactions_msg_code",
        fields: [
          { name: "msg_code" },
        ]
      },
      {
        name: "idx_message_reactions_reaction",
        fields: [
          { name: "m_react_reaction" },
        ]
      },
      {
        name: "idx_message_reactions_usr_code",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "message_reactions_msg_code_usr_code_m_react_reaction_key",
        unique: true,
        fields: [
          { name: "msg_code" },
          { name: "usr_code" },
          { name: "m_react_reaction" },
        ]
      },
      {
        name: "message_reactions_pkey",
        unique: true,
        fields: [
          { name: "m_react_code" },
        ]
      },
    ]
  });
  }
}
