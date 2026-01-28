import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class NetScanView extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    netScanCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'net_scan_code'
    },
    netScanMac: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_mac'
    },
    netScanIpAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_ip_address'
    },
    netScanHostname: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_hostname'
    },
    netScanOperatingSystem: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_operating_system'
    },
    netScanDevicesType: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_devices_type'
    },
    netScanSnmpIsOn: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'net_scan_snmp_is_on'
    },
    netScanHasClientApp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'net_scan_has_client_app'
    },
    netScanInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'net_scan_info'
    },
    netDevicesIsOk: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'net_devices_is_ok'
    },
    netScanDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'net_scan_date'
    },
    usrCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'usr_code'
    },
    termCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_code'
    },
    termAdresseMac: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_adresse_mac'
    },
    usrName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'usr_name'
    },
    usrFirstname: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'usr_firstname'
    },
    usrImg: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'usr_img'
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
    gIpCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'g_ip_code'
    },
    termTypeCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_type_code'
    },
    termMarque: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_marque'
    },
    termModele: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_modele'
    },
    termNumeroDeSerie: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_numero_de_serie'
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
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_cpu_soc'
    },
    termNumberOfCpu: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'term_number_of_cpu'
    },
    termRam: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_ram'
    },
    termStartUpTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'term_start_up_time'
    },
    termInterfaceConnexion: {
      type: DataTypes.STRING,
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
    hipaCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'hipa_code'
    },
    termIsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'term_is_deleted'
    },
    hipaIpAddresse: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'hipa_ip_addresse'
    },
    hipaCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'hipa_created_date'
    },
    termTypeUserCodeAdd: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_type_user_code_add'
    },
    termTypeDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'term_type_description'
    },
    termTypeImgDescription: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_type_img_description'
    },
    termTypeCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'term_type_created_date'
    },
    termTypeName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'term_type_name'
    },
    gIpName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'g_ip_name'
    },
    gIpDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'g_ip_description'
    },
    gIpPlage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'g_ip_plage'
    },
    gIpCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'g_ip_created_date'
    },
    etat: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'net_scan_view',
    schema: 'gri',
    timestamps: false
  });
  }
}
