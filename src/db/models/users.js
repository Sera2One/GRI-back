import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Users extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    usrCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'usr_code'
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
    usrName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'usr_name'
    },
    usrFirstname: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'usr_firstname'
    },
    usrContact: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'usr_contact'
    },
    usrMail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'usr_mail'
    },
    usrLogin: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'usr_login'
    },
    usrImg: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'usr_img'
    },
    usrGender: {
      type: DataTypes.STRING(15),
      allowNull: true,
      field: 'usr_gender'
    },
    usrDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'usr_description'
    },
    usrPassword: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Hashed password using bcrypt",
      field: 'usr_password'
    },
    usrIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'usr_is_deleted'
    },
    usrIsValided: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'usr_is_valided'
    },
    usrCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'usr_created_date'
    },
    usrNickName: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'usr_nick_name'
    },
    usrAddresse: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'usr_addresse'
    },
    usrBio: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'usr_bio'
    },
    usrLanguage: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'usr_language'
    },
    usrWork: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'usr_work'
    },
    usrTheme: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'usr_theme'
    },
    usrDefaultVisibility: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "public",
      field: 'usr_default_visibility'
    },
    usrIsOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'usr_is_online'
    },
    usrHideOnlineState: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'usr_hide_online_state'
    },
    usrLastOnlineDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'usr_last_online_date'
    }
  }, {
    sequelize,
    tableName: 'users',
    schema: 'pe',
    timestamps: false,
    indexes: [
      {
        name: "membre_fk",
        fields: [
          { name: "grp_code" },
        ]
      },
      {
        name: "pk_users",
        unique: true,
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "users_pk",
        unique: true,
        fields: [
          { name: "usr_code" },
        ]
      },
    ]
  });
  }
}
