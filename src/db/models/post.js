import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Post extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    postCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'post_code'
    },
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'usr_code'
      },
      field: 'usr_code'
    },
    postTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'post_title'
    },
    postDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'post_description'
    },
    postNbrSeen: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'post_nbr_seen'
    },
    postUsrCodeSeenList: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'post_usr_code_seen_list'
    },
    postIsValided: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'post_is_valided'
    },
    postIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'post_is_deleted'
    },
    postModif: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'post_modif'
    },
    postCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'post_created_date'
    },
    postModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'post_modif_date'
    },
    postIsPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'post_is_public'
    }
  }, {
    sequelize,
    tableName: 'post',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "add_post_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "pk_post",
        unique: true,
        fields: [
          { name: "post_code" },
        ]
      },
      {
        name: "post_pk",
        unique: true,
        fields: [
          { name: "post_code" },
        ]
      },
    ]
  });
  }
}
