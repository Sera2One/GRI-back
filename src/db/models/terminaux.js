import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Terminaux extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    termCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'term_code'
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
    gIpCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'groupe_ip',
        key: 'g_ip_code'
      },
      field: 'g_ip_code'
    },
    termTypeCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'terminal_type',
        key: 'term_type_code'
      },
      field: 'term_type_code'
    },
    termMarque: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'term_marque'
    },
    termModele: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'term_modele'
    },
    termNumeroDeSerie: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'term_numero_de_serie'
    },
    termAdresseMac: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'term_adresse_mac'
    },
    termProblemeDetecte: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'term_probleme_detecte'
    },
    termImages: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'term_images'
    },
    termIsSmnpActived: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'term_is_smnp_actived'
    },
    termIsClientAppInstalled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'term_is_client_app_installed'
    },
    termIsOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'term_is_online'
    },
    termCpuSoc: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'term_cpu_soc'
    },
    termNumberOfCpu: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'term_number_of_cpu'
    },
    termRam: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'term_ram'
    },
    termStartUpTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'term_start_up_time'
    },
    termInterfaceConnexion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'term_interface_connexion'
    },
    termAdditionnalInformations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'term_additionnal_informations'
    },
    termCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'term_created_date'
    },
    termModifDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'term_modif_date'
    },
    termIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'term_is_deleted'
    },
    hipaCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'history_ip_address',
        key: 'hipa_code'
      },
      field: 'hipa_code'
    }
  }, {
    sequelize,
    tableName: 'terminaux',
    schema: 'gri',
    timestamps: false,
    indexes: [
      {
        name: "devices_owner_fk",
        fields: [
          { name: "usr_code" },
        ]
      },
      {
        name: "include_fk",
        fields: [
          { name: "g_ip_code" },
        ]
      },
      {
        name: "include_terminal_type_fk",
        fields: [
          { name: "term_type_code" },
        ]
      },
      {
        name: "pk_terminaux",
        unique: true,
        fields: [
          { name: "term_code" },
        ]
      },
      {
        name: "terminaux_hipa_code_idx",
        fields: [
          { name: "hipa_code" },
        ]
      },
      {
        name: "terminaux_pk",
        unique: true,
        fields: [
          { name: "term_code" },
        ]
      },
      {
        name: "terminaux_term_adresse_mac_idx",
        fields: [
          { name: "term_adresse_mac" },
        ]
      },
    ]
  });
  }
}
